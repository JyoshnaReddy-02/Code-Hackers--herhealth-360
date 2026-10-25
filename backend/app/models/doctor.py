from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class Doctor(db.Model):
    __tablename__ = "doctors"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=True)
    specialty = db.Column(db.String(120), nullable=False)
    bio = db.Column(db.Text, nullable=False)
    is_demo = db.Column(db.Boolean, default=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    slots = db.relationship("AvailabilitySlot", backref="doctor", cascade="all, delete-orphan", lazy="dynamic")
    appointments = db.relationship("Appointment", backref="doctor", lazy="dynamic")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "specialty": self.specialty,
            "bio": self.bio,
            "is_demo": self.is_demo,
            "is_active": self.is_active,
            "available_slots_count": self.slots.filter_by(is_booked=False).count()
        }

class AvailabilitySlot(db.Model):
    __tablename__ = "availability_slots"

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    is_booked = db.Column(db.Boolean, default=False, nullable=False, index=True)

    appointment = db.relationship("Appointment", backref="slot", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor.name if self.doctor else None,
            "doctor_specialty": self.doctor.specialty if self.doctor else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "is_booked": self.is_booked
        }
