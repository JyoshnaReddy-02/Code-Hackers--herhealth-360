import pytest
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User, Doctor, AvailabilitySlot, HealthResource, ExercisePractice
from app.security import generate_auth_token
from datetime import datetime, timedelta, timezone

@pytest.fixture
def app():
    # Use isolated in-memory SQLite database for testing - NEVER modify dev database
    test_config = {
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SECRET_KEY": "test-secret-key-herhealth360-2026",
        "RATELIMIT_ENABLED": False
    }
    app = create_app(test_config=test_config)

    with app.app_context():
        db.create_all()

        # Seed test doctor and slots
        doc = Doctor(
            name="Dr Ananya Rao",
            email="dr.ananya@herhealth360.internal",
            specialty="Gynecology and reproductive health education",
            bio="Fictional demo clinician for testing",
            is_demo=True,
            is_active=True
        )
        doc.set_password("DoctorDemo2026!")
        db.session.add(doc)
        db.session.flush()

        future_time = datetime.now(timezone.utc) + timedelta(days=2)
        slot1 = AvailabilitySlot(
            doctor_id=doc.id,
            start_time=future_time,
            end_time=future_time + timedelta(minutes=45),
            is_booked=False
        )
        slot2 = AvailabilitySlot(
            doctor_id=doc.id,
            start_time=future_time + timedelta(hours=2),
            end_time=future_time + timedelta(hours=2, minutes=45),
            is_booked=False
        )
        db.session.add_all([slot1, slot2])

        # Seed sample resource
        res = HealthResource(
            title="PCOS & PCOD Guide",
            slug="pcos-pcod-guide",
            topic="PCOS and PCOD",
            life_stage="Reproductive",
            summary="Understanding PCOS",
            overview="Educational overview of PCOS.",
            when_to_seek_care="When periods are irregular for >3 months.",
            self_care_info="Lifestyle and nutrition.",
            trusted_source="WHO",
            source_url="https://www.who.int/",
            last_reviewed="2026-03-01"
        )
        db.session.add(res)

        # Seed sample exercises for testing
        ex1 = ExercisePractice(
            title='Low-Impact Fat Burn & Cardio for Beginners',
            category='Weight Loss & Metabolic Cardio',
            target_condition='Healthy Weight Loss & Calorie Burn',
            duration_minutes=25,
            difficulty='Gentle / Low Impact',
            description='Joint-friendly aerobic fat burning routine.',
            instructions='Perform 40 seconds of movement followed by 20 seconds of rest.',
            image_url='https://images.unsplash.com/photo-1518611012118-696072aa579a',
            youtube_url='https://www.youtube.com/watch?v=gC_L9qAHVJ8',
            website_url='https://www.nhs.uk/live-well/exercise/'
        )
        ex2 = ExercisePractice(
            title='Restorative Yoga for Menstrual Cramps & PCOS',
            category='Menstrual Comfort & Cycle Syncing',
            target_condition='Dysmenorrhea & PCOS Pelvic Aches',
            duration_minutes=15,
            difficulty='Gentle / Restorative',
            description='Gentle postures to release uterine tension.',
            instructions='Perform Child’s Pose with knees wide.',
            image_url='https://images.unsplash.com/photo-1506126613408-eca07ce68773',
            youtube_url='https://www.youtube.com/watch?v=awrZtZ49_bg',
            website_url='https://www.who.int/'
        )
        ex3 = ExercisePractice(
            title='Doctor Explains 11 Causes of Breast Pain & Warning Signs',
            category='Breast Health & Clinical Guidance',
            target_condition='Cyclic & Non-Cyclic Breast Pain (Mastalgia)',
            duration_minutes=12,
            difficulty='Educational / Clinical Guide',
            description='Specialist physician breakdown on cyclic breast tenderness and musculoskeletal triggers.',
            instructions='Learn how to differentiate cyclic hormonal tenderness from chest wall muscle strain.',
            image_url='https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
            youtube_url='https://www.youtube.com/watch?v=opVic1ubxu4',
            website_url='https://www.nhs.uk/conditions/breast-pain-mastalgia/'
        )
        db.session.add_all([ex1, ex2, ex3])
        db.session.commit()

        yield app

        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def test_user(app):
    with app.app_context():
        user = User(
            email="primary_test@herhealth360.internal",
            display_name="Primary Test User",
            date_of_birth="1995-01-01",
            life_stage="reproductive"
        )
        user.set_password("SecurePassword123!")
        db.session.add(user)
        db.session.commit()
        return user.id

@pytest.fixture
def other_user(app):
    with app.app_context():
        user = User(
            email="other_test@herhealth360.internal",
            display_name="Other Test User",
            date_of_birth="1992-06-15",
            life_stage="reproductive"
        )
        user.set_password("SecurePassword456!")
        db.session.add(user)
        db.session.commit()
        return user.id

@pytest.fixture
def auth_headers(app, test_user):
    with app.app_context():
        token = generate_auth_token(test_user)
        return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def other_auth_headers(app, other_user):
    with app.app_context():
        token = generate_auth_token(other_user)
        return {"Authorization": f"Bearer {token}"}
