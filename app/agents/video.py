import asyncio
import json
import logging
import cv2
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from state import IncidentState
from config.logging_config import get_logger
from services.azure_vision import process_image
# from services.azure_video_indexer import download_thumbnail, get_video_thumbnails  # Commented out - using direct frame extraction

logger = get_logger(__name__)

def extract_frames_from_video(video_bytes: bytes, frame_interval: int = 30) -> list:
    """Extract frames from video bytes at specified intervals."""
    frames = []
    import tempfile
    import os
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
            temp_file.write(video_bytes)
            temp_path = temp_file.name
        
        # Open video with OpenCV
        cap = cv2.VideoCapture(temp_path)
        
        if not cap.isOpened():
            logger.error("Failed to open video file")
            os.unlink(temp_path)
            return frames
        
        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % frame_interval == 0:
                # Convert frame to bytes
                success, buffer = cv2.imencode('.jpg', frame)
                if success:
                    frame_bytes = buffer.tobytes()
                    frames.append((f"frame_{frame_count}", frame_bytes))
            
            frame_count += 1
        
        cap.release()
        os.unlink(temp_path)  # Clean up temp file
        logger.info(f"Extracted {len(frames)} frames from video")
        return frames
    
    except Exception as e:
        logger.error(f"Failed to extract frames from video: {e}", exc_info=True)
        return frames
    """Extract relevant data from Video Indexer insights JSON."""
    if not insights:
        return {}

    # Extract detected objects
    objects = []
    if 'videos' in insights and insights['videos']:
        video = insights['videos'][0]
        if 'insights' in video:
            ins = video['insights']
            # Objects
            if 'objects' in ins:
                for obj in ins['objects']:
                    objects.append({
                        'object': obj.get('name', 'unknown'),
                        'confidence': obj.get('confidence', 0.0),
                        'instances': len(obj.get('instances', []))
                    })
            # People
            people_count = 0
            if 'faces' in ins:
                people_count = len(ins['faces'])
            # Transcript
            transcript = ""
            if 'transcript' in ins:
                transcript_blocks = ins['transcript']
                transcript = " ".join([block.get('text', '') for block in transcript_blocks])

    return {
        'insights_objects': len(objects),
        'insights_people': people_count,
        'transcript': transcript[:500],  # Limit transcript length
        'detected_objects': objects[:10]  # Top 10 objects
    }

async def process_frame_async(frame_data: bytes, frame_id: str) -> dict:
    """Process a single frame asynchronously."""
    try:
        logger.debug(f"Processing frame {frame_id}")
        result = await asyncio.get_event_loop().run_in_executor(
            None, process_image, frame_data
        )
        result['frame_id'] = frame_id
        
        # Log significant findings
        if result.get('processed', False):
            objects_count = len(result.get('objects', []))
            people_count = len(result.get('people', []))
            caption = result.get('caption', {}).get('text', '')
            
            if objects_count > 0 or people_count > 0 or caption:
                logger.debug(f"Frame {frame_id} results: {objects_count} objects, {people_count} people, caption: {caption[:30]}...")
        
        return result
    except Exception as e:
        logger.error(f"Failed to process frame {frame_id}: {e}", exc_info=True)
        return {
            "frame_id": frame_id,
            "processed": False,
            "error": str(e),
            "objects": [],
            "people": [],
            "text": "",
            "caption": ""
        }

def video_react_node(state: IncidentState) -> IncidentState:
    incident_id = state.get("incident_id", "unknown")
    logger.info(f"[INCIDENT-{incident_id}] [VIDEO] Starting video analysis node")

    video_data = state.get("video_observation")
    if not video_data:
        logger.warning(f"[INCIDENT-{incident_id}] [VIDEO] No video observation provided")
        state["video_signal"] = {}
        return state

    # NEW: Extract video bytes and process frames directly
    video_bytes = video_data.get("video_bytes")
    if not video_bytes:
        logger.warning(f"[INCIDENT-{incident_id}] [VIDEO] No video bytes provided")
        state["video_signal"] = {}
        return state

    logger.info(f"[INCIDENT-{incident_id}] [VIDEO] Extracting frames from video for parallel vision analysis")

    # Extract frames from video
    frames = extract_frames_from_video(video_bytes, frame_interval=30)  # Extract every 30th frame

    if not frames:
        logger.warning(f"[INCIDENT-{incident_id}] [VIDEO] No frames extracted from video")
        state["video_signal"] = {}
        return state

    logger.info(f"[INCIDENT-{incident_id}] [VIDEO] Processing {len(frames)} frames in parallel")

    # Create async tasks for parallel processing
    async def process_all_frames():
        tasks = []
        for frame_id, frame_data in frames:
            tasks.append(process_frame_async(frame_data, frame_id))
        
        if tasks:
            logger.info(f"Starting parallel processing of {len(tasks)} frames...")
            return await asyncio.gather(*tasks)
        return []

    # Run parallel processing
    try:
        frame_results = asyncio.run(process_all_frames())
        logger.info(f"[INCIDENT-{incident_id}] [VIDEO] Processed {len(frame_results)} frames")

        # Aggregate frame results
        aggregated_result = aggregate_frame_results(frame_results)

    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [VIDEO] Frame processing failed: {str(e)}", exc_info=True)
        state["video_signal"] = {}
        return state

    # Log aggregated results
    logger.info("=== VIDEO ANALYSIS SUMMARY ===")
    if aggregated_result.get('total_frames'):
        logger.info(f"Frames processed: {aggregated_result['total_frames']}")
        logger.info(f"Total objects from frames: {aggregated_result['total_objects_detected']}")
        logger.info(f"Total people from frames: {aggregated_result['total_people_detected']}")
    logger.info("=== END VIDEO ANALYSIS SUMMARY ===")

    # Use LLM to analyze aggregated results for incidents
    llm = state["llm"]
    analysis_prompt = f"""
You are a highly reliable VIDEO incident detector for a retail AI system.
Given aggregated visual observations from video frames, output strict JSON object with these fields only:
{{
  "is_incident": <bool>,
  "scenario_label": <str>,
  "confidence": <float between 0 and 1>,
  "evidence_used": <str>
}}
Example:
{{"is_incident":true,"scenario_label":"theft","confidence":0.95,"evidence_used":"frames show person with gun, fighting detected"}}

AGGREGATED OBSERVATIONS: {aggregated_result}
Do NOT add any explanation outside JSON.
"""

    try:
        resp = llm.invoke(analysis_prompt)
        state["video_signal"] = json.loads(resp if isinstance(resp, str) else resp.content)

        is_incident = state["video_signal"].get("is_incident", False)
        scenario = state["video_signal"].get("scenario_label", "unknown")
        confidence = state["video_signal"].get("confidence", 0.0)
        evidence = state["video_signal"].get("evidence_used", "")
        
        logger.info("=== VIDEO INCIDENT DETECTION RESULT ===")
        logger.info(f"Incident Detected: {is_incident}")
        logger.info(f"Scenario: {scenario}")
        logger.info(f"Confidence: {confidence:.2f}")
        logger.info(f"Evidence: {evidence}")
        logger.info("=== END VIDEO INCIDENT DETECTION ===")

    except Exception as e:
        logger.error(f"[INCIDENT-{incident_id}] [VIDEO] Video analysis failed: {str(e)}", exc_info=True)
        state["video_signal"] = {}
        state.setdefault("episode_memory", []).append(f"VIDEO ANALYSIS ERROR: {str(e)}")

    return state

def aggregate_frame_results(frame_results: list) -> dict:
    """Aggregate results from multiple frames."""
    total_objects = 0
    total_people = 0
    all_captions = []
    all_texts = []
    object_counts = {}
    people_counts = {}

    logger.info(f"Aggregating results from {len(frame_results)} frames...")

    for result in frame_results:
        if result.get("processed"):
            # Fix: objects is a dict with 'values' key
            objects_list = result.get("objects", {}).get("values", [])
            frame_objects = len(objects_list)
            # Fix: people is a dict with 'values' key  
            people_list = result.get("people", {}).get("values", [])
            frame_people = len(people_list)
            total_objects += frame_objects
            total_people += frame_people
            
            # Log significant detections per frame
            frame_id = result.get('frame_id', 'unknown')
            if frame_objects > 0 or frame_people > 0:
                logger.debug(f"Frame {frame_id}: {frame_objects} objects, {frame_people} people")
            
            caption = result.get("caption", {}).get("text", "")
            if caption:
                all_captions.append(caption)
            text = result.get("text", "")
            if text:
                all_texts.append(text)

            # Count object types - fix: obj has 'tags' with name
            for obj in objects_list:
                tags = obj.get("tags", [])
                if tags:
                    obj_name = tags[0].get("name", "unknown")
                    object_counts[obj_name] = object_counts.get(obj_name, 0) + 1

    logger.info(f"Aggregation complete: {total_objects} total objects, {total_people} total people across {len(frame_results)} frames")

    return {
        "total_frames": len(frame_results),
        "total_objects_detected": total_objects,
        "total_people_detected": total_people,
        "unique_object_types": list(object_counts.keys()),
        "object_counts": object_counts,
        "captions": all_captions[:5],  # Limit to first 5 captions
        "extracted_texts": all_texts[:5]  # Limit to first 5 texts
    }