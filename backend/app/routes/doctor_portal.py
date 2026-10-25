from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, g
from ..models import db, Doctor, AvailabilitySlot, Appointment, User
from ..security import require_doctor_auth, generate_auth_token

doctor_portal_bp = Blueprint("doctor_portal", __name__, url_prefix="/api/v1/doctor")

@doctor_portal_bp.route("/login", methods=["POST"])
def doctor_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Doctor email and password are required."}), 400

    doctor = Doctor.query.filter_by(email=email).first()
    if not doctor or not doctor.check_password(password):
        if User.query.filter_by(email=email).first():
            return jsonify({
                "error": "This account is registered as a User (Public Portal), not a Clinician. Please sign in via the User Portal.",
                "is_user_account": True
            }), 401
        return jsonify({"error": "Invalid doctor email or password."}), 401

    if not doctor.is_active:
        return jsonify({"error": "This clinician account is currently inactive."}), 403

    token = generate_auth_token(doctor.id, role="doctor")
    return jsonify({
        "message": "Doctor login successful.",
        "token": token,
        "role": "doctor",
        "doctor": doctor.to_dict()
    }), 200

@doctor_portal_bp.route("/me", methods=["GET"])
@require_doctor_auth
def get_doctor_profile():
    return jsonify({
        "doctor": g.current_doctor.to_dict()
    }), 200

@doctor_portal_bp.route("/appointments", methods=["GET"])
@require_doctor_auth
def get_doctor_appointments():
    """
    Returns scheduled consultations for the authenticated doctor.
    Note: Refers to members as 'user', respecting system standards.
    """
    appointments = Appointment.query.filter_by(doctor_id=g.current_doctor.id).order_by(Appointment.appointment_time.desc()).all()
    
    res = []
    for a in appointments:
        clean_doc_name = "".join(c for c in g.current_doctor.name if c.isalnum())
        jitsi_room = f"https://meet.jit.si/HerHealth360_Consult_{clean_doc_name}_{a.id}"
        
        res.append({
            "id": a.id,
            "user_id": a.user_id,
            "user_name": a.user.display_name if a.user else "User",
            "user_email": a.user.email if a.user else "—",
            "user_life_stage": a.user.life_stage if a.user else "—",
            "appointment_time": a.appointment_time.isoformat() if a.appointment_time else None,
            "appointment_type": a.appointment_type,
            "status": a.status,
            "notes": a.notes,
            "slot_id": a.slot_id,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "jitsi_room_url": jitsi_room
        })

    return jsonify({"appointments": res}), 200

@doctor_portal_bp.route("/slots", methods=["GET"])
@require_doctor_auth
def get_doctor_slots():
    """
    Returns all slots for this doctor, including booking state and user details.
    """
    slots = AvailabilitySlot.query.filter_by(doctor_id=g.current_doctor.id).order_by(AvailabilitySlot.start_time.asc()).all()
    
    slot_list = []
    for s in slots:
        slot_dict = s.to_dict()
        if s.is_booked and s.appointment and s.appointment.user:
            slot_dict["booked_by_user"] = {
                "user_id": s.appointment.user.id,
                "user_name": s.appointment.user.display_name,
                "user_email": s.appointment.user.email
            }
        else:
            slot_dict["booked_by_user"] = None
        slot_list.append(slot_dict)

    return jsonify({"slots": slot_list}), 200

@doctor_portal_bp.route("/slots", methods=["POST"])
@require_doctor_auth
def add_doctor_slot():
    """
    Allows the authenticated doctor to open a new consultation availability slot.
    """
    data = request.get_json(silent=True) or {}
    start_time_raw = data.get("start_time")
    end_time_raw = data.get("end_time")

    if not start_time_raw:
        return jsonify({"error": "Start date and time are required."}), 400

    try:
        # Handle ISO strings like 2026-10-26T14:00 or with timezone
        start_dt = datetime.fromisoformat(start_time_raw.replace("Z", "+00:00"))
        if start_dt.tzinfo is None:
            start_dt = start_dt.replace(tzinfo=timezone.utc)
    except Exception:
        return jsonify({"error": "Invalid start_time format. Use ISO format (YYYY-MM-DDTHH:MM)."}), 400

    # Ensure start_time is in the future
    now = datetime.now(timezone.utc)
    if start_dt < now:
        return jsonify({"error": "Slot start time must be in the future."}), 400

    if end_time_raw:
        try:
            end_dt = datetime.fromisoformat(end_time_raw.replace("Z", "+00:00"))
            if end_dt.tzinfo is None:
                end_dt = end_dt.replace(tzinfo=timezone.utc)
        except Exception:
            end_dt = start_dt + timedelta(minutes=45)
    else:
        end_dt = start_dt + timedelta(minutes=45)

    if end_dt <= start_dt:
        return jsonify({"error": "End time must be after start time."}), 400

    # Prevent overlapping slot for this doctor
    overlap = AvailabilitySlot.query.filter(
        AvailabilitySlot.doctor_id == g.current_doctor.id,
        AvailabilitySlot.start_time < end_dt,
        AvailabilitySlot.end_time > start_dt
    ).first()

    if overlap:
        return jsonify({"error": "An availability slot already exists that overlaps with this time period."}), 409

    slot = AvailabilitySlot(
        doctor_id=g.current_doctor.id,
        start_time=start_dt,
        end_time=end_dt,
        is_booked=False
    )

    try:
        db.session.add(slot)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create slot. Please try again."}), 500

    return jsonify({
        "message": "Availability slot successfully created.",
        "slot": slot.to_dict()
    }), 201

@doctor_portal_bp.route("/slots/<int:slot_id>", methods=["DELETE"])
@require_doctor_auth
def delete_doctor_slot(slot_id):
    """
    Allows a doctor to remove an unbooked slot.
    """
    slot = db.session.get(AvailabilitySlot, slot_id)
    if not slot or slot.doctor_id != g.current_doctor.id:
        return jsonify({"error": "Slot not found on your profile."}), 404

    if slot.is_booked:
        return jsonify({"error": "Cannot delete a slot that already has a booked user appointment. Please cancel the appointment first."}), 400

    try:
        db.session.delete(slot)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete slot."}), 500

    return jsonify({"message": "Availability slot deleted successfully."}), 200
