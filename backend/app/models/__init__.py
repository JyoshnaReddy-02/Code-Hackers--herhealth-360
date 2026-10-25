from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .doctor import Doctor, AvailabilitySlot
from .appointment import Appointment
from .symptom import SymptomEntry
from .resource import HealthResource
from .exercise import ExercisePractice

__all__ = [
    "db",
    "User",
    "Doctor",
    "AvailabilitySlot",
    "Appointment",
    "SymptomEntry",
    "HealthResource",
    "ExercisePractice",
]
