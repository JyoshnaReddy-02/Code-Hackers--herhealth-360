import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-100 text-[#8C3B5E] flex items-center justify-center mx-auto">
        <Heart className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C86D51]">Page Not Found &bull; 404</span>
        <h1 className="font-serif text-3xl font-bold text-[#261E23]">Looking for a Health Section?</h1>
        <p className="text-xs sm:text-sm text-[#6D636B] leading-relaxed max-w-md mx-auto">
          The page or resource you requested cannot be located. You can navigate back to the home dashboard or explore our
          curated health library.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8C3B5E] text-white text-xs font-semibold hover:bg-[#742E4C] transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/library"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5C7BE] bg-white text-xs font-semibold text-[#2B232A] hover:bg-[#FAF7F5] transition-colors"
        >
          <span>Browse Health Library</span>
        </Link>
      </div>
    </div>
  );
};
