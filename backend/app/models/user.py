from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.String(20), nullable=True)
    life_stage = db.Column(db.String(50), nullable=True, default="reproductive")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    symptoms = db.relationship("SymptomEntry", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    appointments = db.relationship("Appointment", backref="user", cascade="all, delete-orphan", lazy="dynamic")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "display_name": self.display_name,
            "date_of_birth": self.date_of_birth,
            "life_stage": self.life_stage,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
