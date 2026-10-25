import json
from datetime import datetime, timedelta, timezone
from app.models import AvailabilitySlot, Appointment, SymptomEntry

def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert "HerHealth 360" in data["platform"]

def test_user_registration_and_login(client):
    # Registration
    reg_payload = {
        "email": "newuser@example.com",
        "password": "ValidPassword987!",
        "display_name": "Test User",
        "date_of_birth": "1998-04-12",
        "life_stage": "reproductive"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.get_json()
    assert "token" in reg_data
    assert reg_data["user"]["email"] == "newuser@example.com"
    assert "password_hash" not in reg_data["user"]

    # Duplicate registration should return 409
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 409

    # Valid Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "newuser@example.com",
        "password": "ValidPassword987!"
    })
    assert login_res.status_code == 200
    login_data = login_res.get_json()
    assert "token" in login_data

    # Invalid password login
    bad_login = client.post("/api/v1/auth/login", json={
        "email": "newuser@example.com",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

def test_unauthorized_access(client):
    # Without token
    res = client.get("/api/v1/symptoms")
    assert res.status_code == 401

    res = client.get("/api/v1/appointments")
    assert res.status_code == 401

    res = client.get("/api/v1/profile")
    assert res.status_code == 401

def test_symptom_crud_and_validation(client, auth_headers):
    # 1. Validation failure: Invalid category
    invalid_cat_res = client.post("/api/v1/symptoms", headers=auth_headers, json={
        "category": "InvalidCategoryName",
        "symptom_name": "Headache",
        "severity": 5
    })
    assert invalid_cat_res.status_code == 400

    # 2. Validation failure: Severity out of bounds (> 10)
    invalid_sev_res = client.post("/api/v1/symptoms", headers=auth_headers, json={
        "category": "Menstrual",
        "symptom_name": "Severe Cramps",
        "severity": 11
    })
    assert invalid_sev_res.status_code == 400

    # 3. Successful symptom creation
    valid_payload = {
        "category": "Menstrual",
        "symptom_name": "Lower Pelvic Cramping",
        "severity": 6,
        "duration_hours": 3.5,
        "cycle_day": 2,
        "sleep_quality": 3,
        "fatigue_level": 4,
        "mood": "Irritable",
        "triggers": "Work deadline",
        "notes": "Eased with heating pad"
    }
    create_res = client.post("/api/v1/symptoms", headers=auth_headers, json=valid_payload)
    assert create_res.status_code == 201
    created_data = create_res.get_json()
    entry_id = created_data["symptom"]["id"]
    assert created_data["symptom"]["severity"] == 6

    # 4. Get symptoms list
    list_res = client.get("/api/v1/symptoms", headers=auth_headers)
    assert list_res.status_code == 200
    list_data = list_res.get_json()
    assert list_data["count"] == 1
    assert list_data["symptoms"][0]["id"] == entry_id

    # 5. Patch/Update symptom
    patch_res = client.patch(f"/api/v1/symptoms/{entry_id}", headers=auth_headers, json={
        "severity": 4,
        "notes": "Updated note: feeling slightly better"
    })
    assert patch_res.status_code == 200
    assert patch_res.get_json()["symptom"]["severity"] == 4

    # 6. Delete symptom
    del_res = client.delete(f"/api/v1/symptoms/{entry_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # Verify deleted
    get_res = client.get(f"/api/v1/symptoms/{entry_id}", headers=auth_headers)
    assert get_res.status_code == 404

def test_user_data_isolation(client, auth_headers, other_auth_headers):
    # User 1 creates symptom
    create_res = client.post("/api/v1/symptoms", headers=auth_headers, json={
        "category": "Menstrual",
        "symptom_name": "User 1 Private Symptom",
        "severity": 7
    })
    assert create_res.status_code == 201
    user1_symptom_id = create_res.get_json()["symptom"]["id"]

    # User 2 tries to GET User 1's symptom
    unauth_get = client.get(f"/api/v1/symptoms/{user1_symptom_id}", headers=other_auth_headers)
    assert unauth_get.status_code == 404  # Isolated, does not exist for User 2

    # User 2 tries to DELETE User 1's symptom
    unauth_del = client.delete(f"/api/v1/symptoms/{user1_symptom_id}", headers=other_auth_headers)
    assert unauth_del.status_code == 404

    # User 2 symptom list should be empty
    user2_list = client.get("/api/v1/symptoms", headers=other_auth_headers)
    assert user2_list.status_code == 200
    assert user2_list.get_json()["count"] == 0

def test_analytics_calculations(client, auth_headers):
    # Add multiple symptom records
    client.post("/api/v1/symptoms", headers=auth_headers, json={
        "category": "Menstrual",
        "symptom_name": "Cramping",
        "severity": 8,
        "fatigue_level": 4,
        "sleep_quality": 2
    })
    client.post("/api/v1/symptoms", headers=auth_headers, json={
        "category": "Breast",
        "symptom_name": "Tenderness",
        "severity": 4,
        "fatigue_level": 2,
        "sleep_quality": 4
    })

    analytics_res = client.get("/api/v1/analytics/symptoms", headers=auth_headers)
    assert analytics_res.status_code == 200
    data = analytics_res.get_json()
    assert data["total_entries"] == 2
    assert data["average_severity"] == 6.0
    assert data["peak_severity"] == 8
    assert len(data["category_distribution"]) == 2
    assert "disclaimer" in data

def test_appointment_booking_and_double_booking_prevention(client, auth_headers, other_auth_headers):
    # Get available slots
    docs_res = client.get("/api/v1/doctors")
    assert docs_res.status_code == 200
    doc_id = docs_res.get_json()["doctors"][0]["id"]

    slots_res = client.get(f"/api/v1/doctors/{doc_id}/slots")
    assert slots_res.status_code == 200
    slots = slots_res.get_json()["slots"]
    assert len(slots) >= 2
    slot_id = slots[0]["id"]

    # User 1 books the slot
    book_res = client.post("/api/v1/appointments", headers=auth_headers, json={
        "slot_id": slot_id,
        "appointment_type": "video",
        "notes": "Discuss irregular cycle history"
    })
    assert book_res.status_code == 201
    apt_data = book_res.get_json()
    apt_id = apt_data["appointment"]["id"]
    assert apt_data["appointment"]["status"] == "booked"

    # User 2 tries to book the EXACT SAME slot -> Must return 409 Conflict
    conflict_res = client.post("/api/v1/appointments", headers=other_auth_headers, json={
        "slot_id": slot_id,
        "appointment_type": "video"
    })
    assert conflict_res.status_code == 409
    assert "already been booked" in conflict_res.get_json()["error"]

    # User 1 cancels the appointment -> Slot should be released
    cancel_res = client.post(f"/api/v1/appointments/{apt_id}/cancel", headers=auth_headers)
    assert cancel_res.status_code == 200
    assert cancel_res.get_json()["appointment"]["status"] == "cancelled"

    # Now User 2 can book the released slot
    retry_book = client.post("/api/v1/appointments", headers=other_auth_headers, json={
        "slot_id": slot_id,
        "appointment_type": "video"
    })
    assert retry_book.status_code == 201

def test_ai_health_navigator_safety(client):
    # 1. Critical Red Flag Emergency Test
    emergency_res = client.post("/api/v1/navigator", json={
        "query": "I have sudden severe pelvic pain and I am faint and bleeding heavily"
    })
    assert emergency_res.status_code == 200
    em_data = emergency_res.get_json()
    assert em_data["is_emergency"] is True
    assert em_data["urgency_level"] == "CRITICAL_EMERGENCY"
    assert "112" in em_data["emergency_actions"][0]

    # 2. Non-emergency educational query test
    pcos_res = client.post("/api/v1/navigator", json={
        "query": "I think I have PCOS because of irregular periods and facial hair"
    })
    assert pcos_res.status_code == 200
    pcos_data = pcos_res.get_json()
    assert pcos_data["is_emergency"] is False
    assert "PCOS" in pcos_data["title"]
    assert len(pcos_data["trusted_sources"]) > 0
    assert "educational" in pcos_data["disclaimer"].lower()
    assert "recommended_exercises" in pcos_data

    # 3. Targeted Weight Loss & Exercise query test
    weight_res = client.post("/api/v1/navigator", json={
        "query": "i need excersise videos for weight loss"
    })
    assert weight_res.status_code == 200
    weight_data = weight_res.get_json()
    assert weight_data["is_emergency"] is False
    assert "Weight" in weight_data["title"] or "Metabolism" in weight_data["title"]
    assert len(weight_data["recommended_exercises"]) > 0
    top_ex = weight_data["recommended_exercises"][0]
    assert "Weight" in top_ex["category"] or "Cardio" in top_ex["category"] or "Fat Burn" in top_ex["title"]

    # 4. Targeted Breast Pain query test
    breast_res = client.post("/api/v1/navigator", json={
        "query": "i am getting breast pain from last 2 days on wards"
    })
    assert breast_res.status_code == 200
    breast_data = breast_res.get_json()
    assert breast_data["is_emergency"] is False
    assert "Breast" in breast_data["title"]
    assert len(breast_data["recommended_exercises"]) > 0
    top_breast_ex = breast_data["recommended_exercises"][0]
    assert "Breast" in top_breast_ex["category"] or "Breast" in top_breast_ex["title"]
    assert "opVic1ubxu4" in top_breast_ex["youtube_url"] or "xcg7jWrlLJ8" in top_breast_ex["youtube_url"]

def test_health_passport_pdf_generation(client, auth_headers):
    # Add a symptom entry first
    client.post("/api/v1/symptoms", headers=auth_headers, json={
        "category": "Pelvic or abdominal discomfort",
        "symptom_name": "Aching",
        "severity": 5
    })

    # Download PDF
    pdf_res = client.get("/api/v1/health-passport.pdf", headers=auth_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.content_type == "application/pdf"
    assert len(pdf_res.data) > 1000  # Valid binary PDF data generated
    assert pdf_res.data.startswith(b"%PDF")

def test_doctor_portal_login_and_slot_management(client):
    # 1. Doctor login with valid credentials
    login_res = client.post("/api/v1/doctor/login", json={
        "email": "dr.ananya@herhealth360.internal",
        "password": "DoctorDemo2026!"
    })
    assert login_res.status_code == 200
    login_data = login_res.get_json()
    assert "token" in login_data
    assert login_data["role"] == "doctor"
    assert login_data["doctor"]["name"] == "Dr Ananya Rao"
    doc_token = login_data["token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    # 2. Get doctor profile
    me_res = client.get("/api/v1/doctor/me", headers=doc_headers)
    assert me_res.status_code == 200
    assert me_res.get_json()["doctor"]["email"] == "dr.ananya@herhealth360.internal"

    # 3. Add a new availability slot
    new_slot_res = client.post("/api/v1/doctor/slots", headers=doc_headers, json={
        "start_time": (datetime.now(timezone.utc) + timedelta(days=20, hours=2)).isoformat()
    })
    assert new_slot_res.status_code == 201
    slot_id = new_slot_res.get_json()["slot"]["id"]

    # 4. Delete the slot
    del_res = client.delete(f"/api/v1/doctor/slots/{slot_id}", headers=doc_headers)
    assert del_res.status_code == 200

def test_admin_portal_insights_and_exercise_management(client):
    # 1. Admin login with valid credentials
    admin_res = client.post("/api/v1/admin/login", json={
        "email": "admin@herhealth360.internal",
        "password": "AdminMaster2026!"
    })
    assert admin_res.status_code == 200
    admin_data = admin_res.get_json()
    assert "token" in admin_data
    assert admin_data["role"] == "admin"
    admin_token = admin_data["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Get platform overview
    overview_res = client.get("/api/v1/admin/overview", headers=admin_headers)
    assert overview_res.status_code == 200
    ov_data = overview_res.get_json()
    assert "metrics" in ov_data
    assert "total_users" in ov_data["metrics"]

    # 3. Get user problems insights
    problems_res = client.get("/api/v1/admin/user-problems", headers=admin_headers)
    assert problems_res.status_code == 200

    # 4. Get doctor questions insights
    questions_res = client.get("/api/v1/admin/doctor-questions", headers=admin_headers)
    assert questions_res.status_code == 200

    # 5. Add and delete an exercise
    add_ex_res = client.post("/api/v1/admin/exercises", headers=admin_headers, json={
        "title": "Core Breath Test",
        "category": "Pelvic Health",
        "description": "Test exercise",
        "instructions": "Inhale and exhale gently.",
        "image_url": "https://example.com/image.jpg",
        "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    })
    assert add_ex_res.status_code == 201
    ex_id = add_ex_res.get_json()["exercise"]["id"]

    del_ex_res = client.delete(f"/api/v1/admin/exercises/{ex_id}", headers=admin_headers)
    assert del_ex_res.status_code == 200
