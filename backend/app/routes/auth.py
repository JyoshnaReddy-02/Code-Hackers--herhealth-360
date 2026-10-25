import re
from flask import Blueprint, request, jsonify, g
from ..models import db, User
from ..security import require_auth, generate_auth_token

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    display_name = (data.get("display_name") or "").strip()
    date_of_birth = (data.get("date_of_birth") or "").strip()
    life_stage = (data.get("life_stage") or "reproductive").strip()

    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "A valid email address is required."}), 400

    password = (data.get("password") or "").strip()
    if not password or len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long."}), 400

    if not display_name:
        return jsonify({"error": "Display name is required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email address already exists. If you forgot your password, please use the Reset Password option."}), 409

    user = User(
        email=email,
        display_name=display_name,
        date_of_birth=date_of_birth if date_of_birth else None,
        life_stage=life_stage
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create user account. Please try again."}), 500

    token = generate_auth_token(user.id)
    return jsonify({
        "message": "Registration successful. Welcome to HerHealth 360!",
        "token": token,
        "user": user.to_dict()
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password. Please verify your credentials or use the eye icon to check for typos."}), 401

    token = generate_auth_token(user.id)
    return jsonify({
        "message": "Login successful.",
        "token": token,
        "user": user.to_dict()
    }), 200

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    new_password = (data.get("new_password") or "").strip()

    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "A valid email address is required."}), 400

    if not new_password or len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters long."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No user account was found with this email address."}), 404

    user.set_password(new_password)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to reset password. Please try again."}), 500

    token = generate_auth_token(user.id)
    return jsonify({
        "message": "Password updated successfully. You are now logged in.",
        "token": token,
        "user": user.to_dict()
    }), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Successfully logged out."}), 200

@auth_bp.route("/me", methods=["GET"])
@require_auth
def get_current_user():
    return jsonify({
        "user": g.current_user.to_dict()
    }), 200
