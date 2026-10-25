from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from ..models import db, Doctor, AvailabilitySlot

doctors_bp = Blueprint("doctors", __name__, url_prefix="/api/v1/doctors")

@doctors_bp.route("", methods=["GET"])
def get_doctors():
    specialty = request.args.get("specialty")
    query = Doctor.query.filter_by(is_active=True)
    
    if specialty and specialty.lower() != "all":
        s_lower = specialty.lower()
        if "pcos" in s_lower or "endometriosis" in s_lower:
            query = query.filter((Doctor.specialty.ilike("%gynecology%")) | (Doctor.bio.ilike("%pcos%")) | (Doctor.bio.ilike("%menstrual%")))
        elif "pregnancy" in s_lower or "antenatal" in s_lower or "postpartum" in s_lower or "obstetrics" in s_lower:
            query = query.filter((Doctor.specialty.ilike("%obstetrics%")) | (Doctor.bio.ilike("%maternal%")) | (Doctor.bio.ilike("%antenatal%")))
        elif "cervical" in s_lower or "hpv" in s_lower or "breast" in s_lower:
            query = query.filter((Doctor.specialty.ilike("%cervical%")) | (Doctor.specialty.ilike("%breast%")) | (Doctor.bio.ilike("%screening%")))
        elif "menopause" in s_lower:
            query = query.filter((Doctor.specialty.ilike("%gynecology%")) | (Doctor.specialty.ilike("%reproductive%")))
        else:
            term = f"%{specialty.strip()}%"
            query = query.filter((Doctor.specialty.ilike(term)) | (Doctor.bio.ilike(term)))
        
    doctors = query.all()
    return jsonify({
        "doctors": [d.to_dict() for d in doctors],
        "notice": "All doctors listed are fictional demo profiles created for educational demonstration only."
    }), 200

@doctors_bp.route("/<int:doctor_id>", methods=["GET"])
def get_doctor(doctor_id):
    doctor = db.session.get(Doctor, doctor_id)
    if not doctor:
        return jsonify({"error": "Doctor profile not found."}), 404

    now = datetime.now(timezone.utc)
    slots = AvailabilitySlot.query.filter(
        AvailabilitySlot.doctor_id == doctor.id,
        AvailabilitySlot.is_booked == False,
        AvailabilitySlot.start_time > now
    ).order_by(AvailabilitySlot.start_time.asc()).all()

    doc_data = doctor.to_dict()
    doc_data["available_slots"] = [s.to_dict() for s in slots]
    doc_data["disclaimer"] = "Fictional demo profile. Not a licensed practicing physician directory."

    return jsonify({"doctor": doc_data}), 200

@doctors_bp.route("/<int:doctor_id>/slots", methods=["GET"])
def get_doctor_slots(doctor_id):
    doctor = db.session.get(Doctor, doctor_id)
    if not doctor:
        return jsonify({"error": "Doctor not found."}), 404

    now = datetime.now(timezone.utc)
    slots = AvailabilitySlot.query.filter(
        AvailabilitySlot.doctor_id == doctor.id,
        AvailabilitySlot.is_booked == False,
        AvailabilitySlot.start_time > now
    ).order_by(AvailabilitySlot.start_time.asc()).all()

    return jsonify({
        "doctor_id": doctor.id,
        "doctor_name": doctor.name,
        "slots": [s.to_dict() for s in slots]
    }), 200
