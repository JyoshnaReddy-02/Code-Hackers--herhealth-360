import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  Activity,
  BookOpen,
  UserCheck,
  Baby,
  FileText,
  Shield,
  ArrowRight,
  PlusCircle,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ExternalLink,
  Dumbbell,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SymptomEntry, Appointment } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const HomePage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [recentSymptoms, setRecentSymptoms] = useState<SymptomEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const [symRes, aptRes] = await Promise.all([
        api.getSymptoms(),
        api.getAppointments('booked'),
      ]);
      setRecentSymptoms(symRes.symptoms.slice(0, 5));
      setAppointments(aptRes.appointments.slice(0, 3));
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const lifeStages = [
    {
      title: 'Puberty & Adolescence',
      desc: 'First menstrual cycles, anatomical changes, and building positive body literacy.',
      tag: 'Ages 12–19',
      color: 'from-rose-50 to-pink-50 border-pink-200 text-pink-900',
    },
    {
      title: 'Reproductive & Hormonal Wellness',
      desc: 'PCOS management, endometriosis awareness, fertility literacy, and cycle tracking.',
      tag: 'Ages 20–39',
      color: 'from-amber-50 to-orange-50 border-amber-200 text-amber-900',
    },
    {
      title: 'MotherCare & Postpartum',
      desc: 'Antenatal wellness, trimester guides, fourth-trimester healing, and lactation support.',
      tag: 'Maternal Hub',
      color: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900',
    },
    {
      title: 'Perimenopause & Menopause',
      desc: 'Hormonal fluctuations, vasomotor symptom relief, bone density, and heart health.',
      tag: 'Ages 40+',
      color: 'from-purple-50 to-indigo-50 border-purple-200 text-purple-900',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* If Authenticated: Show Interactive User Dashboard */}
      {user ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 animate-in fade-in">
          {/* Welcome Greeting Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#8C3B5E] via-[#A84A71] to-[#C86D51] text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Life Stage: {user.life_stage ? user.life_stage.replace('_', ' ') : 'Reproductive'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
                Welcome back, {user.display_name}
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
                Your private health dashboard. Track your observations, explore evidence-based guidance,
                and generate your clinical Health Passport before appointments.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/tracker"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#8C3B5E] text-xs font-bold hover:bg-rose-50 shadow-xs transition-transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log New Symptom</span>
              </Link>
              <Link
                to="/navigator"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-xs text-white text-xs font-semibold hover:bg-white/30 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Health Navigator</span>
              </Link>
              <Link
                to="/passport"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2B232A]/40 backdrop-blur-xs text-white text-xs font-semibold hover:bg-[#2B232A]/60 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Export Health Passport</span>
              </Link>
              <Link
                to="/doctors"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-xs text-white text-xs font-semibold hover:bg-white/30 transition-colors"
              >
                <Stethoscope className="w-4 h-4 text-rose-200" />
                <span>Find Specialists</span>
              </Link>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-[#7A7177] font-medium uppercase tracking-wider">Recorded Symptoms</p>
                <p className="text-2xl font-bold font-serif text-[#2B232A] mt-1">{recentSymptoms.length} entries</p>
                <Link to="/tracker" className="text-[11px] text-[#8C3B5E] hover:underline font-semibold mt-1 inline-block">
                  View full diary &rarr;
                </Link>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#8C3B5E] flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-[#7A7177] font-medium uppercase tracking-wider">Upcoming Consultations</p>
                <p className="text-2xl font-bold font-serif text-[#2B232A] mt-1">{appointments.length} scheduled</p>
                <Link to="/doctors" className="text-[11px] text-[#C86D51] hover:underline font-semibold mt-1 inline-block">
                  Manage slots &rarr;
                </Link>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C86D51] flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-[#7A7177] font-medium uppercase tracking-wider">Personal Health Passport</p>
                <p className="text-2xl font-bold font-serif text-[#2B232A] mt-1">Ready to Export</p>
                <Link to="/passport" className="text-[11px] text-teal-700 hover:underline font-semibold mt-1 inline-block">
                  Download PDF summary &rarr;
                </Link>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Recent Records & Upcoming Appointments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Symptoms Card */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2B232A]">Recent Symptom Observations</h3>
                  <p className="text-xs text-[#7A7177]">Your latest recorded physical and emotional observations</p>
                </div>
                <Link
                  to="/tracker"
                  className="px-3 py-1.5 rounded-lg border border-[#E8DFD8] text-xs font-semibold text-[#584F55] hover:bg-[#FDFBF7]"
                >
                  All Entries
                </Link>
              </div>

              {recentSymptoms.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#FAF7F5] border border-dashed border-[#E3D7CF] space-y-3">
                  <Activity className="w-8 h-8 text-[#B5AAB1] mx-auto" />
                  <p className="text-xs text-[#6D636B]">
                    No symptom observations logged yet. Start recording your cycle, cramps, or fatigue.
                  </p>
                  <Link
                    to="/tracker"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8C3B5E] text-white text-xs font-semibold"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Log First Observation</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentSymptoms.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#F0E6DE] flex items-center justify-between hover:border-[#D5C7BE] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                            s.severity >= 7
                              ? 'bg-rose-100 text-rose-800'
                              : s.severity >= 4
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {s.severity}/10
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#2B232A]">{s.symptom_name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-[#7A7177]">
                            <span>{s.category}</span>
                            <span>&bull;</span>
                            <span>{new Date(s.recorded_at).toLocaleDateString()}</span>
                            {s.cycle_day && <span>&bull; Day {s.cycle_day}</span>}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[#8C3B5E] font-medium">
                        {s.duration_hours ? `${s.duration_hours}h duration` : 'Recorded'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Appointments Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2B232A]">Upcoming Consultations</h3>
                  <p className="text-xs text-[#7A7177]">Demo clinician sessions</p>
                </div>
                <Link to="/doctors" className="text-xs font-semibold text-[#C86D51] hover:underline">
                  Book Slot
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-[#FAF7F5] border border-dashed border-[#E3D7CF] space-y-2">
                  <Calendar className="w-8 h-8 text-[#B5AAB1] mx-auto" />
                  <p className="text-xs text-[#6D636B]">No consultations booked right now.</p>
                  <Link
                    to="/doctors"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C86D51] text-white text-xs font-semibold"
                  >
                    <span>Browse Fictional Clinicians</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#2B232A]">{apt.doctor_name}</p>
                          <p className="text-[11px] text-[#7A7177]">{apt.doctor_specialty}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 capitalize">
                          {apt.appointment_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#584F55]">
                        <Clock className="w-3.5 h-3.5 text-[#C86D51]" />
                        <span>{new Date(apt.appointment_time).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Prototype Safety Reminder */}
              <div className="p-3.5 rounded-xl bg-[#F7F2EF] border border-[#E8DFD8] text-[11px] text-[#6D636B] leading-relaxed">
                <span className="font-semibold text-[#8C3B5E]">Educational Prototype:</span> All consultations and clinicians
                are fictional demonstrations. If your symptoms worsen rapidly, please call 112 or visit an emergency room.
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Public Landing Page Mode for Unauthenticated Visitors */
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-[#F9F5F1] via-[#FDFBF7] to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Hero Left Text */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-xs font-semibold text-[#8C3B5E]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span>Comprehensive Women's Healthcare Platform</span>
                  </div>

                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#261E23] leading-[1.15]">
                    Every stage of her health.{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8C3B5E] to-[#C86D51]">
                      One trusted place.
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-[#61575D] max-w-2xl leading-relaxed mx-auto lg:mx-0">
                    HerHealth 360 brings together evidence-based medical education, private symptom tracking,
                    responsible AI navigation, and a downloadable clinical Health Passport—supporting women beyond just periods.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                    <button
                      onClick={() => openAuthModal('register')}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white font-semibold text-sm shadow-md hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                    >
                      Explore Your Health Free
                    </button>
                    <Link
                      to="/navigator"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#D5C7BE] text-[#2B232A] font-semibold text-sm hover:bg-[#FAF7F5] shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#C86D51]" />
                      <span>Try Health Navigator</span>
                    </Link>
                    <Link
                      to="/doctors"
                      className="w-full sm:w-auto px-5 py-3.5 text-[#6D636B] hover:text-[#2B232A] text-sm font-semibold text-center"
                    >
                      Find a Doctor &rarr;
                    </Link>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#7A7177]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Deterministic Rule-Based AI</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Zero Real User Data Scraping</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Private Account Isolation</span>
                    </div>
                  </div>
                </div>

                {/* Hero Right Visual Card */}
                <div className="lg:col-span-5">
                  <div className="p-6 rounded-3xl bg-white border border-[#E3D7CF] shadow-xl space-y-5 relative">
                    <div className="flex items-center justify-between pb-4 border-b border-[#F0E6DE]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#8C3B5E] text-white flex items-center justify-center font-bold text-xs">
                          360
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#2B232A]">HerHealth 360 Navigator</p>
                          <p className="text-[11px] text-[#7A7177]">Non-diagnostic clinical triage demo</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Safe Mode Active
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-[#FAF7F5] border border-[#EAE0D8] text-xs text-[#584F55]">
                        <p className="font-semibold text-[#8C3B5E] mb-1">Sample User Query:</p>
                        <p className="italic">
                          "I have severe cramping during periods and missed cycles for 2 months. Could this be PCOS?"
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/60 text-xs text-[#2B232A] space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-[#8C3B5E]">
                          <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
                          <span>Educational Assessment (No Diagnosis Claimed)</span>
                        </div>
                        <p className="text-[11px] text-[#584F55] leading-relaxed">
                          Symptoms match common features of PCOS and dysmenorrhea. Recommended next step: Schedule an
                          ultrasound and hormonal evaluation with a gynecologist.
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-[#7A7177]">Source: WHO & NHS UK</span>
                          <Link to="/navigator" className="text-[11px] text-[#8C3B5E] font-bold hover:underline">
                            Open Navigator &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Triage checks red-flags (severe pain, hemorrhage) to trigger immediate 112 guidance.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Life Stage Overview Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C86D51]">Holistic Healthcare</span>
              <h2 className="font-serif text-3xl font-bold text-[#2B232A]">Care That Evolves With Every Stage</h2>
              <p className="text-xs sm:text-sm text-[#6D636B] leading-relaxed">
                Women’s healthcare is not a single phase. From adolescent puberty through midlife menopause,
                HerHealth 360 offers tailored educational modules and symptom tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {lifeStages.map((stage) => (
                <div
                  key={stage.title}
                  className={`p-6 rounded-2xl border bg-gradient-to-b ${stage.color} flex flex-col justify-between space-y-4 shadow-xs`}
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/70 shadow-2xs">
                      {stage.tag}
                    </span>
                    <h3 className="font-serif text-lg font-bold">{stage.title}</h3>
                    <p className="text-xs leading-relaxed opacity-90">{stage.desc}</p>
                  </div>
                  <Link
                    to="/library"
                    className="inline-flex items-center gap-1 text-xs font-bold hover:underline pt-2"
                  >
                    <span>Read resources</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Core Feature Hubs Highlights */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C3B5E]">Comprehensive Platform</span>
              <h2 className="font-serif text-3xl font-bold text-[#2B232A]">What HerHealth 360 Delivers</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#8C3B5E] flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#2B232A]">Symptom Tracker</h3>
                  <p className="text-xs text-[#6D636B] leading-relaxed">
                    Log severity (1–10), duration, cycle days, sleep, and fatigue. Interactive Recharts
                    visualize symptom trends without clinical overclaiming.
                  </p>
                </div>
                <Link to="/tracker" className="text-xs font-bold text-[#8C3B5E] hover:underline inline-block pt-2">
                  Explore Tracker &rarr;
                </Link>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#C86D51] flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#2B232A]">Doctor Directory</h3>
                  <p className="text-xs text-[#6D636B] leading-relaxed">
                    Browse fictional clinicians, book future consultation slots,
                    prevent double-booking conflicts, and test public Jitsi demo video calls.
                  </p>
                </div>
                <Link to="/doctors" className="text-xs font-bold text-[#C86D51] hover:underline inline-block pt-2">
                  View Clinicians &rarr;
                </Link>
              </div>

              {/* Feature 3: Physical Therapy & Exercises */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#2B232A]">AI Clinical Guidance</h3>
                  <p className="text-xs text-[#6D636B] leading-relaxed">
                    Ask any symptom or wellness question to instantly receive evidence-based clinical insights
                    and targeted YouTube video demonstrations tailored to your exact condition.
                  </p>
                </div>
                <Link to="/navigator" className="text-xs font-bold text-purple-700 hover:underline inline-block pt-2">
                  Ask Navigator &rarr;
                </Link>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#2B232A]">Health Passport</h3>
                  <p className="text-xs text-[#6D636B] leading-relaxed">
                    Generate an organized ReportLab PDF summarizing your self-reported history, average severity, and questions
                    for real doctor visits.
                  </p>
                </div>
                <Link to="/passport" className="text-xs font-bold text-teal-700 hover:underline inline-block pt-2">
                  Passport Preview &rarr;
                </Link>
              </div>
            </div>
          </section>

          {/* Privacy & Medical Safety Banner */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 rounded-3xl bg-[#FAF7F5] border border-[#E3D7CF] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8C3B5E] uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Responsible Healthcare Engineering</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2B232A]">
                  Built for Privacy, Security, and Clinical Transparency
                </h3>
                <p className="text-xs text-[#6D636B] leading-relaxed">
                  HerHealth 360 strictly isolates user data per account, does not monetize personal health observations,
                  and provides transparent medical source citations (WHO, CDC, NHS, Ministry of Health India).
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-6 py-3 rounded-xl bg-[#8C3B5E] text-white text-xs font-bold hover:bg-[#742D4B] transition-colors"
                >
                  Join HerHealth 360
                </button>
                <Link
                  to="/privacy"
                  className="px-6 py-3 rounded-xl bg-white border border-[#D5C7BE] text-[#2B232A] text-xs font-semibold hover:bg-[#FDFBF7] text-center"
                >
                  Read Safety Notice
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
