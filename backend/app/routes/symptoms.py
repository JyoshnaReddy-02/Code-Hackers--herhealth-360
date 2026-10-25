from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from ..models import db, SymptomEntry
from ..security import require_auth

symptoms_bp = Blueprint("symptoms", __name__, url_prefix="/api/v1/symptoms")

VALID_CATEGORIES = [
    "Menstrual",
    "Pelvic or abdominal discomfort",
    "Breast",
    "Digestive",
    "Fatigue and sleep",
    "Mood and well-being",
    "Pregnancy-related observations",
    "Menopause-related observations",
    "Other"
]

@symptoms_bp.route("", methods=["GET"])
@require_auth
def get_symptoms():
    query = SymptomEntry.query.filter_by(user_id=g.current_user.id)

    category = request.args.get("category")
    if category and category in VALID_CATEGORIES:
        query = query.filter_by(category=category)

    start_date = request.args.get("start_date")
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            query = query.filter(SymptomEntry.recorded_at >= start_dt)
        except ValueError:
            pass

    end_date = request.args.get("end_date")
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            query = query.filter(SymptomEntry.recorded_at <= end_dt)
        except ValueError:
            pass

    min_sev = request.args.get("min_severity", type=int)
    if min_sev is not None:
        query = query.filter(SymptomEntry.severity >= min_sev)

    max_sev = request.args.get("max_severity", type=int)
    if max_sev is not None:
        query = query.filter(SymptomEntry.severity <= max_sev)

    entries = query.order_by(SymptomEntry.recorded_at.desc()).all()
    return jsonify({
        "count": len(entries),
        "symptoms": [e.to_dict() for e in entries]
    }), 200

@symptoms_bp.route("", methods=["POST"])
@require_auth
def create_symptom():
    data = request.get_json(silent=True) or {}
    category = (data.get("category") or "").strip()
    symptom_name = (data.get("symptom_name") or "").strip()
    severity = data.get("severity")

    if not category or category not in VALID_CATEGORIES:
        return jsonify({"error": f"Valid category required. Must be one of: {', '.join(VALID_CATEGORIES)}"}), 400

    if not symptom_name or len(symptom_name) > 100:
        return jsonify({"error": "Symptom name is required (max 100 characters)."}), 400

    if severity is None or not isinstance(severity, int) or severity < 1 or severity > 10:
        return jsonify({"error": "Severity must be an integer between 1 and 10."}), 400

    recorded_at_raw = data.get("recorded_at")
    if recorded_at_raw:
        try:
            recorded_at = datetime.fromisoformat(recorded_at_raw.replace("Z", "+00:00"))
        except ValueError:
            return jsonify({"error": "Invalid date format for recorded_at. Use ISO 8601."}), 400
    else:
        recorded_at = datetime.now(timezone.utc)

    duration_hours = data.get("duration_hours")
    if duration_hours is not None:
        try:
            duration_hours = float(duration_hours)
            if duration_hours < 0 or duration_hours > 720:
                return jsonify({"error": "Duration must be between 0 and 720 hours."}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Duration must be a valid number of hours."}), 400

    notes = data.get("notes")
    if notes and len(notes) > 1000:
        return jsonify({"error": "Notes cannot exceed 1000 characters."}), 400

    # Optional context fields
    cycle_day = data.get("cycle_day")
    if cycle_day is not None and (not isinstance(cycle_day, int) or cycle_day < 1 or cycle_day > 60):
        return jsonify({"error": "Cycle day must be between 1 and 60."}), 400

    sleep_quality = data.get("sleep_quality")
    if sleep_quality is not None and (not isinstance(sleep_quality, int) or sleep_quality < 1 or sleep_quality > 5):
        return jsonify({"error": "Sleep quality must be between 1 and 5."}), 400

    fatigue_level = data.get("fatigue_level")
    if fatigue_level is not None and (not isinstance(fatigue_level, int) or fatigue_level < 1 or fatigue_level > 5):
        return jsonify({"error": "Fatigue level must be between 1 and 5."}), 400

    entry = SymptomEntry(
        user_id=g.current_user.id,
        recorded_at=recorded_at,
        category=category,
        symptom_name=symptom_name,
        severity=severity,
        duration_hours=duration_hours,
        notes=notes.strip() if notes else None,
        cycle_day=cycle_day,
        sleep_quality=sleep_quality,
        activity_level=(data.get("activity_level") or "").strip() or None,
        fatigue_level=fatigue_level,
        mood=(data.get("mood") or "").strip() or None,
        triggers=(data.get("triggers") or "").strip() or None
    )

    try:
        db.session.add(entry)
        db.session.commit()
        return jsonify({
            "message": "Symptom entry recorded successfully.",
            "symptom": entry.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to save symptom entry."}), 500

@symptoms_bp.route("/<int:entry_id>", methods=["GET"])
@require_auth
def get_symptom(entry_id):
    entry = SymptomEntry.query.filter_by(id=entry_id, user_id=g.current_user.id).first()
    if not entry:
        return jsonify({"error": "Symptom entry not found or unauthorized."}), 404
    return jsonify({"symptom": entry.to_dict()}), 200

@symptoms_bp.route("/<int:entry_id>", methods=["PATCH"])
@require_auth
def update_symptom(entry_id):
    entry = SymptomEntry.query.filter_by(id=entry_id, user_id=g.current_user.id).first()
    if not entry:
        return jsonify({"error": "Symptom entry not found or unauthorized."}), 404

    data = request.get_json(silent=True) or {}
    
    if "category" in data:
        cat = (data["category"] or "").strip()
        if cat not in VALID_CATEGORIES:
            return jsonify({"error": f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}"}), 400
        entry.category = cat

    if "symptom_name" in data:
        name = (data["symptom_name"] or "").strip()
        if not name or len(name) > 100:
            return jsonify({"error": "Symptom name cannot be empty (max 100 characters)."}), 400
        entry.symptom_name = name

    if "severity" in data:
        sev = data["severity"]
        if sev is None or not isinstance(sev, int) or sev < 1 or sev > 10:
            return jsonify({"error": "Severity must be between 1 and 10."}), 400
        entry.severity = sev

    if "duration_hours" in data:
        dur = data["duration_hours"]
        if dur is not None:
            try:
                dur = float(dur)
                if dur < 0 or dur > 720:
                    return jsonify({"error": "Duration must be between 0 and 720."}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid duration."}), 400
        entry.duration_hours = dur

    if "notes" in data:
        notes = data["notes"]
        if notes and len(notes) > 1000:
            return jsonify({"error": "Notes cannot exceed 1000 characters."}), 400
        entry.notes = notes.strip() if notes else None

    if "cycle_day" in data:
        entry.cycle_day = data["cycle_day"]
    if "sleep_quality" in data:
        entry.sleep_quality = data["sleep_quality"]
    if "activity_level" in data:
        entry.activity_level = data["activity_level"]
    if "fatigue_level" in data:
        entry.fatigue_level = data["fatigue_level"]
    if "mood" in data:
        entry.mood = data["mood"]
    if "triggers" in data:
        entry.triggers = data["triggers"]

    try:
        db.session.commit()
        return jsonify({
            "message": "Symptom updated successfully.",
            "symptom": entry.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update symptom."}), 500

@symptoms_bp.route("/<int:entry_id>", methods=["DELETE"])
@require_auth
def delete_symptom(entry_id):
    entry = SymptomEntry.query.filter_by(id=entry_id, user_id=g.current_user.id).first()
    if not entry:
        return jsonify({"error": "Symptom entry not found or unauthorized."}), 404

    try:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": "Symptom entry deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete symptom."}), 500
