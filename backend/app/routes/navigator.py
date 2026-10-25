from flask import Blueprint, request, jsonify
from ..services.navigator_engine import evaluate_health_query

navigator_bp = Blueprint("navigator", __name__, url_prefix="/api/v1/navigator")

@navigator_bp.route("", methods=["POST"])
def navigate():
    data = request.get_json(silent=True) or {}
    query = (data.get("query") or "").strip()
    selected_topic = (data.get("topic") or "").strip() or None

    if not query:
        return jsonify({
            "error": "A query or concern description is required.",
            "disclaimer": "HerHealth 360 provides educational guidance only."
        }), 400

    if len(query) > 1000:
        return jsonify({"error": "Query cannot exceed 1000 characters."}), 400

    result = evaluate_health_query(query, selected_topic=selected_topic)
    return jsonify(result), 200
