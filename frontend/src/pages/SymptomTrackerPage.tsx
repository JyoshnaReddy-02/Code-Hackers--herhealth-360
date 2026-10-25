import React, { useState, useEffect } from 'react';
import {
  Activity,
  PlusCircle,
  Filter,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  ChevronDown,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SymptomEntry } from '../types';

const CATEGORIES = [
  'Menstrual',
  'Pelvic or abdominal discomfort',
  'Breast',
  'Digestive',
  'Fatigue and sleep',
  'Mood and well-being',
  'Pregnancy-related observations',
  'Menopause-related observations',
  'Other',
];

const COMMON_SYMPTOMS: Record<string, string[]> = {
  Menstrual: ['Lower Pelvic Cramping', 'Heavy Flow', 'Spotting between cycles', 'PMS Bloating', 'Pelvic Heaviness'],
  'Pelvic or abdominal discomfort': ['Lower Abdominal Aching', 'Ovulation Twinge (Mittelschmerz)', 'Deep Pelvic Pressure', 'Pain with bowel movement'],
  Breast: ['Cyclical Breast Soreness', 'Underarm Tenderness', 'Fibrocystic Fullness'],
  Digestive: ['Digestive Bloating', 'Mild Nausea', 'Constipation before period', 'Indigestion'],
  'Fatigue and sleep': ['Mid-Afternoon Exhaustion', 'Difficulty Falling Asleep', 'Frequent Night Wakings', 'Unrefreshing Sleep'],
  'Mood and well-being': ['Heightened Anxiety', 'Low Mood / Tearfulness', 'Brain Fog', 'Irritability'],
  'Pregnancy-related observations': ['Morning Nausea', 'Lower Back Aching', 'Mild Ankle Swelling', 'Fatigue Surge'],
  'Menopause-related observations': ['Night Sweats / Flushing', 'Daytime Hot Flash', 'Sudden Heat Wave', 'Sleep Disturbance'],
  Other: ['Tension Headache', 'Migraine with Aura', 'Joint Stiffness', 'Dizziness on Standing'],
};

export const SymptomTrackerPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterMinSev, setFilterMinSev] = useState<number>(1);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SymptomEntry | null>(null);
  
  const [category, setCategory] = useState('Menstrual');
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [durationHours, setDurationHours] = useState<number | ''>(2);
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  
  // Optional context
  const [cycleDay, setCycleDay] = useState<number | ''>('');
  const [sleepQuality, setSleepQuality] = useState<number | ''>(3);
  const [fatigueLevel, setFatigueLevel] = useState<number | ''>(3);
  const [activityLevel, setActivityLevel] = useState('Moderate');
  const [mood, setMood] = useState('Balanced');
  const [triggers, setTriggers] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadSymptoms();
    }
  }, [user, filterCategory, filterMinSev]);

  const loadSymptoms = async () => {
    setLoading(true);
    try {
      const res = await api.getSymptoms({
        category: filterCategory !== 'All' ? filterCategory : undefined,
        min_severity: filterMinSev > 1 ? filterMinSev : undefined,
      });
      setSymptoms(res.symptoms);
    } catch (e) {
      console.error('Failed to load symptoms', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setCategory('Menstrual');
    setSymptomName('');
    setSeverity(5);
    setDurationHours(2);
    setRecordedAt(new Date().toISOString().slice(0, 16));
    setNotes('');
    setCycleDay('');
    setSleepQuality(3);
    setFatigueLevel(3);
    setActivityLevel('Moderate');
    setMood('Balanced');
    setTriggers('');
    setFormError(null);
    setShowForm(true);
  };

  const handleOpenEdit = (entry: SymptomEntry) => {
    setEditingEntry(entry);
    setCategory(entry.category);
    setSymptomName(entry.symptom_name);
    setSeverity(entry.severity);
    setDurationHours(entry.duration_hours || '');
    setRecordedAt(entry.recorded_at ? entry.recorded_at.slice(0, 16) : new Date().toISOString().slice(0, 16));
    setNotes(entry.notes || '');
    setCycleDay(entry.cycle_day || '');
    setSleepQuality(entry.sleep_quality || '');
    setFatigueLevel(entry.fatigue_level || '');
    setActivityLevel(entry.activity_level || 'Moderate');
    setMood(entry.mood || 'Balanced');
    setTriggers(entry.triggers || '');
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!symptomName.trim()) {
      setFormError('Symptom name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<SymptomEntry> = {
        category,
        symptom_name: symptomName.trim(),
        severity,
        duration_hours: durationHours === '' ? undefined : Number(durationHours),
        recorded_at: new Date(recordedAt).toISOString(),
        notes: notes.trim() || undefined,
        cycle_day: cycleDay === '' ? undefined : Number(cycleDay),
        sleep_quality: sleepQuality === '' ? undefined : Number(sleepQuality),
        fatigue_level: fatigueLevel === '' ? undefined : Number(fatigueLevel),
        activity_level: activityLevel || undefined,
        mood: mood || undefined,
        triggers: triggers.trim() || undefined,
      };

      if (editingEntry) {
        await api.updateSymptom(editingEntry.id, payload);
      } else {
        await api.createSymptom(payload);
      }

      setShowForm(false);
      loadSymptoms();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save symptom observation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteSymptom(id);
      setDeleteConfirmId(null);
      loadSymptoms();
    } catch (err: any) {
      alert(`Failed to delete symptom: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-[#8C3B5E] flex items-center justify-center mx-auto">
          <Activity className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#261E23]">Private Symptom Diary & Wellness Tracker</h2>
          <p className="text-xs sm:text-sm text-[#6D636B] max-w-lg mx-auto leading-relaxed">
            Please log in or create a free account to securely record your symptoms, track menstrual cycles, and generate
            your personal Health Passport.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal('login')}
            className="px-6 py-2.5 rounded-xl bg-[#8C3B5E] text-white text-xs font-semibold hover:bg-[#722E4B]"
          >
            Sign In to Tracker
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className="px-6 py-2.5 rounded-xl border border-[#D5C7BE] bg-white text-xs font-semibold text-[#2B232A] hover:bg-[#FAF7F5]"
          >
            Create Private Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-xs font-semibold text-[#8C3B5E] mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Encrypted Symptom Diary &bull; Private Health Log</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#261E23]">Symptom & Wellness Tracker</h1>
          <p className="text-xs text-[#7A7177] mt-1">
            Capture daily physical observations, menstrual cycle days, and lifestyle factors.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white text-xs font-semibold hover:opacity-95 shadow-xs transition-transform active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log New Observation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#7A7177] font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#D5C7BE] bg-[#FDFBF7] focus:outline-hidden focus:border-[#8C3B5E]"
            >
              <option value="All">All Categories ({symptoms.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#7A7177] font-semibold">Min Severity:</span>
            <select
              value={filterMinSev}
              onChange={(e) => setFilterMinSev(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-[#D5C7BE] bg-[#FDFBF7] focus:outline-hidden focus:border-[#8C3B5E]"
            >
              <option value={1}>All Severities (1-10)</option>
              <option value={4}>Moderate & Above (4+)</option>
              <option value={7}>Severe Only (7+)</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-[#7A7177]">
          Showing <strong>{symptoms.length}</strong> recorded observations
        </div>
      </div>

      {/* Symptoms List Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#7A7177]">
          <div className="inline-block w-6 h-6 border-2 border-[#8C3B5E] border-t-transparent rounded-full animate-spin mb-2" />
          <p>Loading your symptom records...</p>
        </div>
      ) : symptoms.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E8DFD8] space-y-3">
          <Activity className="w-10 h-10 text-[#B5AAB1] mx-auto" />
          <h3 className="text-sm font-semibold text-[#2B232A]">No symptoms recorded for this filter</h3>
          <p className="text-xs text-[#6D636B] max-w-sm mx-auto">
            Log your symptoms to generate interactive timelines, detect cycle patterns, and download your Health Passport.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#8C3B5E] text-white text-xs font-semibold"
          >
            Log First Observation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {symptoms.map((s) => {
            const isSevere = s.severity >= 7;
            const isModerate = s.severity >= 4 && s.severity < 7;
            const sevColor = isSevere
              ? 'bg-rose-100 text-rose-800 border-rose-200'
              : isModerate
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200';

            return (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs hover:border-[#D5C7BE] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2E8E1] text-[#8C3B5E]">
                      {s.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${sevColor}`}
                      title={`Severity ${s.severity} of 10`}
                    >
                      Sev: {s.severity}/10
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#2B232A]">{s.symptom_name}</h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#7A7177]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(s.recorded_at).toLocaleDateString()}
                    </span>
                    {s.duration_hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.duration_hours}h duration
                      </span>
                    )}
                    {s.cycle_day && <span className="font-semibold text-[#8C3B5E]">Cycle Day {s.cycle_day}</span>}
                  </div>

                  {/* Context Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {s.mood && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-[#FAF2ED] text-[#8C3B5E]">
                        Mood: {s.mood}
                      </span>
                    )}
                    {s.sleep_quality && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-50 text-indigo-700">
                        Sleep: {s.sleep_quality}/5
                      </span>
                    )}
                    {s.fatigue_level && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-amber-50 text-amber-800">
                        Fatigue: {s.fatigue_level}/5
                      </span>
                    )}
                  </div>

                  {s.notes && (
                    <p className="text-xs text-[#584F55] bg-[#FAF7F5] p-2.5 rounded-xl border border-[#F0E6DE] italic">
                      "{s.notes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#F0E6DE] flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 rounded-lg text-[#584F55] hover:text-[#8C3B5E] hover:bg-[#F8F1EB] transition-colors"
                    title="Edit entry"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(s.id)}
                    className="p-1.5 rounded-lg text-[#584F55] hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-[#E8DFD8] space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-[#2B232A]">Delete Symptom Entry?</h3>
            </div>
            <p className="text-xs text-[#6D636B]">
              Are you sure you want to delete this recorded observation? This action will permanently remove it from your
              diary and Health Passport calculations.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#584F55] hover:bg-[#FAF7F5]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Symptom Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="w-full max-w-2xl bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#E8DFD8] overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 pb-4 bg-white border-b border-[#E8DFD8] flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#261E23]">
                  {editingEntry ? 'Edit Symptom Observation' : 'Record New Symptom Observation'}
                </h2>
                <p className="text-xs text-[#7A7177]">
                  All observations are stored securely in your private account.
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl text-[#7A7177] hover:bg-[#F2E8E1]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Category & Quick Symptom Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#584F55] mb-1">Symptom Category *</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSymptomName('');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#584F55] mb-1">Symptom Name *</label>
                  <input
                    type="text"
                    required
                    value={symptomName}
                    onChange={(e) => setSymptomName(e.target.value)}
                    placeholder="e.g. Cramping, Migraine, Fatigue"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E]"
                  />
                  {COMMON_SYMPTOMS[category] && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {COMMON_SYMPTOMS[category].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSymptomName(s)}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-[#FAF2ED] text-[#8C3B5E] hover:bg-[#F2E5DD]"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Severity Slider (1 - 10) */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD8] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#584F55]">Severity Rating (1 to 10) *</label>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      severity >= 7
                        ? 'bg-rose-100 text-rose-800'
                        : severity >= 4
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {severity} / 10 &bull; {severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Severe'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-[#8C3B5E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#9B8F97]">
                  <span>1 (Barely noticeable)</span>
                  <span>5 (Noticeable ache)</span>
                  <span>10 (Debilitating / Unbearable)</span>
                </div>
              </div>

              {/* Timing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#584F55] mb-1">Observation Date & Time</label>
                  <input
                    type="datetime-local"
                    value={recordedAt}
                    onChange={(e) => setRecordedAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#584F55] mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="720"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 3.5"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E]"
                  />
                </div>
              </div>

              {/* Optional Wellness Context Fields */}
              <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#E8DFD8] space-y-3">
                <h4 className="font-semibold text-[#8C3B5E] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Optional Lifestyle & Cycle Context
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#584F55] mb-1">Cycle Day</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={cycleDay}
                      onChange={(e) => setCycleDay(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 14"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D5C7BE] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#584F55] mb-1">Sleep Quality (1-5)</label>
                    <select
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D5C7BE] bg-white"
                    >
                      <option value="">Unrated</option>
                      <option value="1">1 (Poor)</option>
                      <option value="2">2 (Disrupted)</option>
                      <option value="3">3 (Fair)</option>
                      <option value="4">4 (Good)</option>
                      <option value="5">5 (Restorative)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#584F55] mb-1">Fatigue Level (1-5)</label>
                    <select
                      value={fatigueLevel}
                      onChange={(e) => setFatigueLevel(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D5C7BE] bg-white"
                    >
                      <option value="">Unrated</option>
                      <option value="1">1 (None)</option>
                      <option value="2">2 (Mild)</option>
                      <option value="3">3 (Moderate)</option>
                      <option value="4">4 (High)</option>
                      <option value="5">5 (Severe)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#584F55] mb-1">Mood</label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D5C7BE] bg-white"
                    >
                      <option value="Balanced">Balanced</option>
                      <option value="Calm">Calm</option>
                      <option value="Anxious">Anxious</option>
                      <option value="Low">Low Mood</option>
                      <option value="Irritable">Irritable</option>
                      <option value="Energetic">Energetic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#584F55] mb-1">Activity Level</label>
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D5C7BE] bg-white"
                    >
                      <option value="Sedentary">Sedentary (Desk work)</option>
                      <option value="Light">Light (Walking, stretching)</option>
                      <option value="Moderate">Moderate (Exercise, brisk walk)</option>
                      <option value="High">High (Vigorous workout / active)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#584F55] mb-1">Triggers / Notes</label>
                    <input
                      type="text"
                      value={triggers}
                      onChange={(e) => setTriggers(e.target.value)}
                      placeholder="e.g. Skipped lunch, high stress workday"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D5C7BE] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Freeform Notes */}
              <div>
                <label className="block font-semibold text-[#584F55] mb-1">Personal Reflections / Notes (Max 1000)</label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record what soothing remedies helped, specific sensations, or questions for your doctor..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#584F55] hover:bg-[#FAF7F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white text-xs font-bold hover:opacity-95 shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingEntry ? 'Save Changes' : 'Record Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
