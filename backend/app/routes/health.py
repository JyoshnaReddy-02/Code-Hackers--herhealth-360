from datetime import datetime, timezone
from flask import Blueprint, jsonify
from ..models import db

health_bp = Blueprint("health", __name__, url_prefix="/api/v1/health")

@health_bp.route("", methods=["GET"])
def health_check():
    db_ok = True
    db_engine = "unknown"
    try:
        db.session.execute(db.text("SELECT 1"))
        if hasattr(db, "engine") and db.engine:
            db_engine = db.engine.name
    except Exception:
        db_ok = False

    return jsonify({
        "status": "healthy" if db_ok else "degraded",
        "service": "HerHealth 360 Backend API",
        "database_connected": db_ok,
        "database_engine": db_engine,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "platform": "HerHealth 360 Women's Digital Health Platform"
    }), 200 if db_ok else 503
