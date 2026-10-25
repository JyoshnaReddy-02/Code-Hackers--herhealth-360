from flask import Blueprint, request, jsonify, g
from ..models import db, User
from ..security import require_auth

profile_bp = Blueprint("profile", __name__, url_prefix="/api/v1/profile")

@profile_bp.route("", methods=["GET"])
@require_auth
def get_profile():
    return jsonify({"profile": g.current_user.to_dict()}), 200

@profile_bp.route("", methods=["PATCH"])
@require_auth
def update_profile():
    data = request.get_json(silent=True) or {}
    user = g.current_user

    if "display_name" in data:
        name = (data["display_name"] or "").strip()
        if not name:
            return jsonify({"error": "Display name cannot be empty."}), 400
        user.display_name = name

    if "date_of_birth" in data:
        user.date_of_birth = (data["date_of_birth"] or "").strip() or None

    if "life_stage" in data:
        stage = (data["life_stage"] or "").strip()
        allowed_stages = ["puberty", "reproductive", "pregnancy_postpartum", "perimenopause_menopause", "general_wellness"]
        if stage and stage not in allowed_stages:
            return jsonify({"error": f"Invalid life stage. Allowed options: {', '.join(allowed_stages)}"}), 400
        user.life_stage = stage

    try:
        db.session.commit()
        return jsonify({
            "message": "Profile updated successfully.",
            "profile": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update profile."}), 500
