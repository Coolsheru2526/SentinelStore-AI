"""
Simple example test script - Run this to test the system quickly.
Usage: python example_test.py
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_system():
    """Run a simple end-to-end test."""
    
    print("=" * 60)
    print("Testing Retail Autonomous Incident System")
    print("=" * 60)
    
    # Step 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("   [OK] API server is running")
        else:
            print(f"   [FAIL] Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   [FAIL] Cannot connect to API server")
        print("   -> Start server with: uvicorn app.api:app --reload")
        return False
    
    # Step 2: Create incident
    print("\n2. Creating test incident...")
    payload = {
        "store_id": "test_store_1",
        "store_state": {
            "location": "downtown",
            "staff_count": 5,
            "test": True
        },
        "signals": {
            "sensor_id": "test_cam_01",
            "timestamp": "2024-01-15T12:00:00Z",
            "test": True
        },
        "vision_observation": None,
        "audio_observation": None
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/incident",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            incident_id = response.json()["incident_id"]
            print(f"   [OK] Incident created: {incident_id}")
        else:
            print(f"   [FAIL] Failed to create incident: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"   [FAIL] Error creating incident: {e}")
        return False
    
    # Step 3: Test human decision endpoint (if needed)
    print("\n3. Testing human decision endpoint...")
    try:
        # Try with a non-existent ID first (should return 404)
        response = requests.post(
            f"{BASE_URL}/human/test-nonexistent-id",
            json={"decision": "approve"},
            timeout=5
        )
        if response.status_code == 404:
            print("   [OK] Human decision endpoint working (correctly returns 404 for non-existent)")
        else:
            print(f"   [WARN] Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"   [FAIL] Error testing human decision: {e}")
    
    # Step 4: System info
    print("\n4. Getting system info...")
    try:
        response = requests.get(f"{BASE_URL}/info", timeout=5)
        if response.status_code == 200:
            info = response.json()
            print(f"   [OK] System info retrieved")
            print(f"   Available endpoints: {len(info.get('available_endpoints', []))}")
        else:
            print(f"   [FAIL] Failed to get info: {response.status_code}")
    except Exception as e:
        print(f"   [FAIL] Error getting info: {e}")
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Basic system test completed!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Check the API server logs to see detailed execution flow")
    print("2. Use Streamlit UI: streamlit run app/streamlit_interface.py")
    print("3. Run full test suite: pytest tests/ -v")
    print("4. See TESTING_GUIDE.md for more testing options")
    
    return True


if __name__ == "__main__":
    success = test_system()
    exit(0 if success else 1)

