import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, ExternalLink, PhoneCall, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#261E23] text-[#D8CFD4] pt-14 pb-8 border-t border-[#3D323A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8C3B5E] to-[#C86D51] flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white/20" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                HerHealth <span className="text-[#E07E63]">360</span>
              </span>
            </div>
            <p className="text-xs text-[#B5AAB1] leading-relaxed max-w-sm">
              An integrated women’s health education, symptom organization, and navigation platform. Empowering women across puberty,
              reproductive wellness, maternal care, and menopause transitions.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#362A32] text-xs text-[#E8DFD8]">
              <ShieldCheck className="w-4 h-4 text-[#C86D51]" />
              <span>Isolated Private Storage &bull; Zero External Ad Trackers</span>
            </div>
          </div>

          {/* Platform Sections */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform Hubs</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/library" className="hover:text-white transition-colors">
                  Women's Health Library
                </Link>
              </li>
              <li>
                <Link to="/tracker" className="hover:text-white transition-colors">
                  Symptom & Wellness Tracker
                </Link>
              </li>
              <li>
                <Link to="/navigator" className="hover:text-white transition-colors">
                  AI Health Navigator
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-white transition-colors">
                  Doctor Directory
                </Link>
              </li>
              <li>
                <Link to="/doctor/login" className="hover:text-white transition-colors text-rose-300 font-semibold flex items-center gap-1">
                  <span>Doctor Portal</span> &rarr;
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors text-purple-300 font-semibold flex items-center gap-1">
                  <span>Admin Portal</span> &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Trusted Clinical Sources */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Verified Evidence Sources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  WHO PCOS Fact Sheet <ExternalLink className="w-3 h-3 text-[#B5AAB1]" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.cdc.gov/cervical-cancer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  CDC Cervical Health & HPV <ExternalLink className="w-3 h-3 text-[#B5AAB1]" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nhs.uk/pregnancy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  NHS UK Pregnancy Guide <ExternalLink className="w-3 h-3 text-[#B5AAB1]" />
                </a>
              </li>
              <li>
                <a
                  href="https://mohfw.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  Ministry of Health (India) <ExternalLink className="w-3 h-3 text-[#B5AAB1]" />
                </a>
              </li>
              <li>
                <a
                  href="https://esanjeevani.mohfw.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  India eSanjeevani Telecare <ExternalLink className="w-3 h-3 text-[#B5AAB1]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Emergency Guidance</h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-200">
                <p className="font-semibold flex items-center gap-1 text-red-300">
                  <PhoneCall className="w-3.5 h-3.5" /> India National Emergency: 112
                </p>
                <p className="text-[11px] mt-1 text-red-200/80">Ambulance: 102 &bull; Women's Helpline: 1091</p>
              </div>
              <p className="text-[11px] text-[#A699A2] leading-snug">
                For severe acute abdominal pain, hemorrhage, or fainting, proceed immediately to hospital emergency casualty.
              </p>
              <Link to="/privacy" className="text-xs text-[#E07E63] hover:underline block pt-1">
                Read Privacy & Safety Protocol &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Medical & Prototype Disclaimer */}
        <div className="pt-6 border-t border-[#382D35] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9B8F97]">
          <div className="flex items-start gap-2 max-w-3xl">
            <Info className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Medical Disclaimer:</strong> HerHealth 360 is an educational health prototype. It does not
              diagnose diseases, provide certified medical records, or replace evaluation by licensed physicians. All doctor profiles
              are fictional demonstrations.
            </p>
          </div>
          <div className="text-[11px] shrink-0">
            Every Stage of Her Health &bull; One Trusted Place &bull; 2026
          </div>
        </div>
      </div>
    </footer>
  );
};
