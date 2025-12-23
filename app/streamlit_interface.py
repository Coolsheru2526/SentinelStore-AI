import streamlit as st
import requests
import base64
import json

BACKEND_URL = "http://localhost:8000"

st.set_page_config(layout="wide")
st.title("🛒 Autonomous Retail Incident Manager — Testbench")

st.markdown("""
Upload **image**, **audio**, or **video**.  
The system will:
- Reason using VLMs + Speech + Video Analysis
- Assess risk
- Trigger autonomous actions
- Request human approval if required
""")

# ------------------------
# INCIDENT CREATION
# ------------------------

st.header("📸 Incident Observation Input")

store_id = st.text_input("Store ID", value="store_1")

col1, col2, col3 = st.columns(3)

vision_data = None
audio_data = None
video_data = None

with col1:
    vision_img = st.file_uploader(
        "Vision Observation (Image)",
        type=["jpg", "jpeg", "png", "bmp"]
    )
    if vision_img:
        st.image(vision_img, use_column_width=True)
        vision_data = base64.b64encode(vision_img.getvalue()).decode()

with col2:
    audio_file = st.file_uploader(
        "Audio Observation (Audio)",
        type=["wav", "mp3", "m4a", "ogg"]
    )
    if audio_file:
        st.audio(audio_file)
        audio_data = base64.b64encode(audio_file.getvalue()).decode()

with col3:
    video_file = st.file_uploader(
        "Video Observation (Video)",
        type=["mp4", "avi", "mov", "mkv"]
    )
    if video_file:
        st.video(video_file)
        video_data = base64.b64encode(video_file.getvalue()).decode()

if st.button("🚨 Submit Incident", type="primary"):
    payload = {
        "store_id": store_id
    }
    if vision_data:
        payload["vision_observation"] = vision_data
    if audio_data:
        payload["audio_observation"] = audio_data
    if video_data:
        payload["video_observation"] = video_data

    with st.spinner("Processing incident via agentic system..."):
        res = requests.post(f"{BACKEND_URL}/incident", json=payload, timeout=120)

    if res.status_code == 200:
        data = res.json()
        incident_id = data["incident_id"]
        st.success(f"Incident created: **{incident_id}**")
        st.session_state["incident_id"] = incident_id
        st.json(data)
    else:
        st.error(res.text)

# ------------------------
# HUMAN IN THE LOOP
# ------------------------

st.divider()
st.header("🧑‍⚖️ Human Review Panel")

incident_id = st.session_state.get("incident_id")

if not incident_id:
    st.info("No incident awaiting human review.")
else:
    st.write(f"Incident ID: `{incident_id}`")

    decision = st.selectbox(
        "Human Decision",
        [
            "approve_plan",
            "force_escalation",
            "abort"
        ]
    )

    if st.button("Submit Human Decision"):
        payload = {"decision": decision}
        with st.spinner("Sending decision to system..."):
            res = requests.post(
                f"{BACKEND_URL}/human/{incident_id}",
                json=payload,
                timeout=60
            )

        if res.status_code == 200:
            st.success("Decision submitted. System resumed.")
            st.json(res.json())
        else:
            st.error(res.text)
