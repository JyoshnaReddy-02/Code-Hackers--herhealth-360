from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from ..models import db, Appointment, AvailabilitySlot, Doctor
from ..security import require_auth

appointments_bp = Blueprint("appointments", __name__, url_prefix="/api/v1/appointments")

@appointments_bp.route("", methods=["GET"])
@require_auth
def get_appointments():
    status_filter = request.args.get("status")
    query = Appointment.query.filter_by(user_id=g.current_user.id)
    
    if status_filter:
        query = query.filter_by(status=status_filter.lower())

    appointments = query.order_by(Appointment.appointment_time.asc()).all()
    return jsonify({
        "appointments": [a.to_dict() for a in appointments]
    }), 200

@appointments_bp.route("", methods=["POST"])
@require_auth
def book_appointment():
    data = request.get_json(silent=True) or {}
    slot_id = data.get("slot_id")
    appointment_type = (data.get("appointment_type") or "video").lower()
    notes = (data.get("notes") or "").strip()

    if not slot_id or not isinstance(slot_id, int):
        return jsonify({"error": "A valid slot_id is required."}), 400

    if appointment_type not in ["video", "in_person"]:
        appointment_type = "video"

    if notes and len(notes) > 500:
        return jsonify({"error": "Notes cannot exceed 500 characters."}), 400

    now = datetime.now(timezone.utc)

    # Use atomic transaction with locking
    try:
        # Query with with_for_update if supported or check slot state inside transaction
        slot = AvailabilitySlot.query.filter_by(id=slot_id).with_for_update().first() if db.engine.name != "sqlite" else AvailabilitySlot.query.filter_by(id=slot_id).first()
        
        if not slot:
            return jsonify({"error": "The requested availability slot does not exist."}), 404

        if slot.is_booked:
            return jsonify({
                "error": "This slot has already been booked by another user. Please select another slot.",
                "conflict": True
            }), 409

        # Ensure slot is in the future
        slot_time = slot.start_time
        if slot_time.tzinfo is None:
            slot_time = slot_time.replace(tzinfo=timezone.utc)
        
        if slot_time < now:
            return jsonify({"error": "Cannot book a time slot in the past."}), 400

        # Mark slot as booked
        slot.is_booked = True

        # Create appointment record
        appointment = Appointment(
            user_id=g.current_user.id,
            doctor_id=slot.doctor_id,
            slot_id=slot.id,
            appointment_time=slot.start_time,
            appointment_type=appointment_type,
            status="booked",
            notes=notes if notes else None
        )
        db.session.add(appointment)
        db.session.commit()

        # Fictional Jitsi demonstration room name (safe, anonymous demo ID)
        jitsi_room = f"HerHealth360-Demo-Apt{appointment.id}" if appointment_type == "video" else None

        res = appointment.to_dict()
        if jitsi_room:
            res["jitsi_room_url"] = f"https://meet.jit.si/{jitsi_room}"
            res["video_notice"] = "Demonstration video consultation only. Do not share confidential medical info in public rooms."

        return jsonify({
            "message": "Appointment booked successfully.",
            "appointment": res
        }), 201

    except Exception as e:
        db.session.rollback()
        error_str = str(e)
        if "UNIQUE constraint" in error_str or "conflict" in error_str.lower():
            return jsonify({
                "error": "This slot has already been booked or is no longer available. Please select another slot.",
                "conflict": True
            }), 409
        return jsonify({"error": "Failed to book appointment. Please try again."}), 500

@appointments_bp.route("/<int:appointment_id>", methods=["GET"])
@require_auth
def get_appointment(appointment_id):
    appointment = Appointment.query.filter_by(id=appointment_id, user_id=g.current_user.id).first()
    if not appointment:
        return jsonify({"error": "Appointment not found or unauthorized."}), 404

    res = appointment.to_dict()
    if appointment.appointment_type == "video" and appointment.status == "booked":
        res["jitsi_room_url"] = f"https://meet.jit.si/HerHealth360-Demo-Apt{appointment.id}"
        res["video_notice"] = "Educational demo room. Not for confidential clinical care."

    return jsonify({"appointment": res}), 200

@appointments_bp.route("/<int:appointment_id>", methods=["PATCH"])
@require_auth
def update_appointment(appointment_id):
    appointment = Appointment.query.filter_by(id=appointment_id, user_id=g.current_user.id).first()
    if not appointment:
        return jsonify({"error": "Appointment not found or unauthorized."}), 404

    data = request.get_json(silent=True) or {}
    if "notes" in data:
        notes = (data["notes"] or "").strip()
        if len(notes) > 500:
            return jsonify({"error": "Notes cannot exceed 500 characters."}), 400
        appointment.notes = notes if notes else None

    if "appointment_type" in data:
        apt_type = (data["appointment_type"] or "").lower()
        if apt_type in ["video", "in_person"]:
            appointment.appointment_type = apt_type

    try:
        db.session.commit()
        return jsonify({
            "message": "Appointment updated successfully.",
            "appointment": appointment.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update appointment."}), 500

@appointments_bp.route("/<int:appointment_id>/cancel", methods=["POST"])
@require_auth
def cancel_appointment(appointment_id):
    appointment = Appointment.query.filter_by(id=appointment_id, user_id=g.current_user.id).first()
    if not appointment:
        return jsonify({"error": "Appointment not found or unauthorized."}), 404

    if appointment.status == "cancelled":
        return jsonify({"message": "Appointment is already cancelled."}), 200

    try:
        appointment.status = "cancelled"
        
        # Free up the slot so others can book it
        if appointment.slot_id:
            slot = db.session.get(AvailabilitySlot, appointment.slot_id)
            if slot:
                slot.is_booked = False
            appointment.slot_id = None

        db.session.commit()
        return jsonify({
            "message": "Appointment cancelled successfully. Time slot has been released.",
            "appointment": appointment.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to cancel appointment."}), 500

@appointments_bp.route("/<int:appointment_id>/reschedule", methods=["POST"])
@require_auth
def reschedule_appointment(appointment_id):
    appointment = Appointment.query.filter_by(id=appointment_id, user_id=g.current_user.id).first()
    if not appointment:
        return jsonify({"error": "Appointment not found or unauthorized."}), 404

    data = request.get_json(silent=True) or {}
    new_slot_id = data.get("new_slot_id")

    if not new_slot_id or not isinstance(new_slot_id, int):
        return jsonify({"error": "A valid new_slot_id is required."}), 400

    now = datetime.now(timezone.utc)

    try:
        new_slot = AvailabilitySlot.query.filter_by(id=new_slot_id).first()
        if not new_slot:
            return jsonify({"error": "Requested new slot does not exist."}), 404

        if new_slot.is_booked:
            return jsonify({
                "error": "The requested new slot has already been booked. Please choose another.",
                "conflict": True
            }), 409

        slot_time = new_slot.start_time
        if slot_time.tzinfo is None:
            slot_time = slot_time.replace(tzinfo=timezone.utc)

        if slot_time < now:
            return jsonify({"error": "Cannot reschedule to a past slot."}), 400

        # Free previous slot
        if appointment.slot_id:
            old_slot = db.session.get(AvailabilitySlot, appointment.slot_id)
            if old_slot:
                old_slot.is_booked = False

        # Assign new slot
        new_slot.is_booked = True
        appointment.slot_id = new_slot.id
        appointment.doctor_id = new_slot.doctor_id
        appointment.appointment_time = new_slot.start_time
        appointment.status = "booked"

        db.session.commit()
        return jsonify({
            "message": "Appointment rescheduled successfully.",
            "appointment": appointment.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to reschedule appointment."}), 500
