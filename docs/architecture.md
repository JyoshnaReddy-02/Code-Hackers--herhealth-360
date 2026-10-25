# HerHealth 360 — System Architecture

HerHealth 360 is built as a modular full-stack healthcare education, symptom tracking, and health navigation platform.

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
|  React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts + Lucide React         |
+-----------------------------------------------------------------------------------+
                                          |
                        RESTful HTTP JSON / Bearer Auth
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                             FLASK BACKEND (/api/v1)                               |
|  - CORS & Rate Limiter (Flask-Limiter)                                             |
|  - Werkzeug Secure PBKDF2 Password Hashing                                        |
|  - Token Session Serializer (itsdangerous)                                        |
|  - Deterministic Rule-Based Health Navigator Engine                               |
|  - ReportLab PDF Personal Health Passport Generator                               |
+-----------------------------------------------------------------------------------+
                                          |
                      SQLAlchemy ORM (Scoped Isolation)
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        E: DRIVE PERSISTENT STORAGE                                |
|  - Database: E:\herhealth-360\backend\instance\herhealth.db                       |
|  - Python venv: E:\herhealth-360\backend\.venv                                    |
|  - Caches: E:\herhealth-360\.cache\pip, E:\herhealth-360\.cache\python            |
|  - Generated PDFs: E:\herhealth-360\backend\generated\                            |
|  - Synthetic Dataset: E:\herhealth-360\data\synthetic\synthetic_symptoms.json     |
+-----------------------------------------------------------------------------------+
```

---

## 1. Storage Boundaries & Isolation on E: Drive

All application data, temporary caches, and virtual environments reside strictly on the `E:` drive:
- `E:\herhealth-360\backend\instance\herhealth.db`: SQLite database
- `E:\herhealth-360\backend\.venv`: Python virtual environment
- `E:\herhealth-360\.cache\pip`: Pip package cache
- `E:\herhealth-360\.cache\python`: Python bytecode cache
- `E:\herhealth-360\.cache\npm`: NPM package cache
- `E:\herhealth-360\.tmp`: Temporary process workspace
- `E:\herhealth-360\backend\generated`: Generated ReportLab PDF Health Passports
- `E:\herhealth-360\frontend\dist`: Production build output

---

## 2. Core Subsystems

### A. Authentication & User Isolation
- Passwords hashed using Werkzeug's PBKDF2 with SHA-256 and unique salt.
- Tokens issued using signed serializers with 7-day expiration.
- All database queries for symptoms, appointments, and passport generation filter strictly on `user_id == g.current_user.id`, preventing Insecure Direct Object References (IDOR).

### B. Deterministic AI Health Navigator
- Uses a deterministic rule engine (`evaluate_health_query`).
- Scans input against a conservative list of critical emergency indicators (severe acute pelvic pain, hemorrhage with fainting, third-trimester warning signs, dyspnea).
- Returns emergency actions with direct Indian helplines (112, 102, 1091).
- Non-emergency queries match controlled clinical categories (PCOS, Endometriosis, Cervical health/HPV, Breast health, Pregnancy, Postpartum, Menopause) and return plain-language summaries, when to see a doctor, evidence-based self-care, and links to verified sources (WHO, NHS, CDC).

### C. Appointment Management & Concurrency
- Availability slots are scoped to fictional demo clinicians.
- Double-booking prevention uses database checks within transactions, returning `409 Conflict` if another user attempts to claim an already-booked slot.
- Cancellation and rescheduling automatically release previous slots back to available status.

### D. ReportLab Personal Health Passport
- Compiles user's recorded observations, peak and average severity scores, category breakdowns, and scheduled consultations into a vector PDF stored on the E: drive.
- Delivered as a streaming attachment without revealing underlying operating system paths.
