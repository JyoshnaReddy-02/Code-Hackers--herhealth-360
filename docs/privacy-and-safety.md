# HerHealth 360 — Privacy, Ethics & Medical Safety Framework

HerHealth 360 Women's Health & Wellness Platform.

---

## 1. Ethical AI & Medical Safety Boundaries
HerHealth 360 recognizes the high stakes inherent in healthcare software. The application is built with the following core commitments:

1. **Non-Diagnostic Policy**: HerHealth 360 never issues diagnostic claims or percentage risk scores for complex diseases such as PCOS, endometriosis, or malignancies.
2. **Deterministic Navigation**: Rather than allowing unpredictable large language model hallucinations to offer clinical advice, the AI Health Navigator employs a deterministic rule engine that maps user queries to verified clinical guidelines (WHO, NHS, CDC).
3. **Conservative Red-Flag Safety Net**: Severe pain, acute pelvic distress, hemorrhage with fainting, breathing difficulty, and maternal warning signs immediately trigger an emergency alert guiding users to contact emergency medical services (India 112 / 102).
4. **No Prescription or Medication Individualization**: The platform never suggests prescription doses or encourages users to discontinue prescribed medical therapies.

---

## 2. Data Privacy & Account Isolation
1. **User Scoped Queries**: Every database query for symptoms, analytics, or appointments joins strictly on the authenticated user's ID (`user_id == g.current_user.id`).
2. **No Data Brokerage or Third-Party Pixels**: Zero advertising trackers or external commercial analytics are embedded in the application.
3. **Password Security**: Passwords are saved only as PBKDF2-SHA256 salted hashes.

---

## 3. Synthetic Benchmark Dataset
The 300 symptom observations stored at `E:\herhealth-360\data\synthetic\` are 100% synthetically generated with a fixed pseudorandom seed (42). They contain zero clinical records, hospital patient data, or PII.

---

## 4. Fictional Clinicians & Demonstration Telehealth
Dr Ananya Rao, Dr Meera Nair, and Dr Kavya Iyer are fictional demonstration profiles created solely for demonstrating appointment booking workflows, double-booking prevention, and public Jitsi video consultation mechanics. They do not represent real practitioners.
