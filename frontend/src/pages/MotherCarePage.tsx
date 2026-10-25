import React, { useState, useEffect } from 'react';
import {
  Baby,
  Heart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  PhoneCall,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { HealthResource } from '../types';
import { Link } from 'react-router-dom';

export const MotherCarePage: React.FC = () => {
  const [resources, setResources] = useState<HealthResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Pregnancy Week Calculator State
  const [lmpDate, setLmpDate] = useState('');
  const [calculatedWeek, setCalculatedWeek] = useState<number | null>(null);
  const [calculatedDueDate, setCalculatedDueDate] = useState<string | null>(null);

  useEffect(() => {
    loadMotherCareArticles();
  }, []);

  const loadMotherCareArticles = async () => {
    setLoading(true);
    try {
      const res = await api.getMotherCare();
      setResources(res.resources);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateWeeks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lmpDate) return;
    const lmp = new Date(lmpDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lmp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);

    // Approximate due date: LMP + 280 days
    const due = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);

    setCalculatedWeek(Math.min(Math.max(weeks, 1), 42));
    setCalculatedDueDate(due.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
  };

  const clinicianQuestions = [
    {
      trimester: 'First Trimester (Weeks 1–12)',
      questions: [
        'What prenatal vitamin formulation (folic acid / iron dosage) is best suited for me?',
        'How can I distinguish expected mild morning nausea from Hyperemesis Gravidarum?',
        'Which routine blood tests (hemoglobin, blood group, infectious disease screening) should we schedule?',
      ],
    },
    {
      trimester: 'Second Trimester (Weeks 13–27)',
      questions: [
        'When will our detailed anatomical anomaly ultrasound (TIFFA scan) be performed?',
        'When should I begin tracking regular daily fetal movements (kick counts)?',
        'What are the screening protocols for gestational diabetes mellitus (GDM)?',
      ],
    },
    {
      trimester: 'Third Trimester (Weeks 28–40)',
      questions: [
        'What specific symptoms (headache with vision spots, sudden facial swelling) warrant emergency contact?',
        'What is our hospital arrival protocol once active labor contractions begin?',
        'What postpartum breastfeeding and lactation resources are available at the delivery center?',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
          <Baby className="w-3.5 h-3.5" />
          <span>Maternal Health & Fourth Trimester Support</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#261E23] tracking-tight">
          MotherCare & Postpartum Hub
        </h1>
        <p className="text-xs sm:text-sm text-[#61575D] max-w-2xl leading-relaxed">
          Evidence-based maternal education supporting you through antenatal milestones, clinician checklists, and
          fourth-trimester emotional and physiological recovery.
        </p>
      </div>

      {/* Medical Safety Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#E8DFD8] flex items-start gap-3 text-xs text-[#584F55]">
        <Heart className="w-5 h-5 text-[#8C3B5E] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#2B232A]">Educational Notice & Scope Limitations:</p>
          <p className="text-[11px] leading-relaxed text-[#6D636B]">
            MotherCare is an educational tool. It does <strong>not</strong> monitor fetal heart tones, evaluate gestational
            risk scores, or replace regular antenatal examinations with your obstetrician.
          </p>
        </div>
      </div>

      {/* Week Estimator & Red Flag Alert Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Approximate Week Estimator Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2B232A]">Approximate Gestational Week Estimator</h3>
              <p className="text-[11px] text-[#7A7177]">Based on standard 280-day Naegele's rule calculation</p>
            </div>
          </div>

          <form onSubmit={handleCalculateWeeks} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#584F55] mb-1">
                First Day of Last Menstrual Period (LMP)
              </label>
              <input
                type="date"
                required
                value={lmpDate}
                onChange={(e) => setLmpDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-[#FDFBF7] focus:outline-hidden focus:border-[#8C3B5E]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Calculate Approximate Week
            </button>
          </form>

          {calculatedWeek !== null && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-sm">
                  Estimated Gestational Age: ~Week {calculatedWeek}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800">
                  {calculatedWeek <= 12 ? '1st Trimester' : calculatedWeek <= 27 ? '2nd Trimester' : '3rd Trimester'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-950">
                Estimated Approximate Due Date: <strong>{calculatedDueDate}</strong>
              </p>
              <p className="text-[10px] text-emerald-800/80 italic">
                * Note: This is purely a mathematical estimate. Ultrasound crown-rump length (CRL) dating by your
                radiologist or obstetrician is the clinical standard.
              </p>
            </div>
          )}
        </div>

        {/* Immediate Red Flag Emergency Warning Box */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-red-50/80 border border-red-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
              <span>When to Seek Immediate Emergency Obstetric Care</span>
            </div>
            <p className="text-xs text-red-950 leading-relaxed">
              If you experience any of the following symptoms during pregnancy or the postpartum period, proceed to a
              hospital emergency room immediately:
            </p>
            <ul className="space-y-1.5 text-xs text-red-900">
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">&bull;</span>
                <span>Any vaginal bleeding, continuous fluid leakage, or premature rupture of membranes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">&bull;</span>
                <span>Severe, sudden abdominal or chest pain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">&bull;</span>
                <span>Severe persistent headache accompanied by vision changes (spots, blurriness) or epigastric pain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">&bull;</span>
                <span>Marked decrease or cessation of fetal movement after 24–28 weeks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">&bull;</span>
                <span>Postpartum hemorrhage: Soaking more than 1 sanitary pad per hour or passing large clots</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-red-200/60 flex items-center justify-between text-xs">
            <span className="font-bold text-red-700">India National Emergency Helpline:</span>
            <a
              href="tel:112"
              className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call 112
            </a>
          </div>
        </div>
      </div>

      {/* Clinician Discussion Checklist */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C3B5E]">Antenatal Preparation</span>
          <h2 className="font-serif text-2xl font-bold text-[#261E23]">Questions to Discuss With Your Clinician</h2>
          <p className="text-xs text-[#7A7177]">
            Empowering expectant mothers with key conversation starters across each trimester.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {clinicianQuestions.map((qGroup) => (
            <div key={qGroup.trimester} className="p-6 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs space-y-3">
              <h3 className="font-serif text-base font-bold text-[#8C3B5E]">{qGroup.trimester}</h3>
              <ul className="space-y-2 text-xs text-[#584F55]">
                {qGroup.questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-[#C86D51] shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Maternal Articles & Guides */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C3B5E]">Clinical Guides</span>
          <h2 className="font-serif text-2xl font-bold text-[#261E23]">Evidence-Based Maternal Guides</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#7A7177]">Loading guides...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((art) => (
              <div key={art.id} className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {art.topic}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#261E23]">{art.title}</h3>
                <p className="text-xs text-[#6D636B] leading-relaxed">{art.summary}</p>
                <div className="pt-3 border-t border-[#F0E6DE] flex items-center justify-between">
                  <span className="text-[11px] text-[#7A7177]">Source: {art.trusted_source}</span>
                  <Link
                    to="/library"
                    className="text-xs font-bold text-[#8C3B5E] hover:underline flex items-center gap-1"
                  >
                    <span>Read in Library</span>
                    <BookOpen className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
