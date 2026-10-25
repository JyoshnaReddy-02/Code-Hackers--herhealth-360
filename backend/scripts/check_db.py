"""
HerHealth 360 - Database Connectivity & Health Diagnostics
Checks database engine, connection status, table row counts, and cloud/local readiness.
"""

import os
import sys

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app, db
from app.models import User, Doctor, AvailabilitySlot, Appointment, SymptomEntry, HealthResource, ExercisePractice

def check_database():
    print("=" * 65)
    print(" HerHealth 360 — Database Diagnostics")
    print("=" * 65)

    app = create_app()
    with app.app_context():
        raw_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
        # Mask password
        masked_uri = raw_uri
        if "@" in raw_uri and ":" in raw_uri.split("@")[0]:
            parts = raw_uri.split("@")
            user_part = parts[0].split(":")[0] + ":" + parts[0].split(":")[1]
            masked_uri = f"{user_part}:****@{parts[1]}"

        print(f" Configured URI : {masked_uri}")

        engine_name = db.engine.name if hasattr(db, "engine") and db.engine else "unknown"
        print(f" Engine Type    : {engine_name.upper()}")

        try:
            db.session.execute(db.text("SELECT 1"))
            print(" Connection     : OK (Connected successfully)")
        except Exception as e:
            print(f" Connection     : FAILED ({e})")
            return False

        print("-" * 65)
        print(" Table Record Counts:")
        try:
            print(f"   • Users               : {User.query.count()}")
            print(f"   • Clinicians / Doctors: {Doctor.query.count()}")
            print(f"   • Availability Slots  : {AvailabilitySlot.query.count()}")
            print(f"   • Appointments        : {Appointment.query.count()}")
            print(f"   • Symptom Logs        : {SymptomEntry.query.count()}")
            print(f"   • Educational Topics  : {HealthResource.query.count()}")
            print(f"   • Exercise Practices  : {ExercisePractice.query.count()}")
        except Exception as e:
            print(f"   [!] Error querying table counts: {e}")
            print("   (Tables may need to be initialized using run.py or seed_demo.py)")

        print("=" * 65)
        if engine_name == "mysql":
            if "localhost" in raw_uri or "127.0.0.1" in raw_uri:
                print(" Status: Connected to LOCAL MySQL database.")
                print(" Note  : To share data with the deployed Vercel site, switch to a cloud MySQL URI.")
            else:
                print(" Status: Connected to CLOUD MySQL database (Shared Data Mode enabled!).")
        else:
            print(" Status: Running on local SQLite database backup.")
            print(" To switch to MySQL, configure DATABASE_URL in backend/.env")
        print("=" * 65)
        return True

if __name__ == "__main__":
    check_database()
