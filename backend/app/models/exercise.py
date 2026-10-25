from datetime import datetime, timezone
from . import db

class ExercisePractice(db.Model):
    __tablename__ = "exercise_practices"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    target_condition = db.Column(db.String(120), nullable=False)
    duration_minutes = db.Column(db.Integer, default=15, nullable=False)
    difficulty = db.Column(db.String(50), default="Gentle / Beginner", nullable=False)
    description = db.Column(db.Text, nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    youtube_url = db.Column(db.String(500), nullable=False)
    website_url = db.Column(db.String(500), nullable=True)
    source_reference = db.Column(db.String(200), default="Evidence-based Physical Therapy & Obstetric Guidelines", nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "target_condition": self.target_condition,
            "duration_minutes": self.duration_minutes,
            "difficulty": self.difficulty,
            "description": self.description,
            "instructions": self.instructions,
            "image_url": self.image_url,
            "youtube_url": self.youtube_url,
            "website_url": self.website_url,
            "source_reference": self.source_reference,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
