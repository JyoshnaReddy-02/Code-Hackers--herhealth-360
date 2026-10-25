# HerHealth 360

> **“Every stage of her health. One trusted place.”**  
> Integrated Women's Digital Health & Wellness Platform.

---

## 1. Problem Statement
Women’s health applications overwhelmingly focus on a single reproductive milestone—such as standard 28-day menstrual cycle estimation—while leaving severe gaps in education and tracking for conditions like Polycystic Ovary Syndrome (PCOS), endometriosis, cervical cancer screening, antenatal care, fourth-trimester postpartum recovery, and perimenopause transitions. Furthermore, health information online is often fear-inducing or unreliable, while clinical appointment time is short, leaving women unprepared to communicate complex multi-system symptoms to their healthcare providers.

---

## 2. Proposed Solution
**HerHealth 360** is an integrated full-stack healthcare prototype built to accompany women across all stages of life. It combines:
1. **Curated Women's Health Library**: Plain-language, evidence-based guides cited directly from the World Health Organization (WHO), UK National Health Service (NHS), US Centers for Disease Control and Prevention (CDC), and India’s Ministry of Health and Family Welfare (MoHFW).
2. **Symptom & Wellness Tracker**: Granular observation logs (severity 1–10, duration, cycle context, sleep quality, fatigue, mood, triggers) stored privately on an isolated local database on the `E:` drive.
3. **Interactive Health Analytics**: Recharts timelines, frequency curves, and category breakdowns without making unsupported clinical claims.
4. **Deterministic AI Health Navigator**: A safe, rule-based medical navigation engine that matches queries against validated guidelines and provides an immediate red-flag safety pathway for acute emergencies (directing users to India’s national emergency line **112**).
5. **Doctor Directory & Appointment Management**: Clinician directory with future slot booking, atomic concurrency protection against double-booking (`409 Conflict`), slot release on cancellation, and a public Jitsi video consultation demonstration.
6. **Dedicated MotherCare Hub**: Gestational week estimator, trimester guidance, red flags for obstetric emergencies, and conversation checklists for doctor visits.
7. **Personal Health Passport PDF**: A clean, printable ReportLab vector PDF organizing self-reported symptom patterns and consultation history for real doctor appointments.
8. **Multi-Portal Architecture & Separation**: Distinct authenticated workspaces for Users (health tracking and booking), Clinicians (`/doctor/login` with slot management and incoming inquiries), and Platform Administrators (`/admin/login`).
9. **Admin Intelligence Hub & Practice Routines**: Dynamic visualization dashboard tracking total user and clinician counts, user symptom problem categories, severity tiers, doctor inquiries, and a curated library of physical therapy exercises with YouTube video tutorials and clinical guides.

---

## 3. Target Users
- Women seeking trustworthy, non-stigmatizing education on PCOS, menstrual irregularities, cervical screening, maternal wellness, or menopause.
- Individuals desiring a private diary to log cyclical symptoms alongside sleep and fatigue.
- Users preparing for clinical consultations who need structured summaries of their health history.

---

## 4. Technology Stack

### Frontend
- **Framework**: React 19 + Vite (TypeScript)
- **Styling**: Tailwind CSS v4 (calm palette: warm off-white, muted rose, coral accents, soft lavender, deep plum text)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Video Demo**: Embedded Jitsi Meet IFrame

### Backend
- **Framework**: Python 3.14 (or 3.12+) with Flask 3.1.0
- **ORM / Database**: Flask-SQLAlchemy 3.1.1 + SQLite on `E:` drive
- **Security & Auth**: Werkzeug PBKDF2-SHA256 password hashing, signed session tokens (`itsdangerous`)
- **CORS & Rate Limiting**: Flask-CORS (restricted origins) + Flask-Limiter
- **PDF Generation**: ReportLab 4.2.5
- **Automated Testing**: pytest 8.3.3

---

## 5. System Architecture & Directory Structure

```
E:\herhealth-360\
├── backend\
│   ├── app\
│   │   ├── __init__.py           # Flask app factory, CORS, Rate Limiter
│   │   ├── models\               # SQLAlchemy models (User, Doctor, Slot, Appointment, Symptom, Resource)
│   │   ├── routes\               # Modular blueprints (auth, symptoms, analytics, doctors, appointments, navigator, passport)
│   │   ├── security\             # Bearer auth helper and @require_auth decorator
│   │   └── services\             # Deterministic navigator rule engine & ReportLab PDF generator
│   ├── instance\
│   │   └── herhealth.db          # SQLite persistent database on E: drive
│   ├── generated\                # Generated ReportLab Health Passport PDFs
│   ├── scripts\
│   │   ├── seed_demo.py          # Seeds fictional clinicians, slots, library guides, and demo user
│   │   └── seed_synthetic.py     # Deterministic generation of 300 synthetic symptom observations
│   ├── tests\
│   │   ├── conftest.py           # In-memory test database and auth fixtures
│   │   └── test_all_features.py  # 9 comprehensive automated tests
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   └── run.py                    # Backend server entry point (Port 5000)
├── frontend\
│   ├── src\
│   │   ├── components\common\    # Navbar, Footer, EmergencyModal, AuthModal, JitsiDemoModal
│   │   ├── context\              # AuthContext session provider
│   │   ├── pages\                # Home, Library, Tracker, Analytics, Navigator, Doctors, MotherCare, Wellness, Passport, Privacy, NotFound
│   │   ├── services\api.ts       # Centralized REST API client
│   │   ├── types\index.ts        # TypeScript data model interfaces
│   │   ├── App.tsx               # Main routing & application layout
│   │   ├── main.tsx
│   │   └── index.css             # Tailwind CSS v4 design system
│   ├── dist\                     # Compiled production build
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts            # Vite config with @tailwindcss/vite and /api proxy
├── data\
│   └── synthetic\
│       ├── synthetic_symptoms.json # 300 reproducible synthetic observations (seed=42)
│       ├── synthetic_symptoms.csv
│       └── README.md             # Data dictionary and regeneration guide
├── docs\
│   ├── architecture.md           # System architecture and E: drive boundaries
│   ├── api.md                    # RESTful endpoint documentation
│   └── privacy-and-safety.md     # Ethics, medical boundaries, and disclosures
├── .cache\
│   ├── python\                   # Bytecode cache prefix
│   ├── pip\                      # Pip download cache
│   └── npm\                      # npm package cache
├── .tmp\                         # Temporary files
├── .gitignore
├── .env.example
└── README.md
```

---

## 6. E: Drive Storage Configuration

> [!IMPORTANT]
> **Storage Guarantee**: In accordance with project requirements, all source code, environments, SQLite database files, build outputs, and caches are configured on the **`E:` drive** to avoid exhausting primary disk space (`C:`).

| Component | Storage Path on E: Drive |
| :--- | :--- |
| **Project Root** | `E:\herhealth-360` |
| **Backend Code** | `E:\herhealth-360\backend` |
| **Frontend Code & Build** | `E:\herhealth-360\frontend` & `E:\herhealth-360\frontend\dist` |
| **Python Virtual Environment** | `E:\herhealth-360\backend\.venv` |
| **SQLite Database** | `E:\herhealth-360\backend\instance\herhealth.db` |
| **Generated PDF Reports** | `E:\herhealth-360\backend\generated` |
| **Synthetic Datasets** | `E:\herhealth-360\data\synthetic` |
| **Python Bytecode Cache** | `E:\herhealth-360\.cache\python` |
| **Pip Cache** | `E:\herhealth-360\.cache\pip` |
| **NPM Cache** | `E:\herhealth-360\.cache\npm` |
| **Temporary Files** | `E:\herhealth-360\.tmp` |

### Environment Redirection Commands (PowerShell)
```powershell
$Project = "E:\herhealth-360"
$env:PYTHONPYCACHEPREFIX = "$Project\.cache\python"
$env:PIP_CACHE_DIR = "$Project\.cache\pip"
$env:npm_config_cache = "$Project\.cache\npm"
$env:TEMP = "$Project\.tmp"
$env:TMP = "$Project\.tmp"
```

*Note on Unavoidable C: Dependencies*: The Windows operating system and global executables (`node.exe`, global `python.exe`) are installed on `C:\Program Files` as standard Windows software installations; all project-created code, virtual environments, node modules, databases, and caches are confined to `E:`.

---

## 7. Prerequisites & Installation

### Required Software
- **OS**: Windows (PowerShell)
- **Node.js**: v20+ (tested on v22.21.0, npm 10.9.4)
- **Python**: 3.12+ (tested on Python 3.14.0)

### Step 1: Clone or Navigate to Project on E: Drive
```powershell
cd E:\herhealth-360
```

### Step 2: Configure E: Drive Environment Variables
```powershell
$Project = "E:\herhealth-360"
$env:PYTHONPYCACHEPREFIX = "$Project\.cache\python"
$env:PIP_CACHE_DIR = "$Project\.cache\pip"
$env:npm_config_cache = "$Project\.cache\npm"
$env:TEMP = "$Project\.tmp"
$env:TMP = "$Project\.tmp"
```

### Step 3: Set Up Python Virtual Environment & Install Backend Dependencies
```powershell
python -m venv "$Project\backend\.venv"
& "$Project\backend\.venv\Scripts\pip.exe" install -r "$Project\backend\requirements.txt"
```

### Step 4: Initialize Database & Seed Demo Data
```powershell
# 1. Generate 300 reproducible synthetic symptom observations
& "$Project\backend\.venv\Scripts\python.exe" "$Project\backend\scripts\seed_synthetic.py"

# 2. Seed fictional clinicians, slots, health library guides, and demo user
& "$Project\backend\.venv\Scripts\python.exe" "$Project\backend\scripts\seed_demo.py"
```

### Step 5: Install Frontend Dependencies & Verify Build
```powershell
cd E:\herhealth-360\frontend
npm install
npm run build
cd E:\herhealth-360
```

---

## 8. Starting the Application

### Start Backend Server (Terminal 1)
```powershell
$Project = "E:\herhealth-360"
$env:PYTHONPYCACHEPREFIX = "$Project\.cache\python"
$env:PIP_CACHE_DIR = "$Project\.cache\pip"
$env:TEMP = "$Project\.tmp"
$env:TMP = "$Project\.tmp"
& "$Project\backend\.venv\Scripts\python.exe" "$Project\backend\run.py"
```
*Backend runs on:* `http://127.0.0.1:5000` (API prefix: `/api/v1`)

### Start Frontend Server (Terminal 2)
```powershell
cd E:\herhealth-360\frontend
$Project = "E:\herhealth-360"
$env:npm_config_cache = "$Project\.cache\npm"
$env:TEMP = "$Project\.tmp"
$env:TMP = "$Project\.tmp"
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend runs on:* `http://127.0.0.1:5173`

---

## 9. Running Automated Tests

Run the automated backend test suite using pytest with an isolated in-memory test database:

```powershell
$Project = "E:\herhealth-360"
& "$Project\backend\.venv\Scripts\pytest.exe" "$Project\backend\tests" -v
```

### Observed Test Results (9 of 9 Passed):
- `test_health_check`: PASSED
- `test_user_registration_and_login`: PASSED
- `test_unauthorized_access`: PASSED (Rejection with HTTP 401)
- `test_symptom_crud_and_validation`: PASSED (Input validation & CRUD)
- `test_user_data_isolation`: PASSED (User A cannot view or delete User B's records)
- `test_analytics_calculations`: PASSED (Timeline, frequency, category distributions)
- `test_appointment_booking_and_double_booking_prevention`: PASSED (HTTP 409 Conflict handling and slot release on cancellation)
- `test_ai_health_navigator_safety`: PASSED (Emergency red-flag detection with 112 guidance)
- `test_health_passport_pdf_generation`: PASSED (Valid ReportLab binary PDF)
- `test_doctor_portal_login_and_slot_management`: PASSED (Doctor authentication, slot CRUD, and patient appointment visibility)
- `test_admin_portal_insights_and_exercise_management`: PASSED (Admin overview, user problems, doctor questions visualizations, and exercise routines CRUD)

---

## 10. 3–5 Minute Hackathon Demonstration Walkthrough

1. **Landing Page**: Open `http://127.0.0.1:5173/`. Explain the platform tagline: *"Every stage of her health. One trusted place."* Show the life-stage health hubs (Puberty, Reproductive, MotherCare, Menopause).
2. **Health Library**: Click **Health Library** in the top navigation. Filter by **PCOS and PCOD**. Open the guide to show evidence-based pathophysiology, when to see a doctor, lifestyle self-care, and verified WHO/NHS citations.
3. **One-Click Demo Login**: Click **Sign In** in the navbar, then click **"One-Click Hackathon Demo Login (Priya Sharma)"**. Point out the authenticated dashboard showing the user's welcome banner, reproductive life stage, and summary KPI cards.
4. **Log a Symptom**: Navigate to **Symptom Tracker**. Click **Log New Observation**. Select Category `Menstrual`, symptom `Lower Pelvic Cramping`, adjust severity slider to `7/10`, enter duration `3h`, and submit. The diary card instantly updates.
5. **Interactive Analytics**: Click **Analytics** in the navbar. Demonstrate how the **Recharts Severity Timeline**, **Frequency by Date**, and **Category Breakdown** charts dynamically reflect the user's recorded observations. Highlight the mandatory non-diagnostic notice.
6. **AI Health Navigator**: Navigate to **Health Navigator**.
   - Click the prompt *"Irregular cycles & acne (PCOS)"* to demonstrate deterministic educational guidance, self-care suggestions, and official WHO source links.
   - Click *"Red-Flag Emergency Test"* (or type *"severe sudden sharp pelvic pain and heavy bleeding with fainting"*). Show the immediate **CRITICAL EMERGENCY ALERT** prioritizing calling **112 / 102** and bypassing questionnaires.
7. **Emergency Modal**: Click the red **Emergency (112)** button in the top navbar. Show the warning signs checklist and India helplines (112, 102, 1091).
8. **Doctor Directory & Booking**: Click **Find a Doctor**. Show the fictional clinicians (**Dr Ananya Rao**, **Dr Meera Nair**, **Dr Kavya Iyer**). Select an available slot and book it. Demonstrate that the slot becomes booked, and open the demonstration Jitsi video room with the transparent privacy notice.
9. **MotherCare**: Click **MotherCare**. Demonstrate the gestational age week calculator and the trimester checklists for clinician visits.
10. **Health Passport PDF**: Navigate to **Health Passport**. Review the preview table, select a date filter, and click **Download Passport PDF**. Open the generated ReportLab PDF to show the clean clinical summary formatted for doctor visits.

---

## 11. Ethical AI, Disclosures & Safety Boundaries

### Deterministic AI Navigator
HerHealth 360 does **not** use generative LLMs for medical advice to prevent unvalidated hallucinations. The engine operates deterministically against verified clinical topic rules.

### Fictional Clinicians
Dr Ananya Rao, Dr Meera Nair, and Dr Kavya Iyer are educational demonstration profiles. They do not represent real licensed practitioners.

### Jitsi Video Consultation Demo
The video room utilizes public Jitsi Meet infrastructure for technical interaction demonstration. It is clearly disclosed to users as unsuitable for confidential medical consultations.

### Emergency Helplines in India
- **National Emergency Helpline**: 112
- **Ambulance Services**: 102 / 108
- **Women Helpline in Distress**: 1091
- **Government Teleconsultation**: eSanjeevani (https://esanjeevani.mohfw.gov.in/)

---

## 12. Verified Trusted Medical Sources
- **WHO Polycystic Ovary Syndrome**: https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome
- **WHO Cervical Cancer Elimination**: https://www.who.int/news-room/fact-sheets/detail/cervical-cancer
- **NHS UK Health Conditions**: https://www.nhs.uk/conditions/
- **NHS UK Pregnancy Guide**: https://www.nhs.uk/pregnancy/
- **CDC Cervical Cancer & HPV**: https://www.cdc.gov/cervical-cancer/
- **Ministry of Health & Family Welfare (MoHFW India)**: https://mohfw.gov.in/
- **eSanjeevani National Teleconsultation**: https://esanjeevani.mohfw.gov.in/

---

## 13. Known Limitations & Future Improvements
- **Synthetic vs Real Data**: Analytics demo utilizes synthetic observations; real-world longitudinal health metrics require clinical validation.
- **Biometric Integration**: Future iterations can integrate with FHIR-compliant wearable health sensors (continuous glucose monitors, basal body temperature wearables).
- **Certified Telemedicine**: Production deployment would require end-to-end encrypted WebRTC infrastructure compliant with DISHA / HIPAA telehealth security regulations.

---

## 14. License
MIT License. Open Source Healthcare Demonstration.
