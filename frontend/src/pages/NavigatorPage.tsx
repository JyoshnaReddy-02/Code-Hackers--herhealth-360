import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Calendar,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  HeartPulse,
  Dumbbell,
  Video,
  Play,
  X,
  Clock,
  Image as ImageIcon,
  Target,
} from 'lucide-react';
import { api } from '../services/api';
import { NavigatorResponse, ExercisePractice } from '../types';
import { Link } from 'react-router-dom';

interface Message {
  sender: 'user' | 'navigator';
  text?: string;
  response?: NavigatorResponse;
  timestamp: string;
}

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

export const NavigatorPage: React.FC = () => {
  const [inputQuery, setInputQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeVideoExercise, setActiveVideoExercise] = useState<ExercisePractice | null>(null);
  const [modalTab, setModalTab] = useState<'video' | 'image'>('video');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideoExercise(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'navigator',
      text:
        'Hello. I am the HerHealth 360 Health Navigator. I provide evidence-based health education and sensible next steps based on WHO, NHS, and CDC guidance.\n\nI do not diagnose diseases, prescribe medications, or replace a medical professional. How can I guide you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const demoScenarios = [
    { label: 'Irregular cycles & acne (PCOS)', query: 'I have irregular periods and stubborn facial acne. Could it be PCOS?' },
    { label: 'Debilitating period pain (Endo)', query: 'My period cramps are unbearable and make me miss work. Is this normal?' },
    { label: 'Weight Loss & Exercise Videos', query: 'I need exercise videos for weight loss' },
    { label: 'Cervical Pap smear & HPV', query: 'When should I get screened for HPV and cervical cancer?' },
    { label: 'Red-Flag Emergency Test', query: 'I have sudden severe sharp pelvic pain and heavy bleeding with fainting' },
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.queryNavigator(q, selectedTopic || undefined);
      const navMsg: Message = {
        sender: 'navigator',
        response: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, navMsg]);
    } catch (e: any) {
      const errorMsg: Message = {
        sender: 'navigator',
        text: 'Sorry, I encountered an issue processing your query. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-xs font-semibold text-[#8C3B5E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deterministic Rule-Based Health Navigation</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#261E23]">AI Health Navigator</h1>
        <p className="text-xs sm:text-sm text-[#61575D] max-w-2xl leading-relaxed">
          Explore evidence-based insights, understand when to seek professional care, and identify safe self-care habits.
          Our navigator is deterministic and governed by strict medical safety protocols.
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-[#FAF7F5] border border-[#E8DFD8] flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-[#584F55]">
          <ShieldCheck className="w-4 h-4 text-[#8C3B5E] shrink-0" />
          <span>Non-diagnostic tool. If symptoms are severe or rapidly worsening, seek emergency care immediately.</span>
        </div>
        <a
          href="tel:112"
          className="px-3 py-1 text-xs font-bold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors shrink-0 flex items-center gap-1"
        >
          <PhoneCall className="w-3 h-3" /> Dial 112 (India)
        </a>
      </div>

      {/* Quick Demo Prompts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-[#7A7177] uppercase tracking-wider">
          Suggested Demonstrations:
        </span>
        <div className="flex flex-wrap gap-2">
          {demoScenarios.map((demo) => (
            <button
              key={demo.label}
              onClick={() => handleSend(demo.query)}
              className="px-3 py-1.5 rounded-xl border border-[#D5C7BE] bg-white hover:border-[#8C3B5E] text-xs font-medium text-[#2B232A] hover:bg-[#FAF2ED] transition-colors"
            >
              &bull; {demo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area Container */}
      <div className="bg-white rounded-3xl border border-[#E8DFD8] shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const res = msg.response;

            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8C3B5E] to-[#C86D51] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-[#8C3B5E] to-[#A84A71] text-white rounded-tr-xs'
                      : res?.is_emergency
                      ? 'bg-red-50 border-2 border-red-300 text-[#2B232A] rounded-tl-xs shadow-md'
                      : 'bg-[#FAF8F6] border border-[#E8DFD8] text-[#2B232A] rounded-tl-xs'
                  }`}
                >
                  {/* Normal User Message or Text Message */}
                  {msg.text && <div className="whitespace-pre-line">{msg.text}</div>}

                  {/* Navigator Structured Response */}
                  {res && (
                    <div className="space-y-4">
                      {/* Emergency Alert Banner */}
                      {res.is_emergency ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                            <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                            <span>{res.title}</span>
                          </div>
                          <p className="text-xs text-red-900 leading-relaxed font-medium">{res.message}</p>

                          {res.emergency_actions && (
                            <div className="p-3.5 rounded-xl bg-white border border-red-200 space-y-2">
                              <h5 className="font-bold text-xs uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                                <PhoneCall className="w-3.5 h-3.5" /> Immediate Emergency Actions:
                              </h5>
                              <ul className="space-y-1.5 text-xs text-red-950">
                                {res.emergency_actions.map((act, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="font-bold text-red-600">&bull;</span>
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Standard Educational Guidance */
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD8]">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C3B5E]">
                                {res.category || 'Clinical Education'}
                              </span>
                              <h4 className="font-serif text-base font-bold text-[#261E23]">{res.title}</h4>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Non-Diagnostic
                            </span>
                          </div>

                          <p className="text-xs text-[#4D444A] leading-relaxed whitespace-pre-line">{res.educational_summary}</p>

                          {/* Key Insights Structured Breakdown */}
                          {res.key_insights && res.key_insights.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/90 space-y-2">
                              <h5 className="font-bold text-xs text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-purple-700" /> Key Clinical Breakdown:
                              </h5>
                              <ul className="space-y-1.5 text-xs text-purple-950">
                                {res.key_insights.map((insight, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="font-bold text-purple-700 mt-0.5">&bull;</span>
                                    <span className="leading-relaxed">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* When to Seek Care */}
                          {res.when_to_seek_care && (
                            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                              <h5 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> When to Seek Medical Evaluation:
                              </h5>
                              <ul className="space-y-1 text-xs text-amber-950">
                                {res.when_to_seek_care.map((item, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-amber-600 font-bold">&bull;</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Self-Care Information */}
                          {res.self_care_tips && (
                            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                              <h5 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Evidence-Based Self-Care:
                              </h5>
                              <ul className="space-y-1 text-xs text-emerald-950">
                                {res.self_care_tips.map((item, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-emerald-600 font-bold">&bull;</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Recommended Targeted Exercise Routines with YouTube Video Demonstrations & Posture Images */}
                          {res.recommended_exercises && res.recommended_exercises.length > 0 && (
                            <div className="p-4 rounded-2xl bg-[#FBF7F5] border border-[#EADBCE] space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-xs text-[#8C3B5E] flex items-center gap-1.5 uppercase tracking-wider">
                                  <Dumbbell className="w-4 h-4 text-[#8C3B5E]" /> Recommended Practice Videos & Posture Guides:
                                </h5>
                                <span className="text-[10px] text-[#7A7177] font-medium">
                                  {res.recommended_exercises.length} Targeted Routine{res.recommended_exercises.length > 1 ? 's' : ''}
                                </span>
                              </div>

                              <p className="text-[11px] text-[#6D636B]">
                                Clinically relevant physical therapy, routine demonstrations, and posture guides matching your query:
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                                {res.recommended_exercises.map((ex) => {
                                  const videoId = getYouTubeVideoId(ex.youtube_url);
                                  const thumbUrl = ex.image_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80');

                                  return (
                                    <div
                                      key={ex.id}
                                      className="rounded-2xl bg-white border border-[#E8DFD8] shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
                                    >
                                      {/* Exercise Image / Video Poster */}
                                      <div className="relative h-36 w-full bg-stone-900 group shrink-0 overflow-hidden">
                                        <img
                                          src={thumbUrl}
                                          alt={ex.title}
                                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (videoId && !target.src.includes('img.youtube.com')) {
                                              target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                            }
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30 pointer-events-none" />

                                        {/* Category & Duration Badges */}
                                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-xs text-[#8C3B5E] shadow-2xs">
                                            {ex.category}
                                          </span>
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white flex items-center gap-1 shadow-2xs">
                                            <Clock className="w-2.5 h-2.5" /> {ex.duration_minutes} min
                                          </span>
                                        </div>

                                        {/* Quick Interactive Hover Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/45 gap-2 px-3">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveVideoExercise(ex);
                                              setModalTab('video');
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg bg-[#CC0000] text-white text-[11px] font-bold flex items-center gap-1 shadow-md hover:bg-[#b00000] transition-colors cursor-pointer"
                                            title="Watch Video Tutorial"
                                          >
                                            <Play className="w-3 h-3 fill-white" />
                                            <span>Play Video</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveVideoExercise(ex);
                                              setModalTab('image');
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg bg-white/95 text-[#2B232A] text-[11px] font-bold flex items-center gap-1 shadow-md hover:bg-white transition-colors cursor-pointer"
                                            title="View Exercise Posture Form & Steps"
                                          >
                                            <ImageIcon className="w-3 h-3 text-[#8C3B5E]" />
                                            <span>Posture</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Card Text & Information */}
                                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                                        <div className="space-y-1">
                                          <h6 className="font-serif text-xs sm:text-sm font-bold text-[#261E23] leading-snug">
                                            {ex.title}
                                          </h6>

                                          {ex.target_condition && (
                                            <p className="text-[11px] font-semibold text-[#8C3B5E] flex items-center gap-1">
                                              <Target className="w-3 h-3 shrink-0 text-[#8C3B5E]" />
                                              <span>{ex.target_condition}</span>
                                            </p>
                                          )}

                                          <p className="text-[11px] text-[#584F55] line-clamp-2 leading-relaxed">
                                            {ex.description}
                                          </p>
                                        </div>

                                        {/* Card Action Buttons */}
                                        <div className="flex items-center gap-1.5 pt-2 border-t border-[#F0E6DE]">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveVideoExercise(ex);
                                              setModalTab('video');
                                            }}
                                            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#8C3B5E] hover:bg-[#722F4C] text-white font-semibold text-[11px] transition-colors shadow-2xs cursor-pointer"
                                          >
                                            <Play className="w-3 h-3 fill-white" />
                                            <span>Watch Video</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveVideoExercise(ex);
                                              setModalTab('image');
                                            }}
                                            className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#2B232A] border border-[#E0D5CD] font-semibold text-[11px] transition-colors cursor-pointer"
                                            title="View Visual Posture Form & Step-by-Step Instructions"
                                          >
                                            <ImageIcon className="w-3 h-3 text-[#8C3B5E]" />
                                            <span>Posture</span>
                                          </button>

                                          {ex.youtube_url && (
                                            <a
                                              href={ex.youtube_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#CC0000] hover:bg-[#b00000] text-white font-semibold text-[11px] transition-colors shadow-2xs"
                                              title="Open directly on YouTube"
                                            >
                                              <Video className="w-3 h-3 fill-white" />
                                              <ExternalLink className="w-2.5 h-2.5 opacity-90" />
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Actions: Health Library & Doctor Directory */}
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            {res.related_slug && (
                              <Link
                                to={`/library`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF2ED] text-[#8C3B5E] text-xs font-semibold hover:bg-[#F2E5DD]"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Read Health Library Guide</span>
                              </Link>
                            )}

                            {res.suggested_specialty && (
                              <Link
                                to="/doctors"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF2ED] text-[#C86D51] text-xs font-semibold hover:bg-[#F2E5DD]"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Find Clinical Specialist</span>
                              </Link>
                            )}
                          </div>

                          {/* Verified Trusted Sources */}
                          {res.trusted_sources && res.trusted_sources.length > 0 && (
                            <div className="pt-2 border-t border-[#E8DFD8]">
                              <span className="text-[10px] text-[#7A7177] font-semibold block mb-1">
                                Verified External Sources:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {res.trusted_sources.map((src, i) => (
                                  <a
                                    key={i}
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-[#8C3B5E] hover:underline flex items-center gap-1"
                                  >
                                    <span>{src.title}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Safety Disclaimer */}
                      <p className="text-[10px] text-[#7A7177] italic pt-1 border-t border-[#EAE0D8]">{res.disclaimer}</p>
                    </div>
                  )}

                  <span className={`text-[10px] block mt-1.5 ${isUser ? 'text-rose-200' : 'text-[#8A8187]'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#7A7177] animate-pulse">
              <Sparkles className="w-4 h-4 text-[#8C3B5E]" />
              <span>Analyzing against clinical guidelines and screening for red flags...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#FAF7F5] border-t border-[#E8DFD8]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question or describe observations (e.g. 'cramping after exercise', 'irregular period guidance')..."
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E] focus:ring-1 focus:ring-[#8C3B5E]"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white font-semibold text-xs sm:text-sm hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 transition-opacity shrink-0"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Interactive In-App YouTube Video & Posture Image Modal */}
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
            <div className="p-4 sm:p-5 border-b border-[#F0E6DE] bg-[#FAF8F6] space-y-3">
              <div className="flex items-center justify-between">
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
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Media Switcher Tabs: Video vs Exercise Image */}
              <div className="flex items-center gap-2 pt-1 border-t border-[#F0E6DE]">
                <button
                  type="button"
                  onClick={() => setModalTab('video')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    modalTab === 'video'
                      ? 'bg-[#CC0000] text-white shadow-xs'
                      : 'bg-white text-[#584F55] border border-[#E0D5CD] hover:bg-stone-100'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Video (YouTube)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('image')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    modalTab === 'image'
                      ? 'bg-[#8C3B5E] text-white shadow-xs'
                      : 'bg-white text-[#584F55] border border-[#E0D5CD] hover:bg-stone-100'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Exercise Image & Posture Form</span>
                </button>
              </div>
            </div>

            {/* Media Content Area */}
            {modalTab === 'video' ? (
              /* Embedded YouTube Player */
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
            ) : (
              /* High-Resolution Exercise Posture Image */
              <div className="relative w-full bg-stone-900 aspect-video shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={
                    activeVideoExercise.image_url ||
                    (getYouTubeVideoId(activeVideoExercise.youtube_url)
                      ? `https://img.youtube.com/vi/${getYouTubeVideoId(activeVideoExercise.youtube_url)}/maxresdefault.jpg`
                      : 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80')
                  }
                  alt={activeVideoExercise.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8C3B5E] text-white shadow-xs">
                      Clinical Posture Demonstration
                    </span>
                    <h4 className="font-serif text-sm sm:text-base font-bold text-white drop-shadow-sm">
                      {activeVideoExercise.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalTab('video')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#CC0000] hover:bg-[#b00000] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Switch to Video</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body & Clinical Controls */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-white text-xs text-[#584F55]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0E6DE]">
                <div>
                  {activeVideoExercise.target_condition && (
                    <p className="text-xs font-bold text-[#8C3B5E] flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-[#8C3B5E]" />
                      <span>Target Focus: {activeVideoExercise.target_condition}</span>
                    </p>
                  )}
                  <p className="text-xs text-[#6D636B] mt-1 leading-relaxed">{activeVideoExercise.description}</p>
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
                    <BookOpen className="w-4 h-4 text-[#8C3B5E]" /> Step-by-Step Posture & Technique Guide:
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
