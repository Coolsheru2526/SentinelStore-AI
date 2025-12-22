# Azure Vision & Speech Services Setup

This document describes the Azure Vision and Speech services integration for processing images and audio in the incident system.

## Environment Variables

Add these to your `.env` file:

```bash
# Azure Vision (Computer Vision API)
AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_VISION_KEY=your_vision_api_key

# Azure Speech (Speech-to-Text)
AZURE_SPEECH_KEY=your_speech_api_key
AZURE_SPEECH_REGION=your_region  # e.g., "eastus", "westus2"
```

## Azure Vision Service

The Vision service processes uploaded images and extracts:
- **Objects**: Detected objects with bounding boxes and confidence scores
- **People**: Detected people with bounding boxes
- **Text**: OCR text extracted from the image
- **Description**: AI-generated description of the image content

### Usage

Images are automatically processed when included in the incident creation request. The processed results are stored in `state["vision_observation"]` as a dictionary.

### Example Output

```json
{
  "objects": [
    {
      "name": "person",
      "confidence": 0.95,
      "bounding_box": {"x": 100, "y": 200, "w": 50, "h": 100}
    }
  ],
  "people_count": 2,
  "people": [...],
  "text": "CHECKOUT",
  "description": "A retail store checkout area with customers",
  "processed": true
}
```

## Azure Speech Service

The Speech service transcribes uploaded audio files to text using Speech-to-Text API.

### Supported Formats

- WAV (recommended)
- MP3
- M4A
- OGG

### Usage

Audio files are automatically processed when included in the incident creation request. The transcription is stored in `state["audio_observation"]` as a dictionary.

### Example Output

```json
{
  "text": "I need help at checkout lane 3",
  "confidence": 0.9,
  "language": "en-US",
  "processed": true
}
```

## Processing Flow

1. **Client Upload**: User uploads image/audio via Streamlit interface
2. **Base64 Encoding**: Files are encoded to base64 for API transmission
3. **API Receives**: FastAPI receives base64 encoded data
4. **Decode**: Data is decoded back to bytes
5. **Azure Processing**: 
   - Images → Azure Vision API
   - Audio → Azure Speech-to-Text API
6. **Store Results**: Processed results stored in state
7. **Agent Processing**: Vision/speech nodes use processed observations

## Error Handling

If Azure services are not configured or fail:
- Processing errors are logged
- Observation dict includes `"error"` field
- `"processed": false` flag indicates failure
- System continues with available data

## Testing

### Test Vision Service

1. Upload an image via Streamlit
2. Check API logs for: `[INCIDENT-{id}] Processing vision observation with Azure Vision...`
3. Verify `vision_observation` contains processed results

### Test Speech Service

1. Upload an audio file via Streamlit
2. Check API logs for: `[INCIDENT-{id}] Processing audio observation with Azure Speech...`
3. Verify `audio_observation` contains transcription

## Getting Azure Credentials

### Azure Vision (Computer Vision)

1. Go to Azure Portal
2. Create a Computer Vision resource
3. Copy the endpoint and key from "Keys and Endpoint" section

### Azure Speech

1. Go to Azure Portal
2. Create a Speech resource
3. Copy the key and region from "Keys and Endpoint" section

## Notes

- **Cost**: Both services are pay-per-use. Monitor usage in Azure Portal
- **Latency**: Processing adds ~1-3 seconds per file to incident creation
- **File Size**: Large files may take longer to process
- **Rate Limits**: Be aware of Azure API rate limits for high-volume usage

