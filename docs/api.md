# HerHealth 360 — Backend API Reference

API Base URL: `/api/v1`

---

## 1. System Health
### `GET /api/v1/health`
Checks backend service and database connectivity.
- **Status:** 200 OK / 503 Service Unavailable
- **Response:**
  ```json
  {
    "status": "healthy",
    "service": "HerHealth 360 Backend API",
    "database_connected": true,
    "database_engine": "SQLite (E: drive instance)",
    "timestamp": "2026-10-24T17:55:42Z",
    "version": "1.0.0",
    "platform": "HerHealth 360 Women's Digital Health Platform"
  }
  ```

---

## 2. Authentication
### `POST /api/v1/auth/register`
Creates a new user account.
- **Body:** `{ "email": "...", "password": "...", "display_name": "...", "date_of_birth": "...", "life_stage": "..." }`
- **Status:** 201 Created (or 409 Conflict if email exists)

### `POST /api/v1/auth/login`
Authenticates an existing user.
- **Body:** `{ "email": "...", "password": "..." }`
- **Status:** 200 OK (returns `token` and `user` payload)

### `POST /api/v1/auth/logout`
Terminates session.
- **Status:** 200 OK

### `GET /api/v1/auth/me`
Fetches current authenticated user.
- **Headers:** `Authorization: Bearer <token>`
- **Status:** 200 OK / 401 Unauthorized

---

## 3. User Profile
### `GET /api/v1/profile`
- **Status:** 200 OK

### `PATCH /api/v1/profile`
Updates display name, date of birth, or life stage.
- **Body:** `{ "display_name": "...", "date_of_birth": "...", "life_stage": "..." }`
- **Status:** 200 OK

---

## 4. Symptom Observations
### `GET /api/v1/symptoms`
Filters authorized user's observations.
- **Query Params:** `category`, `start_date`, `end_date`, `min_severity`, `max_severity`
- **Status:** 200 OK

### `POST /api/v1/symptoms`
Records a new observation.
- **Body:**
  ```json
  {
    "category": "Menstrual",
    "symptom_name": "Lower Pelvic Cramping",
    "severity": 7,
    "duration_hours": 3.5,
    "cycle_day": 2,
    "sleep_quality": 3,
    "fatigue_level": 4,
    "activity_level": "Moderate",
    "mood": "Irritable",
    "triggers": "Work deadline",
    "notes": "Relieved by heating pad"
  }
  ```
- **Status:** 201 Created / 400 Bad Request

### `PATCH /api/v1/symptoms/<id>`
Updates an observation owned by current user.
- **Status:** 200 OK / 404 Not Found (or unowned)

### `DELETE /api/v1/symptoms/<id>`
Deletes an observation owned by current user.
- **Status:** 200 OK / 404 Not Found (or unowned)

---

## 5. Health Analytics
### `GET /api/v1/analytics/symptoms`
Computes chronological severity timeline, daily frequency, category breakdown, and wellness correlations.
- **Status:** 200 OK

---

## 6. Doctor Directory & Consultations
### `GET /api/v1/doctors`
Lists fictional clinicians with demo notice.
- **Query Params:** `specialty`
- **Status:** 200 OK

### `GET /api/v1/doctors/<id>/slots`
Lists unbooked future availability slots for a clinician.
- **Status:** 200 OK

### `GET /api/v1/appointments`
Lists authenticated user's booked, cancelled, or completed appointments.
- **Status:** 200 OK

### `POST /api/v1/appointments`
Books a slot with double-booking conflict prevention.
- **Body:** `{ "slot_id": 12, "appointment_type": "video", "notes": "..." }`
- **Status:** 201 Created / 409 Conflict (if slot already taken)

### `POST /api/v1/appointments/<id>/cancel`
Cancels an appointment and releases the slot.
- **Status:** 200 OK / 404 Not Found

### `POST /api/v1/appointments/<id>/reschedule`
Moves an appointment to a new available slot.
- **Body:** `{ "new_slot_id": 14 }`
- **Status:** 200 OK / 409 Conflict

---

## 7. AI Health Navigator
### `POST /api/v1/navigator`
Deterministic clinical guidance and red-flag screening.
- **Body:** `{ "query": "..." }`
- **Status:** 200 OK

---

## 8. Health Library & MotherCare
### `GET /api/v1/health-topics`
### `GET /api/v1/resources`
### `GET /api/v1/resources/<slug>`
### `GET /api/v1/mothercare`
### `GET /api/v1/wellness`

---

## 9. Personal Health Passport PDF
### `GET /api/v1/health-passport.pdf`
Generates and downloads ReportLab vector PDF for authenticated user.
- **Query Params:** `start_date`, `end_date`
- **Headers:** `Authorization: Bearer <token>`
- **Content-Type:** `application/pdf`
- **Status:** 200 OK
