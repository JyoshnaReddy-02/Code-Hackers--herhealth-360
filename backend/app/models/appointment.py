from datetime import datetime, timezone
from . import db

class Appointment(db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    slot_id = db.Column(db.Integer, db.ForeignKey("availability_slots.id", ondelete="SET NULL"), index=True, nullable=True)
    appointment_time = db.Column(db.DateTime, nullable=False)
    appointment_type = db.Column(db.String(50), default="video", nullable=False)
    status = db.Column(db.String(50), default="booked", nullable=False)  # booked, cancelled, completed
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor.name if self.doctor else "Unknown Doctor",
            "doctor_specialty": self.doctor.specialty if self.doctor else "",
            "is_demo_doctor": self.doctor.is_demo if self.doctor else True,
            "slot_id": self.slot_id,
            "appointment_time": self.appointment_time.isoformat() if self.appointment_time else None,
            "appointment_type": self.appointment_type,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
