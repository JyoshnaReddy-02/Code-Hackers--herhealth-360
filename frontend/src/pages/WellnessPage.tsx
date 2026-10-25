import React, { useState, useEffect } from 'react';
import {
  Apple,
  Dumbbell,
  Moon,
  Smile,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Video,
  Clock,
  Flame,
  BookOpen,
  Filter,
  Play,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { ExercisePractice } from '../types';

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
}

export const WellnessPage: React.FC = () => {
  const [exercises, setExercises] = useState<ExercisePractice[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [exerciseCategory, setExerciseCategory] = useState<string>('All');
  const [activeVideoExercise, setActiveVideoExercise] = useState<ExercisePractice | null>(null);

  const exerciseCategories = [
    'All',
    'Pelvic Health',
    'Menstrual Comfort',
    'Antenatal & Maternal',
    'Mind-Body Wellness',
  ];

  useEffect(() => {
    loadExercises(exerciseCategory);
  }, [exerciseCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideoExercise(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadExercises = async (cat: string) => {
    setLoadingExercises(true);
    try {
      let queryCat = '';
      if (cat === 'Pelvic Health') queryCat = 'Pelvic';
      else if (cat === 'Menstrual Comfort') queryCat = 'Menstrual';
      else if (cat === 'Antenatal & Maternal') queryCat = 'Antenatal';
      else if (cat === 'Mind-Body Wellness') queryCat = 'Mind-Body';

      const res = await api.getPublicExercises(queryCat || undefined);
      setExercises(res.exercises || []);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setLoadingExercises(false);
    }
  };

  const wellnessPillars = [
    {
      title: 'Balanced Endocrine Nutrition',
      icon: Apple,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      tips: [
        'Balance meals with the 3Ps: Protein, Produce (rich dietary fiber), and Pure Healthy Fats to buffer glycemic spikes.',
        'Incorporate omega-3 fatty acids (flaxseeds, walnuts, chia seeds) to soothe inflammatory prostaglandin pathways.',
        'Prioritize complex low-glycemic carbohydrates over refined sugars to support insulin sensitivity in PCOS.',
        'Avoid restrictive crash diets which elevate systemic cortisol and can suppress healthy ovulatory signaling.',
      ],
    },
    {
      title: 'Physical Activity & Cycle Alignment',
      icon: Dumbbell,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      tips: [
        'Blend progressive resistance training with steady-state cardio to stimulate GLUT-4 insulin transporters.',
        'Engage in low-impact movement (walking, swimming, yin yoga) during high-cramping or heavy menstrual flow days.',
        'Support bone mineral density with weight-bearing workouts, especially critical leading into perimenopause.',
        'Always obtain clinical clearance for physical exercise during pregnancy or with underlying cardiovascular concerns.',
      ],
    },
    {
      title: 'Circadian Rhythm & Sleep Hygiene',
      icon: Moon,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      tips: [
        'Anchor your master circadian clock by viewing outdoor natural sunlight within 30 minutes of waking.',
        'Maintain a consistent sleep-wake schedule across weekdays and weekends for hormonal rhythm stability.',
        'Institute a "digital sunset" 60 minutes prior to sleep to protect nocturnal melatonin production from blue light.',
        'Keep the sleeping environment cool and well-ventilated to buffer against nocturnal hot flashes or flushing.',
      ],
    },
    {
      title: 'Autonomic Regulation & Stress Physiology',
      icon: Smile,
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      tips: [
        'Practice physiological sighs (two quick nasal inhales followed by one long, slow mouth exhale) to reduce acute anxiety.',
        'Protect restorative personal boundaries around work, caretaking, and digital connectivity.',
        'Maintain open social support connections with trusted friends, family, or women’s peer circles.',
        'Seek licensed clinical psychological support if chronic distress or anxiety persists over consecutive weeks.',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-xs font-semibold text-[#8C3B5E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Evidence-Based Lifestyle Medicine & Physical Therapy</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#261E23] tracking-tight">
          Whole-Body Wellness, Movement & Practice Routines
        </h1>
        <p className="text-xs sm:text-sm text-[#61575D] max-w-3xl leading-relaxed">
          Grounding women’s health in foundational resilience: guided physical therapy exercises, Kegel conditioning,
          circadian rhythm alignment, anti-inflammatory nutrition, and nervous system regulation.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#E8DFD8] flex items-start gap-3 text-xs text-[#584F55]">
        <ShieldCheck className="w-5 h-5 text-[#8C3B5E] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#2B232A]">Evidence-Based Movement & Practice Disclaimer:</p>
          <p className="text-[11px] leading-relaxed text-[#6D636B]">
            Exercise routines support foundational muscular recovery, pelvic rehabilitation, and metabolic wellness. Always perform
            movements in a pain-free range of motion. Never continue any exercise that causes sharp acute pain or dizziness, and consult
            your clinician prior to beginning new physical practices.
          </p>
        </div>
      </div>

      {/* NEW: Physical Therapy & Guided Exercise Routines */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFD8]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C3B5E] uppercase tracking-wider mb-1">
              <Dumbbell className="w-4 h-4" />
              <span>Targeted Movement Practices</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#261E23]">
              Clinical Exercise & Movement Routines
            </h2>
            <p className="text-xs text-[#7A7177] mt-0.5">
              Follow step-by-step physical therapy drills with verified YouTube demonstration video tutorials and clinical guides.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-[#7A7177] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {exerciseCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setExerciseCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    exerciseCategory === cat
                      ? 'bg-[#8C3B5E] text-white shadow-xs'
                      : 'bg-white border border-[#E3D7CF] text-[#584F55] hover:bg-[#F8F1EB]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loadingExercises ? (
          <div className="p-12 text-center text-xs text-[#7A7177]">
            <div className="w-6 h-6 border-2 border-[#8C3B5E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading clinical exercise practices...
          </div>
        ) : exercises.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-[#E8DFD8] text-xs text-[#7A7177]">
            No exercise routines found matching this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="rounded-3xl bg-white border border-[#E8DFD8] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Image header if available or fallback YouTube thumb */}
                  <div
                    className="h-48 w-full overflow-hidden bg-stone-100 relative group cursor-pointer"
                    onClick={() => ex.youtube_url && setActiveVideoExercise(ex)}
                  >
                    <img
                      src={
                        ex.image_url ||
                        (getYouTubeVideoId(ex.youtube_url)
                          ? `https://img.youtube.com/vi/${getYouTubeVideoId(ex.youtube_url)}/hqdefault.jpg`
                          : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80')
                      }
                      alt={ex.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      {ex.youtube_url && (
                        <div className="w-12 h-12 rounded-full bg-[#8C3B5E]/90 group-hover:bg-[#8C3B5E] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5 fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-[#8C3B5E] shadow-xs">
                        {ex.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#2B232A]/80 backdrop-blur-sm text-white shadow-xs">
                        {ex.difficulty}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/75 backdrop-blur-sm text-white flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3" />
                      <span>{ex.duration_minutes} min</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#261E23] leading-snug">
                        {ex.title}
                      </h3>
                      {ex.target_condition && (
                        <p className="text-xs font-medium text-[#8C3B5E] mt-1">
                          Focus: {ex.target_condition}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-[#584F55] leading-relaxed">
                      {ex.description}
                    </p>

                    {ex.instructions && (
                      <div className="p-3.5 rounded-2xl bg-[#FAF8F6] border border-[#F0E6DE] space-y-2">
                        <p className="text-[11px] font-bold text-[#2B232A] uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-[#8C3B5E]" /> Practice Steps:
                        </p>
                        <p className="text-xs text-[#584F55] whitespace-pre-line leading-relaxed font-sans">
                          {ex.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {ex.youtube_url && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveVideoExercise(ex)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8C3B5E] hover:bg-[#722F4C] text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Watch Video Tutorial</span>
                        </button>

                        <a
                          href={ex.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#CC0000] hover:bg-[#b00000] text-white font-semibold text-xs transition-colors shadow-xs"
                          title="Open directly on YouTube (new tab)"
                        >
                          <Video className="w-3.5 h-3.5 fill-white" />
                          <span>YouTube</span>
                          <ExternalLink className="w-3 h-3 opacity-90" />
                        </a>
                      </>
                    )}

                    {ex.website_url && (
                      <a
                        href={ex.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-[#D5C7BE] text-[#2B232A] font-semibold text-xs transition-colors"
                      >
                        <span>Clinical Guide</span>
                        <ExternalLink className="w-3 h-3 text-[#7A7177]" />
                      </a>
                    )}
                  </div>

                  {ex.source_reference && (
                    <p className="text-[10px] text-[#8A8187] italic">
                      Source: {ex.source_reference}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4 Pillars Grid */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#261E23]">
          Core Lifestyle Medicine Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wellnessPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl border ${pillar.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#261E23]">{pillar.title}</h3>
                  </div>

                  <ul className="space-y-2 text-xs text-[#584F55]">
                    {pillar.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Clinician Questions */}
      <div className="p-8 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#261E23] flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#8C3B5E]" /> Thoughtful Questions to Ask Your Healthcare Provider
        </h3>
        <p className="text-xs text-[#7A7177]">
          Maximize the quality of your doctor visits by bringing prepared, proactive questions:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#584F55]">
          <div className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#F0E6DE]">
            <strong>Nutritional Biomarkers:</strong> "Could we evaluate my serum ferritin, Vitamin D3, and fasting lipid/glucose
            profile to assess metabolic baseline?"
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#F0E6DE]">
            <strong>Hormonal Patterns:</strong> "How do my reported symptom timings align with standard follicular and luteal
            phases?"
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#F0E6DE]">
            <strong>Exercise Tolerance:</strong> "Are there any specific movement contraindications for my pelvic floor or
            gestational status?"
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#F0E6DE]">
            <strong>Screening Timeline:</strong> "Based on my age and family background, what is my schedule for Pap smears,
            mammograms, or bone density scans?"
          </div>
        </div>
      </div>

      {/* External Verified Resources */}
      <div className="p-6 rounded-3xl bg-[#FAF7F5] border border-[#E3D7CF] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-[#2B232A]">National Telemedicine Support:</span>
          <p className="text-[11px] text-[#6D636B] mt-0.5">
            Connect directly with verified national health programs and medical libraries in India and globally.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <a
            href="https://esanjeevani.mohfw.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#8C3B5E] text-white font-semibold text-xs flex items-center gap-1.5"
          >
            <span>eSanjeevani Teleconsultation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.nhs.uk/live-well/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white border border-[#D5C7BE] text-[#2B232A] font-semibold text-xs flex items-center gap-1.5"
          >
            <span>NHS Live Well</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Interactive In-App YouTube Video Modal */}
      {activeVideoExercise && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveVideoExercise(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#F0E6DE] bg-[#FAF8F6]">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-[#8C3B5E]">
                  {activeVideoExercise.category}
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#261E23]">
                  {activeVideoExercise.title}
                </h3>
                <span className="text-xs text-[#7A7177] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {activeVideoExercise.duration_minutes} min
                </span>
              </div>
              <button
                onClick={() => setActiveVideoExercise(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 text-[#584F55] transition-colors cursor-pointer"
                aria-label="Close video player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded YouTube Player */}
            <div className="relative w-full bg-black aspect-video shrink-0">
              {getYouTubeEmbedUrl(activeVideoExercise.youtube_url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideoExercise.youtube_url)!}
                  title={activeVideoExercise.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs gap-3 p-6 text-center">
                  <p>In-page player preview is not supported for this URL format.</p>
                  <a
                    href={activeVideoExercise.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#CC0000] hover:bg-[#b00000] text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Video className="w-4 h-4 fill-white" />
                    <span>Open on YouTube (New Tab)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Body & Clinical Controls */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-white text-xs text-[#584F55]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0E6DE]">
                <div>
                  {activeVideoExercise.target_condition && (
                    <p className="text-xs font-semibold text-[#8C3B5E]">
                      Target Focus: {activeVideoExercise.target_condition}
                    </p>
                  )}
                  <p className="text-xs text-[#6D636B] mt-0.5">{activeVideoExercise.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activeVideoExercise.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#CC0000] hover:bg-[#b00000] text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <Video className="w-4 h-4 fill-white" />
                    <span>Open on YouTube ↗</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {activeVideoExercise.website_url && (
                    <a
                      href={activeVideoExercise.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-[#D5C7BE] text-[#2B232A] font-semibold text-xs transition-colors"
                    >
                      <span>Medical Guide</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#7A7177]" />
                    </a>
                  )}
                </div>
              </div>

              {activeVideoExercise.instructions && (
                <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#F0E6DE] space-y-2">
                  <p className="text-[11px] font-bold text-[#2B232A] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#8C3B5E]" /> Practice Guide & Posture Steps:
                  </p>
                  <p className="text-xs text-[#584F55] whitespace-pre-line leading-relaxed font-sans">
                    {activeVideoExercise.instructions}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Tip: Perform all physical exercises gently within a pain-free range of motion. Rest whenever necessary.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

