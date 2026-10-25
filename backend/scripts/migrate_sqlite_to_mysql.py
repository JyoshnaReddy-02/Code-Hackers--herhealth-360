"""
HerHealth 360 - SQLite to MySQL Migration Utility
Transfers existing records from SQLite backup to target MySQL database safely.
Does NOT delete or modify the source SQLite database.
"""

import os
import sys
import argparse
from datetime import datetime

from dotenv import load_dotenv

# Add backend directory to sys.path and load environment variables
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

load_dotenv(os.path.join(backend_dir, ".env"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import db, User, Doctor, AvailabilitySlot, Appointment, SymptomEntry, HealthResource, ExercisePractice

def migrate(source_sqlite_path: str, target_mysql_url: str):
    print("=" * 65)
    print(" HerHealth 360 — SQLite to MySQL Safe Migration Tool")
    print("=" * 65)

    if not os.path.exists(source_sqlite_path):
        print(f"[ERROR] Source SQLite database not found at: {source_sqlite_path}")
        return False

    # Normalize target MySQL URL
    if target_mysql_url.startswith("mysql://"):
        target_mysql_url = target_mysql_url.replace("mysql://", "mysql+pymysql://", 1)

    # Mask password for display
    display_url = target_mysql_url
    if "@" in target_mysql_url and ":" in target_mysql_url.split("@")[0]:
        prefix = target_mysql_url.split("@")[0]
        user_part = prefix.split(":")[0] + ":" + prefix.split(":")[1]
        display_url = f"{user_part}:****@{target_mysql_url.split('@')[1]}"

    print(f" Source SQLite : {source_sqlite_path}")
    print(f" Target MySQL  : {display_url}")
    print("-" * 65)

    # 1. Connect to SQLite
    sqlite_uri = f"sqlite:///{source_sqlite_path.replace(os.sep, '/')}"
    sqlite_engine = create_engine(sqlite_uri)
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_session = SqliteSession()

    # 2. Connect to MySQL
    connect_args = {}
    ca_path = os.getenv("TIDB_CA_PATH") or os.getenv("MYSQL_SSL_CA")
    if not ca_path and "tidbcloud.com" in target_mysql_url.lower():
        local_cert = os.path.join(backend_dir, "certs", "isrgrootx1.pem")
        if os.path.exists(local_cert):
            ca_path = local_cert

    if ca_path and os.path.exists(ca_path):
        connect_args["ssl"] = {"ca": ca_path}

    try:
        mysql_engine = create_engine(target_mysql_url, pool_recycle=280, pool_pre_ping=True, connect_args=connect_args)
        # Test connection
        with mysql_engine.connect() as conn:
            pass
        print("[+] Successfully connected to target MySQL server.")
    except Exception as e:
        print(f"[ERROR] Could not connect to target MySQL database: {e}")
        print("\nTip: Ensure the database exists on your MySQL server (e.g. CREATE DATABASE herhealth360;)")
        return False

    # 3. Create tables in MySQL if they do not exist
    print("[*] Ensuring tables exist in target MySQL database...")
    db.metadata.create_all(mysql_engine)
    MysqlSession = sessionmaker(bind=mysql_engine)
    mysql_session = MysqlSession()

    try:
        # A. Users
        users = sqlite_session.query(User).all()
        user_count = 0
        for u in users:
            existing = mysql_session.query(User).filter_by(email=u.email).first()
            if not existing:
                new_u = User(
                    id=u.id,
                    email=u.email,
                    password_hash=u.password_hash,
                    display_name=u.display_name,
                    date_of_birth=u.date_of_birth,
                    life_stage=u.life_stage,
                    created_at=u.created_at
                )
                mysql_session.add(new_u)
                user_count += 1
        mysql_session.commit()
        print(f"[+] Migrated {user_count} Users (Total in SQLite: {len(users)})")

        # B. Doctors
        doctors = sqlite_session.query(Doctor).all()
        doc_count = 0
        for d in doctors:
            existing = mysql_session.query(Doctor).filter_by(name=d.name).first()
            if not existing:
                new_d = Doctor(
                    id=d.id,
                    name=d.name,
                    email=d.email,
                    password_hash=d.password_hash,
                    specialty=d.specialty,
                    bio=d.bio,
                    is_demo=d.is_demo,
                    is_active=d.is_active
                )
                mysql_session.add(new_d)
                doc_count += 1
        mysql_session.commit()
        print(f"[+] Migrated {doc_count} Doctors (Total in SQLite: {len(doctors)})")

        # C. Availability Slots
        slots = sqlite_session.query(AvailabilitySlot).all()
        slot_count = 0
        for s in slots:
            existing = mysql_session.query(AvailabilitySlot).filter_by(id=s.id).first()
            if not existing:
                new_s = AvailabilitySlot(
                    id=s.id,
                    doctor_id=s.doctor_id,
                    start_time=s.start_time,
                    end_time=s.end_time,
                    is_booked=s.is_booked
                )
                mysql_session.add(new_s)
                slot_count += 1
        mysql_session.commit()
        print(f"[+] Migrated {slot_count} Availability Slots (Total in SQLite: {len(slots)})")

        # D. Appointments
        appointments = sqlite_session.query(Appointment).all()
        apt_count = 0
        for a in appointments:
            existing = mysql_session.query(Appointment).filter_by(id=a.id).first()
            if not existing:
                new_a = Appointment(
                    id=a.id,
                    user_id=a.user_id,
                    doctor_id=a.doctor_id,
                    slot_id=a.slot_id,
                    appointment_time=a.appointment_time,
                    appointment_type=a.appointment_type,
                    status=a.status,
                    notes=a.notes,
                    created_at=a.created_at
                )
                mysql_session.add(new_a)
                apt_count += 1
        mysql_session.commit()
        print(f"[+] Migrated {apt_count} Consultations/Appointments (Total in SQLite: {len(appointments)})")

        # E. Symptoms
        symptoms = sqlite_session.query(SymptomEntry).all()
        sym_count = 0
        for s in symptoms:
            existing = mysql_session.query(SymptomEntry).filter_by(id=s.id).first()
            if not existing:
                new_s = SymptomEntry(
                    id=s.id,
                    user_id=s.user_id,
                    recorded_at=s.recorded_at,
                    category=s.category,
                    symptom_name=s.symptom_name,
                    severity=s.severity,
                    duration_hours=s.duration_hours,
                    notes=s.notes,
                    cycle_day=s.cycle_day,
                    sleep_quality=s.sleep_quality,
                    activity_level=s.activity_level,
                    fatigue_level=s.fatigue_level,
                    mood=s.mood,
                    triggers=s.triggers,
                    created_at=s.created_at,
                    updated_at=s.updated_at
                )
                mysql_session.add(new_s)
                sym_count += 1
        mysql_session.commit()
        print(f"[+] Migrated {sym_count} Symptom Entries (Total in SQLite: {len(symptoms)})")

        # F. Health Resources
        resources = sqlite_session.query(HealthResource).all()
        res_count = 0
        for r in resources:
            existing = mysql_session.query(HealthResource).filter_by(slug=r.slug).first()
            if not existing:
                new_r = HealthResource(
                    id=r.id,
                    title=r.title,
                    slug=r.slug,
                    topic=r.topic,
                    life_stage=r.life_stage,
                    summary=r.summary,
                    overview=r.overview,
                    signs_and_symptoms=r.signs_and_symptoms,
                    when_to_seek_care=r.when_to_seek_care,
                    self_care_info=r.self_care_info,
                    common_misconceptions=r.common_misconceptions,
                    trusted_source=r.trusted_source,
                    source_url=r.source_url,
                    last_reviewed=r.last_reviewed
                )
                mysql_session.add(new_r)
                res_count += 1
        mysql_session.commit()
        print(f"[+] Migrated {res_count} Educational Resources (Total in SQLite: {len(resources)})")

        # G. Exercises
        exercises = sqlite_session.query(ExercisePractice).all()
        ex_count = 0
        for e in exercises:
            existing = mysql_session.query(ExercisePractice).filter_by(title=e.title).first()
            if not existing:
                new_e = ExercisePractice(
                    id=e.id,
                    title=e.title,
                    category=e.category,
                    target_condition=e.target_condition,
                    duration_minutes=e.duration_minutes,
                    difficulty=e.difficulty,
                    description=e.description,
                    instructions=e.instructions,
                    image_url=e.image_url,
                    youtube_url=e.youtube_url,
                    website_url=e.website_url,
                    source_reference=e.source_reference,
                    created_at=e.created_at
                )
                mysql_session.add(new_e)
                ex_count += 1
        mysql_session.commit()
        print(f"[+] Migrated {ex_count} Evidence-Based Exercises (Total in SQLite: {len(exercises)})")

        print("=" * 65)
        print(" SUCCESS: All SQLite data successfully copied into MySQL!")
        print(" Note: The original SQLite database was untouched and preserved.")
        print("=" * 65)
        return True

    except Exception as e:
        mysql_session.rollback()
        print(f"[ERROR] Migration failed during data copy: {e}")
        return False
    finally:
        sqlite_session.close()
        mysql_session.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate HerHealth 360 data from SQLite to MySQL")
    parser.add_argument("--sqlite-path", default=os.path.join(backend_dir, "instance", "herhealth.db"), help="Path to source SQLite file")
    parser.add_argument("--mysql-url", default=os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL"), help="Target MySQL connection URI (mysql+pymysql://...)")

    args = parser.parse_args()

    if not args.mysql_url or "mysql" not in args.mysql_url:
        print("[!] Target MySQL URL not specified.")
        print("Usage:")
        print("  python backend/scripts/migrate_sqlite_to_mysql.py --mysql-url 'mysql+pymysql://user:pass@host:3306/herhealth360'")
        print("Or set DATABASE_URL environment variable in backend/.env")
        sys.exit(1)

    success = migrate(args.sqlite_path, args.mysql_url)
    sys.exit(0 if success else 1)
