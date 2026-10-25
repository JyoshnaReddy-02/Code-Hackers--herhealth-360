# HerHealth 360 — Synthetic Healthcare Dataset

## Overview & Purpose
This dataset contains **300 reproducible synthetic symptom observations** created for testing health analytics charts, symptom timeline distributions, and development visualization in HerHealth 360.

> [!IMPORTANT]
> **SYNTHETIC ONLY NOTICE**: This dataset contains zero real user data, zero personally identifiable information (PII), and zero scraped clinical records. All entries are programmatically generated with a deterministic pseudorandom seed. It must never be used to train clinical diagnosis models or presented as real user medical history.

---

## Data Dictionary

| Field Name | Type | Description | Permitted Values / Range |
| :--- | :--- | :--- | :--- |
| `synthetic_id` | String | Unique synthetic identifier | e.g. `SYN-0001` to `SYN-0300` |
| `is_synthetic` | Boolean | Clear label marking record as synthetic | Always `true` |
| `recorded_at` | String (ISO 8601) | Timestamp of symptom observation | Between Jan 2026 and Apr 2026 |
| `category` | String | Anatomical / physiological domain | Menstrual, Pelvic or abdominal discomfort, Breast, Digestive, Fatigue and sleep, Mood and well-being, Pregnancy-related observations, Menopause-related observations, Other |
| `symptom_name` | String | Common non-diagnostic symptom descriptor | e.g., Cramping, Heavy Flow, Cyclical Breast Tenderness |
| `severity` | Integer | Self-reported intensity scale | `1` (mild) to `10` (severe) |
| `duration_hours` | Float | Estimated duration in hours | `0.5`, `1.0`, `2.0`, `3.5`, `5.0`, `8.0` |
| `cycle_day` | Integer / null | Optional day of menstrual cycle | `1` to `28` (or null if not applicable) |
| `sleep_quality` | Integer | Self-reported sleep satisfaction | `1` (very poor) to `5` (excellent) |
| `fatigue_level` | Integer | Self-reported fatigue rating | `1` (none/low) to `5` (extreme) |
| `activity_level` | String | Daily physical movement context | `Sedentary`, `Light`, `Moderate`, `High` |
| `mood` | String | General emotional state | `Calm`, `Anxious`, `Low`, `Energetic`, `Irritable`, `Balanced` |
| `triggers` | String | Contextual self-observation | e.g. "High stress workday", "Poor sleep previous night" |
| `notes` | String | User reflection text | Short non-clinical contextual observation |

---

## How to Regenerate the Dataset

From the project root on the `E:` drive, run:

```powershell
$Project = "E:\herhealth-360"
& "$Project\backend\.venv\Scripts\python.exe" "$Project\backend\scripts\seed_synthetic.py"
```

This will deterministically recreate:
- `E:\herhealth-360\data\synthetic\synthetic_symptoms.json`
- `E:\herhealth-360\data\synthetic\synthetic_symptoms.csv`
