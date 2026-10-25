import os
from functools import wraps
from flask import request, jsonify, g, current_app
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from ..models import User, Doctor

def get_serializer():
    secret_key = current_app.config.get("SECRET_KEY", "fallback-dev-secret-key-platform")
    return URLSafeTimedSerializer(secret_key, salt="herhealth-auth-token")

def generate_auth_token(user_id: int, role: str = "user") -> str:
    s = get_serializer()
    return s.dumps({"user_id": user_id, "role": role})

def verify_token_payload(token: str, max_age: int = 86400 * 7):
    s = get_serializer()
    try:
        data = s.loads(token, max_age=max_age)
        return data
    except (SignatureExpired, BadSignature, Exception):
        return None

def verify_auth_token(token: str, max_age: int = 86400 * 7):
    payload = verify_token_payload(token, max_age=max_age)
    if not payload:
        return None
    return payload.get("user_id")

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
        elif "session_token" in request.cookies:
            token = request.cookies.get("session_token")

        if not token:
            return jsonify({"error": "Authentication required. Please log in."}), 401

        user_id = verify_auth_token(token)
        if not user_id:
            return jsonify({"error": "Invalid or expired session. Please log in again."}), 401

        from ..models import db
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User account not found."}), 401

        g.current_user = user
        return f(*args, **kwargs)

    return decorated_function

def require_doctor_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
        elif "session_token" in request.cookies:
            token = request.cookies.get("session_token")

        if not token:
            return jsonify({"error": "Doctor authentication required. Please log in."}), 401

        payload = verify_token_payload(token)
        if not payload or payload.get("role") != "doctor":
            return jsonify({"error": "Invalid or expired clinician session. Please log in again."}), 401

        doctor_id = payload.get("user_id")
        from ..models import db
        doctor = db.session.get(Doctor, doctor_id)
        if not doctor or not doctor.is_active:
            return jsonify({"error": "Doctor profile not found or inactive."}), 401

        g.current_doctor = doctor
        return f(*args, **kwargs)

    return decorated_function

def require_admin_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
        elif "session_token" in request.cookies:
            token = request.cookies.get("session_token")

        if not token:
            return jsonify({"error": "Admin authentication required. Please log in."}), 401

        payload = verify_token_payload(token)
        if not payload or payload.get("role") != "admin":
            return jsonify({"error": "Invalid or expired administrator session."}), 401

        g.is_admin = True
        return f(*args, **kwargs)

    return decorated_function
