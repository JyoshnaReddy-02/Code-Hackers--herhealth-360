from collections import defaultdict
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from ..models import SymptomEntry
from ..security import require_auth

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/v1/analytics")

@analytics_bp.route("/symptoms", methods=["GET"])
@require_auth
def get_symptom_analytics():
    # Only pull authorized records for current user
    entries = SymptomEntry.query.filter_by(user_id=g.current_user.id).order_by(SymptomEntry.recorded_at.asc()).all()

    if not entries:
        return jsonify({
            "total_entries": 0,
            "average_severity": 0.0,
            "peak_severity": 0,
            "timeline": [],
            "frequency_by_date": [],
            "category_distribution": [],
            "wellness_correlation": [],
            "disclaimer": "These charts show patterns in the information you recorded. They do not diagnose a condition or establish medical causation."
        }), 200

    # 1. Timeline data
    timeline = []
    freq_map = defaultdict(int)
    cat_map = defaultdict(int)
    wellness_data = []

    severities = []

    for e in entries:
        dt_str = e.recorded_at.strftime("%Y-%m-%d") if e.recorded_at else "N/A"
        time_label = e.recorded_at.strftime("%b %d, %H:%M") if e.recorded_at else "N/A"
        severities.append(e.severity)

        timeline.append({
            "id": e.id,
            "date": dt_str,
            "label": time_label,
            "symptom": e.symptom_name,
            "category": e.category,
            "severity": e.severity,
            "duration": e.duration_hours or 0
        })

        freq_map[dt_str] += 1
        cat_map[e.category] += 1

        if e.sleep_quality is not None or e.fatigue_level is not None:
            wellness_data.append({
                "date": dt_str,
                "label": time_label,
                "symptom": e.symptom_name,
                "severity": e.severity,
                "sleep_quality": e.sleep_quality,
                "fatigue_level": e.fatigue_level,
                "activity_level": e.activity_level or "Unspecified"
            })

    # 2. Frequency series
    frequency_by_date = [
        {"date": d, "count": count} for d, count in sorted(freq_map.items())
    ]

    # 3. Category distribution
    total_count = len(entries)
    category_distribution = [
        {
            "category": cat,
            "count": count,
            "percentage": round((count / total_count) * 100, 1)
        }
        for cat, count in sorted(cat_map.items(), key=lambda x: x[1], reverse=True)
    ]

    avg_sev = round(sum(severities) / len(severities), 1) if severities else 0.0
    peak_sev = max(severities) if severities else 0

    return jsonify({
        "total_entries": total_count,
        "average_severity": avg_sev,
        "peak_severity": peak_sev,
        "timeline": timeline,
        "frequency_by_date": frequency_by_date,
        "category_distribution": category_distribution,
        "wellness_correlation": wellness_data,
        "disclaimer": "These charts show patterns in the information you recorded. They do not diagnose a condition or establish medical causation."
    }), 200
