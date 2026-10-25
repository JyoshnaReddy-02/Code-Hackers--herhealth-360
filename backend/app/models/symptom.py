from datetime import datetime, timezone
from . import db

class SymptomEntry(db.Model):
    __tablename__ = "symptom_entries"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    category = db.Column(db.String(100), nullable=False, index=True)
    symptom_name = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.Integer, nullable=False)  # 1 - 10
    duration_hours = db.Column(db.Float, nullable=True)  # duration in hours
    notes = db.Column(db.String(1000), nullable=True)
    
    # Optional context fields
    cycle_day = db.Column(db.Integer, nullable=True)
    sleep_quality = db.Column(db.Integer, nullable=True)  # 1 - 5
    activity_level = db.Column(db.String(50), nullable=True)  # Sedentary, Light, Moderate, High
    fatigue_level = db.Column(db.Integer, nullable=True)  # 1 - 5
    mood = db.Column(db.String(50), nullable=True)  # Calm, Anxious, Low, Energetic, Irritable
    triggers = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None,
            "category": self.category,
            "symptom_name": self.symptom_name,
            "severity": self.severity,
            "duration_hours": self.duration_hours,
            "notes": self.notes,
            "cycle_day": self.cycle_day,
            "sleep_quality": self.sleep_quality,
            "activity_level": self.activity_level,
            "fatigue_level": self.fatigue_level,
            "mood": self.mood,
            "triggers": self.triggers,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
