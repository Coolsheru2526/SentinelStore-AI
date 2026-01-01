import streamlit as st
import requests
import base64
import json

BACKEND_URL = "http://localhost:8000"

st.set_page_config(layout="wide")

# Authentication
if "token" not in st.session_state:
    st.session_state.token = None
if "user" not in st.session_state:
    st.session_state.user = None

def login(username, password):
    response = requests.post(f"{BACKEND_URL}/auth/login", data={"username": username, "password": password})
    if response.status_code == 200:
        data = response.json()
        st.session_state.token = data["access_token"]
        # Get user info
        headers = {"Authorization": f"Bearer {st.session_state.token}"}
        user_response = requests.get(f"{BACKEND_URL}/auth/me", headers=headers)
        if user_response.status_code == 200:
            st.session_state.user = user_response.json()
        return True
    return False

def register(username, email, password, full_name, role, store_id):
    payload = {
        "username": username,
        "email": email,
        "password": password,
        "full_name": full_name,
        "role": role,
        "store_id": store_id
    }
    response = requests.post(f"{BACKEND_URL}/auth/register", json=payload)
    return response.status_code == 200

def logout():
    st.session_state.token = None
    st.session_state.user = None
    st.rerun()

# Login/Register UI
if not st.session_state.token:
    st.title("🛒 SentinelStore AI - Login")

    tab1, tab2 = st.tabs(["Login", "Register"])

    with tab1:
        st.header("Login")
        username = st.text_input("Username", key="login_username")
        password = st.text_input("Password", type="password", key="login_password")
        if st.button("Login"):
            if login(username, password):
                st.success("Logged in successfully!")
                st.rerun()
            else:
                st.error("Invalid credentials")

    with tab2:
        st.header("Register")
        reg_username = st.text_input("Username", key="reg_username")
        reg_email = st.text_input("Email", key="reg_email")
        reg_password = st.text_input("Password", type="password", key="reg_password")
        reg_full_name = st.text_input("Full Name", key="reg_full_name")
        reg_role = st.selectbox("Role", ["employee", "manager"], key="reg_role")
        reg_store_id = st.text_input("Store ID", value="store_1", key="reg_store_id")
        if st.button("Register"):
            if register(reg_username, reg_email, reg_password, reg_full_name, reg_role, reg_store_id):
                st.success("Registered successfully! Please login.")
            else:
                st.error("Registration failed")

    st.stop()

# Main App
st.title("🛒 Autonomous Retail Incident Manager")

if st.session_state.user:
    st.sidebar.write(f"Logged in as: {st.session_state.user['username']} ({st.session_state.user['role']})")
    st.sidebar.write(f"Store: {st.session_state.user['store_id']}")
    if st.sidebar.button("Logout"):
        logout()

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

store_id = st.text_input("Store ID", value=st.session_state.user["store_id"] if st.session_state.user else "store_1")

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
        headers = {"Authorization": f"Bearer {st.session_state.token}"}
        res = requests.post(f"{BACKEND_URL}/incident", json=payload, headers=headers, timeout=120)

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
            "force_escalation",
            "abort"
        ]
    )

    if st.button("Submit Human Decision"):
        payload = {"decision": decision}
        with st.spinner("Sending decision to system..."):
            headers = {"Authorization": f"Bearer {st.session_state.token}"}
            res = requests.post(
                f"{BACKEND_URL}/human/{incident_id}",
                json=payload,
                headers=headers,
                timeout=60
            )

        if res.status_code == 200:
            st.success("Decision submitted. System resumed.")
            st.json(res.json())
        else:
            st.error(res.text)
