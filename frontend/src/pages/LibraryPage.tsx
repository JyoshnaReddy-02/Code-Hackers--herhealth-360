import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { HealthResource } from '../types';

export const LibraryPage: React.FC = () => {
  const [resources, setResources] = useState<HealthResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedLifeStage, setSelectedLifeStage] = useState('All');
  const [activeArticle, setActiveArticle] = useState<HealthResource | null>(null);

  const topics = [
    'All',
    'PCOS and PCOD',
    'Endometriosis',
    'Cervical cancer and HPV',
    'Breast health',
    'Pregnancy and antenatal care',
    'Postpartum recovery',
    'Menopause and perimenopause',
    'Nutrition, movement, sleep, and general wellness',
  ];

  const lifeStages = ['All', 'Reproductive', 'Pregnancy & Postpartum', 'Perimenopause & Menopause'];

  useEffect(() => {
    loadResources();
  }, [selectedTopic, selectedLifeStage]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await api.getResources({
        topic: selectedTopic !== 'All' ? selectedTopic : undefined,
        life_stage: selectedLifeStage !== 'All' ? selectedLifeStage : undefined,
        search: search ? search : undefined,
      });
      setResources(res.resources);
    } catch (e) {
      console.error('Failed to load resources', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-xs font-semibold text-[#8C3B5E]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Evidence-Based Healthcare Library</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#261E23] tracking-tight">
          Women’s Health Education & Guidance
        </h1>
        <p className="text-xs sm:text-sm text-[#61575D] max-w-2xl leading-relaxed">
          Curated clinical summaries derived from verified guidelines by the World Health Organization (WHO), NHS UK,
          CDC, and India’s Ministry of Health. Educational, plain-language, and fear-free.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#9B8F97]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by symptom or topic (e.g. cramps, PCOS, screening, breastfeeding)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#D5C7BE] bg-[#FDFBF7] focus:outline-hidden focus:border-[#8C3B5E] focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#8C3B5E] text-white text-xs font-semibold hover:bg-[#722E4B] transition-colors"
          >
            Search Articles
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#F0E6DE] text-xs">
          {/* Life Stage Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#7A7177] font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Stage:
            </span>
            {lifeStages.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedLifeStage(stage)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedLifeStage === stage
                    ? 'bg-[#8C3B5E] text-white'
                    : 'bg-[#F5ECE8] text-[#584F55] hover:bg-[#EAE0DA]'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>

          {/* Topic Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-[#7A7177] font-semibold">Topic:</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#D5C7BE] bg-[#FDFBF7] text-xs text-[#2B232A] focus:outline-hidden focus:border-[#8C3B5E]"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#7A7177]">
          <div className="inline-block w-6 h-6 border-2 border-[#8C3B5E] border-t-transparent rounded-full animate-spin mb-2" />
          <p>Loading curated health resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E8DFD8] space-y-2">
          <BookOpen className="w-8 h-8 text-[#9B8F97] mx-auto" />
          <p className="text-sm font-semibold text-[#2B232A]">No resources found</p>
          <p className="text-xs text-[#6D636B]">Try adjusting your search terms or clearing your filters.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedTopic('All');
              setSelectedLifeStage('All');
            }}
            className="mt-2 px-4 py-2 rounded-lg bg-[#FAF2ED] text-[#8C3B5E] text-xs font-semibold hover:bg-[#F2E5DD]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((article) => (
            <div
              key={article.id}
              className="p-6 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#D5C7BE] transition-all space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F2E8E1] text-[#8C3B5E]">
                    {article.topic}
                  </span>
                  <span className="text-[10px] text-[#8A8187] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {article.last_reviewed}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#261E23] group-hover:text-[#8C3B5E] transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-[#6D636B] leading-relaxed line-clamp-3">{article.summary}</p>
              </div>

              <div className="pt-4 border-t border-[#F0E6DE] flex items-center justify-between">
                <span className="text-[10px] text-[#7A7177] truncate max-w-[150px]">
                  Source: {article.trusted_source}
                </span>
                <button
                  onClick={() => setActiveArticle(article)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FAF2ED] text-[#8C3B5E] text-xs font-semibold hover:bg-[#8C3B5E] hover:text-white transition-colors"
                >
                  Read Guide &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Article Reader Drawer / Modal */}
      {activeArticle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#E8DFD8] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 bg-white border-b border-[#E8DFD8] flex items-start justify-between">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F2E8E1] text-[#8C3B5E]">
                    {activeArticle.topic}
                  </span>
                  <span className="text-[10px] text-[#7A7177]">
                    Life Stage: {activeArticle.life_stage} &bull; Reviewed: {activeArticle.last_reviewed}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#261E23]">{activeArticle.title}</h2>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-xl text-[#7A7177] hover:bg-[#F2E8E1] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#2B232A] leading-relaxed">
              {/* Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C3B5E] mb-1.5">Overview</h4>
                <p className="text-xs sm:text-sm text-[#4D444A] leading-relaxed">{activeArticle.overview}</p>
              </div>

              {/* Signs and Symptoms */}
              {activeArticle.signs_and_symptoms && (
                <div className="p-4 rounded-xl bg-white border border-[#E8DFD8] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B232A] flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#8C3B5E]" /> Commonly Reported Observations:
                  </h4>
                  <div className="text-xs text-[#584F55] whitespace-pre-line leading-relaxed">
                    {activeArticle.signs_and_symptoms}
                  </div>
                </div>
              )}

              {/* When to Seek Care */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" /> When to Seek Professional Care:
                </h4>
                <div className="text-xs text-amber-950 whitespace-pre-line leading-relaxed">
                  {activeArticle.when_to_seek_care}
                </div>
              </div>

              {/* Self-Care & Lifestyle */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Evidence-Based Self-Care Strategies:
                </h4>
                <div className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed">
                  {activeArticle.self_care_info}
                </div>
              </div>

              {/* Common Misconceptions */}
              {activeArticle.common_misconceptions && (
                <div className="p-4 rounded-xl bg-[#F7F2EF] border border-[#E3D7CF] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C3B5E]">
                    Common Misconceptions Debunked:
                  </h4>
                  <div className="text-xs text-[#584F55] whitespace-pre-line leading-relaxed">
                    {activeArticle.common_misconceptions}
                  </div>
                </div>
              )}

              {/* Medical Source Link */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E8DFD8] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#7A7177]">Verified Medical Reference:</span>
                  <p className="text-xs font-bold text-[#2B232A]">{activeArticle.trusted_source}</p>
                </div>
                <a
                  href={activeArticle.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#FAF2ED] text-[#8C3B5E] font-semibold text-xs hover:bg-[#8C3B5E] hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Open Official Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-[#7A7177] italic text-center">
                * {activeArticle.disclaimer} Always consult a licensed clinician for individualized diagnostic testing.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[#E8DFD8] flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-xl bg-[#2B232A] text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
