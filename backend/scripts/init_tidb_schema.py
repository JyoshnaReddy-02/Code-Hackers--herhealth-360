"""
HerHealth 360 - Safe Schema Creation Script
Creates all application tables in the configured database (TiDB Cloud / MySQL)
using non-destructive CREATE TABLE IF NOT EXISTS statements.
Does not delete, truncate, drop, or overwrite any existing tables or data.
"""

import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app, db
from app.models import (
    User,
    Doctor,
    AvailabilitySlot,
    Appointment,
    SymptomEntry,
    HealthResource,
    ExercisePractice,
)

def create_schema():
    print("=" * 65)
    print(" HerHealth 360 — Safe Schema Initialization")
    print("=" * 65)

    app = create_app()
    with app.app_context():
        raw_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
        # Mask password securely
        masked_uri = raw_uri
        if "@" in raw_uri and ":" in raw_uri.split("@")[0]:
            parts = raw_uri.split("@")
            user_part = parts[0].split(":")[0] + ":" + parts[0].split(":")[1]
            masked_uri = f"{user_part}:****@{parts[1]}"

        print(f" Target Database : {masked_uri}")
        print(f" Engine Type     : {db.engine.name.upper()}")

        # 1. Verify connection first
        try:
            db.session.execute(db.text("SELECT 1"))
            print(" Connection Test : OK (Database server reached successfully)")
        except Exception as e:
            print(f"[ERROR] Database connection failed: {e}")
            return False

        # 2. Check existing tables
        inspector = db.inspect(db.engine)
        existing_tables = inspector.get_table_names()
        print(f" Existing Tables : {existing_tables if existing_tables else 'None (Empty Database)'}")

        # 3. Create schema using non-destructive db.create_all()
        print("\n[*] Executing non-destructive CREATE TABLE IF NOT EXISTS...")
        try:
            db.create_all()
            print("[+] Schema creation command executed successfully.")
        except Exception as e:
            print(f"[ERROR] Failed during schema creation: {e}")
            return False

        # 4. Verify created tables
        inspector = db.inspect(db.engine)
        current_tables = inspector.get_table_names()

        print("-" * 65)
        print(" Verification of Registered Tables:")
        expected_models = [
            ("users", User),
            ("doctors", Doctor),
            ("availability_slots", AvailabilitySlot),
            ("appointments", Appointment),
            ("symptom_entries", SymptomEntry),
            ("health_resources", HealthResource),
            ("exercise_practices", ExercisePractice),
        ]

        all_ok = True
        for table_name, model_cls in expected_models:
            if table_name in current_tables:
                count = model_cls.query.count()
                print(f"   • {table_name:<22} : CREATED (Rows: {count})")
            else:
                print(f"   [!] {table_name:<20} : MISSING")
                all_ok = False

        print("=" * 65)
        if all_ok:
            print(" SUCCESS: Complete application schema is active in TiDB Cloud!")
            print(" Note: No data was modified or deleted. SQLite backup remains untouched.")
        else:
            print(" WARNING: Some tables could not be verified.")
        print("=" * 65)
        return all_ok

if __name__ == "__main__":
    success = create_schema()
    sys.exit(0 if success else 1)
