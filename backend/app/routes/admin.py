import os
from datetime import datetime, timezone
from collections import Counter
from flask import Blueprint, request, jsonify, g
from sqlalchemy import func
from ..models import db, User, Doctor, Appointment, SymptomEntry, ExercisePractice
from ..security import require_admin_auth, generate_auth_token

admin_bp = Blueprint("admin", __name__, url_prefix="/api/v1/admin")

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@herhealth360.internal")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "AdminMaster2026!")

@admin_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Admin email and password are required."}), 400

    if email != ADMIN_EMAIL.lower() or password != ADMIN_PASSWORD:
        if User.query.filter_by(email=email).first():
            return jsonify({
                "error": "This account is registered as a User (Public Portal), not an Administrator. Please sign in via the User Portal.",
                "is_user_account": True
            }), 401
        return jsonify({"error": "Invalid administrator credentials."}), 401

    token = generate_auth_token(user_id=999999, role="admin")
    return jsonify({
        "message": "Admin authentication successful.",
        "token": token,
        "role": "admin",
        "admin": {
            "email": ADMIN_EMAIL,
            "display_name": "System Administrator",
            "role": "Super Admin"
        }
    }), 200

@admin_bp.route("/overview", methods=["GET"])
@require_admin_auth
def get_admin_overview():
    total_users = User.query.count()
    total_doctors = Doctor.query.filter_by(is_active=True).count()
    total_appointments = Appointment.query.count()
    total_symptoms = SymptomEntry.query.count()
    total_exercises = ExercisePractice.query.count()

    # Life stage distribution of users
    life_stages = db.session.query(User.life_stage, func.count(User.id)).group_by(User.life_stage).all()
    life_stage_dist = [
        {"stage": (stage or "reproductive").replace("_", " ").title(), "count": count}
        for stage, count in life_stages
    ]

    # Appointments status distribution
    apt_statuses = db.session.query(Appointment.status, func.count(Appointment.id)).group_by(Appointment.status).all()
    apt_status_dist = [
        {"status": (status or "booked").capitalize(), "count": count}
        for status, count in apt_statuses
    ]

    return jsonify({
        "metrics": {
            "total_users": total_users,
            "total_doctors": total_doctors,
            "total_appointments": total_appointments,
            "total_symptoms_logged": total_symptoms,
            "total_exercises": total_exercises
        },
        "life_stage_distribution": life_stage_dist,
        "appointment_status_distribution": apt_status_dist
    }), 200

@admin_bp.route("/user-problems", methods=["GET"])
@require_admin_auth
def get_user_problems_insights():
    """
    Visualizes the main health problems users are facing across the platform.
    Aggregates symptom frequencies, categories, and severity tiers.
    """
    entries = SymptomEntry.query.all()
    total_entries = len(entries)

    if total_entries == 0:
        return jsonify({
            "total_observations": 0,
            "top_symptoms": [],
            "category_distribution": [],
            "severity_distribution": []
        }), 200

    # 1. Top categories
    cat_counts = Counter(e.category for e in entries)
    cat_distribution = [
        {"category": cat, "count": count, "percentage": round((count / total_entries) * 100, 1)}
        for cat, count in cat_counts.most_common(8)
    ]

    # 2. Top individual symptoms with average severity
    symptom_groups = {}
    for e in entries:
        name = e.symptom_name.strip().title()
        if name not in symptom_groups:
            symptom_groups[name] = {"category": e.category, "severities": []}
        symptom_groups[name]["severities"].append(e.severity)

    top_symptoms = []
    for name, data in sorted(symptom_groups.items(), key=lambda item: len(item[1]["severities"]), reverse=True)[:10]:
        sevs = data["severities"]
        top_symptoms.append({
            "symptom": name,
            "category": data["category"],
            "report_count": len(sevs),
            "avg_severity": round(sum(sevs) / len(sevs), 1),
            "max_severity": max(sevs)
        })

    # 3. Severity breakdown
    mild = sum(1 for e in entries if e.severity <= 3)
    moderate = sum(1 for e in entries if 4 <= e.severity <= 6)
    severe = sum(1 for e in entries if e.severity >= 7)

    severity_dist = [
        {"tier": "Mild (1-3)", "count": mild, "percentage": round((mild / total_entries) * 100, 1), "color": "#5C8276"},
        {"tier": "Moderate (4-6)", "count": moderate, "percentage": round((moderate / total_entries) * 100, 1), "color": "#C86D51"},
        {"tier": "Severe (7-10)", "count": severe, "percentage": round((severe / total_entries) * 100, 1), "color": "#8C3B5E"}
    ]

    return jsonify({
        "total_observations": total_entries,
        "top_symptoms": top_symptoms,
        "category_distribution": cat_distribution,
        "severity_distribution": severity_dist
    }), 200

@admin_bp.route("/doctor-questions", methods=["GET"])
@require_admin_auth
def get_doctor_questions_insights():
    """
    Visualizes the questions and inquiry topics doctors are receiving from users.
    Categorizes themes from appointment consultation notes.
    """
    appointments = Appointment.query.order_by(Appointment.created_at.desc()).all()

    # Define standard clinical question categories
    THEMES = {
        "PCOS & Irregular Cycles": ["pcos", "irregular", "period", "cramps", "cycle", "ovary", "hirsutism"],
        "Antenatal & Maternal Care": ["pregnancy", "trimester", "fetal", "antenatal", "nausea", "birth", "postpartum"],
        "Cervical Screening & HPV": ["pap", "hpv", "cervical", "smear", "screening", "cervix"],
        "Pelvic Pain & Endometriosis": ["pelvic", "pain", "endometriosis", "aching", "bloating", "pressure"],
        "Hormonal Fatigue & Sleep": ["fatigue", "sleep", "tired", "mood", "exhaustion", "stress"],
        "Menopause & Transitions": ["menopause", "hot flash", "night sweat", "perimenopause", "hormone"]
    }

    theme_counts = Counter()
    recent_inquiries = []

    for apt in appointments:
        notes = (apt.notes or "").lower()
        matched_theme = "General Reproductive Consultation"

        for theme, keywords in THEMES.items():
            if any(kw in notes for kw in keywords):
                matched_theme = theme
                break

        theme_counts[matched_theme] += 1

        recent_inquiries.append({
            "appointment_id": apt.id,
            "user_name": apt.user.display_name if apt.user else "User",
            "user_life_stage": apt.user.life_stage if apt.user else "reproductive",
            "doctor_name": apt.doctor.name if apt.doctor else "Clinician",
            "doctor_specialty": apt.doctor.specialty if apt.doctor else "General",
            "theme": matched_theme,
            "user_notes": apt.notes or "No specific pre-consultation notes submitted.",
            "appointment_time": apt.appointment_time.isoformat() if apt.appointment_time else None,
            "status": apt.status
        })

    theme_distribution = [
        {"theme": theme, "count": count, "percentage": round((count / max(len(appointments), 1)) * 100, 1)}
        for theme, count in theme_counts.most_common()
    ]

    return jsonify({
        "total_consultation_inquiries": len(appointments),
        "theme_distribution": theme_distribution,
        "recent_inquiries": recent_inquiries[:20]
    }), 200

@admin_bp.route("/exercises", methods=["GET"])
@require_admin_auth
def get_admin_exercises():
    exercises = ExercisePractice.query.order_by(ExercisePractice.created_at.desc()).all()
    return jsonify({"exercises": [ex.to_dict() for ex in exercises]}), 200

@admin_bp.route("/exercises", methods=["POST"])
@require_admin_auth
def add_admin_exercise():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    category = (data.get("category") or "").strip()
    target_condition = (data.get("target_condition") or "").strip()
    description = (data.get("description") or "").strip()
    instructions = (data.get("instructions") or "").strip()
    image_url = (data.get("image_url") or "").strip()
    youtube_url = (data.get("youtube_url") or "").strip()
    website_url = (data.get("website_url") or "").strip()
    duration = int(data.get("duration_minutes") or 15)
    difficulty = (data.get("difficulty") or "Gentle / Beginner").strip()

    if not title or not category or not description or not youtube_url:
        return jsonify({"error": "Title, category, description, and YouTube URL are required."}), 400

    if not image_url:
        image_url = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"

    ex = ExercisePractice(
        title=title,
        category=category,
        target_condition=target_condition or category,
        duration_minutes=duration,
        difficulty=difficulty,
        description=description,
        instructions=instructions or description,
        image_url=image_url,
        youtube_url=youtube_url,
        website_url=website_url if website_url else None
    )

    try:
        db.session.add(ex)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to save exercise practice module."}), 500

    return jsonify({
        "message": "Exercise practice routine successfully created.",
        "exercise": ex.to_dict()
    }), 201

@admin_bp.route("/exercises/<int:exercise_id>", methods=["DELETE"])
@require_admin_auth
def delete_admin_exercise(exercise_id):
    ex = db.session.get(ExercisePractice, exercise_id)
    if not ex:
        return jsonify({"error": "Exercise routine not found."}), 404

    try:
        db.session.delete(ex)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete exercise."}), 500

    return jsonify({"message": "Exercise deleted successfully."}), 200
