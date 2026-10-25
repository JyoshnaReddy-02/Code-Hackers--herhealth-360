import React from 'react';
import { X, Video, ShieldAlert, ExternalLink } from 'lucide-react';

interface JitsiDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomUrl: string;
  doctorName: string;
  specialty: string;
}

export const JitsiDemoModal: React.FC<JitsiDemoModalProps> = ({
  isOpen,
  onClose,
  roomUrl,
  doctorName,
  specialty,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-4xl h-[85vh] bg-[#1E1B1D] rounded-2xl shadow-2xl border border-[#4A3D46] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#2B232A] text-white flex items-center justify-between border-b border-[#3D323A]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Demo Consultation: {doctorName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Fictional Demo
                </span>
              </div>
              <p className="text-[11px] text-[#A699A2]">{specialty}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={roomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Full Screen</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prominent Privacy & Security Disclaimer Banner */}
        <div className="px-4 py-2 bg-amber-950/70 border-b border-amber-800/40 text-amber-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <p className="text-[11px] leading-tight">
            <strong>Demonstration Feature Only:</strong> This video room uses public Jitsi Meet infrastructure for technical evaluation.
            It is <strong>not</strong> an encrypted clinical telemedicine service. Do not share confidential or personal health details.
          </p>
        </div>

        {/* Video IFrame */}
        <div className="flex-1 bg-black relative">
          <iframe
            src={roomUrl}
            title="HerHealth 360 Video Consultation Demonstration"
            className="w-full h-full border-0"
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
          />
        </div>
      </div>
    </div>
  );
};
