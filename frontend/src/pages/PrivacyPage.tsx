import React from 'react';
import { ShieldCheck, Lock, Shield, HeartPulse, Info, FileText, PhoneCall } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-xs font-semibold text-[#8C3B5E]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Application Security, Data Privacy & Medical Safety</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#261E23] tracking-tight">
          Privacy Policy & Safety Architecture
        </h1>
        <p className="text-xs sm:text-sm text-[#61575D] max-w-2xl leading-relaxed">
          Comprehensive disclosures on data isolation, private local storage, medical boundaries,
          synthetic test datasets, and emergency protocols.
        </p>
      </div>

      {/* Critical Medical Disclaimer Banner */}
      <div className="p-6 rounded-3xl bg-amber-50/90 border border-amber-200 shadow-xs space-y-2 text-xs text-amber-950">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <HeartPulse className="w-5 h-5 text-amber-700" />
          <span>Educational Medical Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          <strong>HerHealth 360 is an educational prototype, not a medical device or certified telemedicine provider.</strong>{' '}
          It does not diagnose conditions, calculate disease probabilities, prescribe medications, or replace in-person
          evaluation by licensed healthcare practitioners. If symptoms are severe, rapidly worsening, or potentially
          life-threatening, seek immediate local emergency care. In India, call <strong>112</strong> or <strong>102</strong>.
        </p>
      </div>

      {/* Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Local Data Sovereignty & Privacy */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-[#8C3B5E]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#261E23]">Local Data Sovereignty & Protection</h3>
          </div>
          <p className="text-xs text-[#6D636B] leading-relaxed">
            Personal health observations, cycle diaries, and consultation notes are safeguarded with strict privacy boundaries:
          </p>
          <ul className="space-y-1.5 text-xs text-[#584F55]">
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-[#8C3B5E]">&bull;</span>
              <span><strong>Private Local Storage:</strong> Your health observations and symptom diary are maintained in an isolated, secure database.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-[#8C3B5E]">&bull;</span>
              <span><strong>Zero Data Monetization:</strong> Your medical observations are never sold, commercialized, or shared with data brokers.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-[#8C3B5E]">&bull;</span>
              <span><strong>No Third-Party Ad Trackers:</strong> Zero advertising pixels, trackers, or commercial marketing scripts are embedded.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-[#8C3B5E]">&bull;</span>
              <span><strong>Direct PDF Generation:</strong> Health Passports are compiled on demand and securely streamed directly to your browser.</span>
            </li>
          </ul>
        </div>

        {/* 2. User Data Isolation */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-800">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#261E23]">User Data Isolation & IDOR Defense</h3>
          </div>
          <p className="text-xs text-[#6D636B] leading-relaxed">
            Every private API endpoint enforces authentication and strict record ownership checks:
          </p>
          <ul className="space-y-1.5 text-xs text-[#584F55]">
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-teal-700">&bull;</span>
              <span>A user can <strong>never</strong> view, edit, or delete another user's symptom observations or appointments by altering IDs in requests.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-teal-700">&bull;</span>
              <span>Passwords hashed with Werkzeug PBKDF2-SHA256. Password hashes are never returned in API payloads.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-teal-700">&bull;</span>
              <span>Sensitive tokens are scoped and expire automatically after 7 days.</span>
            </li>
          </ul>
        </div>

        {/* 3. Synthetic Dataset Methodology */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-800">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#261E23]">Synthetic Dataset Methodology</h3>
          </div>
          <p className="text-xs text-[#6D636B] leading-relaxed">
            For analytics benchmarking and visual demonstrations, a synthetic dataset of 300 observations was generated:
          </p>
          <ul className="space-y-1.5 text-xs text-[#584F55]">
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700">&bull;</span>
              <span><strong>Zero Real User Records:</strong> Contains no PII, clinical chart scrapes, or hospital logs.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700">&bull;</span>
              <span><strong>Reproducible:</strong> Generated with a deterministic random seed for realistic yet safe analytics testing.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700">&bull;</span>
              <span><strong>Separation:</strong> Synthetic benchmark records are kept strictly separated from real user accounts.</span>
            </li>
          </ul>
        </div>

        {/* 4. Fictional Clinicians & Jitsi Video */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-800">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#261E23]">Fictional Profiles & Video Demo</h3>
          </div>
          <p className="text-xs text-[#6D636B] leading-relaxed">
            Transparency regarding demonstration practitioners and video room capabilities:
          </p>
          <ul className="space-y-1.5 text-xs text-[#584F55]">
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-purple-700">&bull;</span>
              <span><strong>Fictional Clinicians:</strong> Dr Ananya Rao, Dr Meera Nair, and Dr Kavya Iyer are educational demo profiles without real medical licensing claims.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-purple-700">&bull;</span>
              <span><strong>Jitsi Demonstration:</strong> The video consultation feature utilizes public Jitsi Meet for UX demonstration and must not be used for confidential medical discussions.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Emergency Guidance Section */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 space-y-3 text-xs">
        <h3 className="font-serif text-base font-bold text-red-900 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-red-600" /> Emergency Resources & Helplines (India)
        </h3>
        <p className="text-red-950 leading-relaxed">
          In cases of emergency, acute pain, heavy bleeding with fainting, or pregnancy complications, contact:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-white rounded-xl border border-red-100 text-center">
            <div className="text-lg font-extrabold text-red-600">112</div>
            <div className="text-[11px] text-[#584F55]">National Emergency Helpline</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-red-100 text-center">
            <div className="text-lg font-extrabold text-red-600">102 / 108</div>
            <div className="text-[11px] text-[#584F55]">Ambulance Services</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-red-100 text-center">
            <div className="text-lg font-extrabold text-[#8C3B5E]">1091</div>
            <div className="text-[11px] text-[#584F55]">Women Helpline (Distress)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
