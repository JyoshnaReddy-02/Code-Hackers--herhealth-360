import React, { useEffect } from 'react';
import { AlertTriangle, PhoneCall, X, ShieldAlert, HeartPulse, ExternalLink } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border-2 border-red-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs">
              <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-xl font-bold tracking-tight">
                Emergency & Urgent Medical Guidance
              </h2>
              <p className="text-xs text-red-100 mt-0.5">
                If you are experiencing acute medical distress, prioritize emergency care immediately.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Emergency Guidance"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-sm text-[#2B232A]">
          {/* Emergency Warning Signs Checklist */}
          <div>
            <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
              <HeartPulse className="w-4 h-4" /> Recognize Immediate Red-Flag Symptoms:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <li className="p-2.5 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
                <span className="text-red-600 font-bold">&bull;</span>
                <span>Sudden, severe or excruciating abdominal or pelvic pain</span>
              </li>
              <li className="p-2.5 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
                <span className="text-red-600 font-bold">&bull;</span>
                <span>Heavy bleeding soaking &gt;2 pads/hour with fainting or dizziness</span>
              </li>
              <li className="p-2.5 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
                <span className="text-red-600 font-bold">&bull;</span>
                <span>Shortness of breath, chest tightness, or respiratory distress</span>
              </li>
              <li className="p-2.5 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
                <span className="text-red-600 font-bold">&bull;</span>
                <span>Pregnancy alerts: Fluid gush, bleeding, or reduced fetal movement</span>
              </li>
            </ul>
          </div>

          {/* India Emergency Numbers Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <h4 className="font-bold text-[#8C3B5E] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-orange-600" /> Direct Emergency Helplines (India):
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <a
                href="tel:112"
                className="p-3 bg-white rounded-xl shadow-xs border border-amber-100 hover:border-red-400 transition-colors group"
              >
                <div className="text-xl font-extrabold text-red-600 group-hover:scale-105 transition-transform">112</div>
                <div className="text-[11px] text-[#584F55] font-medium mt-0.5">National Emergency</div>
              </a>
              <a
                href="tel:102"
                className="p-3 bg-white rounded-xl shadow-xs border border-amber-100 hover:border-red-400 transition-colors group"
              >
                <div className="text-xl font-extrabold text-red-600 group-hover:scale-105 transition-transform">102 / 108</div>
                <div className="text-[11px] text-[#584F55] font-medium mt-0.5">Ambulance Service</div>
              </a>
              <a
                href="tel:1091"
                className="p-3 bg-white rounded-xl shadow-xs border border-amber-100 hover:border-red-400 transition-colors group"
              >
                <div className="text-xl font-extrabold text-[#8C3B5E] group-hover:scale-105 transition-transform">1091</div>
                <div className="text-[11px] text-[#584F55] font-medium mt-0.5">Women in Distress</div>
              </a>
            </div>
          </div>

          {/* Government Telemedicine Link */}
          <div className="p-3 rounded-xl bg-[#F8F4F1] border border-[#E8DFD8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#8C3B5E]" />
              <div className="text-xs">
                <span className="font-semibold text-[#2B232A]">eSanjeevani (Govt of India):</span>
                <span className="text-[#6D636B] block sm:inline sm:ml-1">National free doctor teleconsultation</span>
              </div>
            </div>
            <a
              href="https://esanjeevani.mohfw.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#8C3B5E] text-white hover:bg-[#722F4C] transition-colors flex items-center gap-1 shrink-0"
            >
              Open <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Safety Notice */}
          <p className="text-[11px] text-[#7A7177] italic leading-tight">
            * This list is conservative and educational. Absence of listed symptoms does not guarantee safety. When in doubt,
            always seek prompt in-person clinical assessment.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F4F1] border-t border-[#E8DFD8] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#2B232A] text-white hover:bg-black transition-colors"
          >
            I Understand — Close
          </button>
        </div>
      </div>
    </div>
  );
};
