import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  AlertCircle,
  Calendar,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AnalyticsResponse } from '../types';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = [
  '#8C3B5E', // Muted rose
  '#C86D51', // Coral
  '#5C8276', // Sage green
  '#9B6B9E', // Lavender
  '#D99B62', // Warm amber
  '#4A6B82', // Dusty blue
  '#B85B5B', // Crimson
  '#7A825C', // Olive
  '#825C76', // Plum
];

export const AnalyticsPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getSymptomAnalytics();
      setData(res);
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-[#8C3B5E] flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#261E23]">Interactive Health Analytics</h2>
          <p className="text-xs sm:text-sm text-[#6D636B] max-w-lg mx-auto leading-relaxed">
            Please log in to view interactive Recharts visualizations generated from your authorized symptom diary.
          </p>
        </div>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-[#8C3B5E] text-white text-xs font-semibold hover:bg-[#722E4B]"
        >
          Sign In to View Analytics
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-xs font-semibold text-[#8C3B5E]">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Authorized User Observation Trends</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#261E23]">Interactive Health Analytics</h1>
        <p className="text-xs sm:text-sm text-[#61575D] max-w-3xl leading-relaxed">
          Visualizations generated dynamically from your authorized health records. Examine trends over
          time to better prepare for real healthcare discussions.
        </p>
      </div>

      {/* Mandatory Non-Diagnostic Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Medical Transparency Notice:</p>
          <p className="text-[11px] leading-relaxed text-amber-950">
            {data?.disclaimer ||
              'These charts show patterns in the information you recorded. They do not diagnose a condition, replace lab tests, or establish medical causation.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-[#7A7177]">
          <div className="inline-block w-6 h-6 border-2 border-[#8C3B5E] border-t-transparent rounded-full animate-spin mb-2" />
          <p>Calculating trend analytics from your records...</p>
        </div>
      ) : !data || data.total_entries === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white border border-[#E8DFD8] space-y-3">
          <Activity className="w-10 h-10 text-[#B5AAB1] mx-auto" />
          <h3 className="text-base font-bold text-[#2B232A]">No observations recorded yet</h3>
          <p className="text-xs text-[#6D636B] max-w-sm mx-auto">
            Once you log symptoms in the tracker, your severity timelines, frequency curves, and category breakdowns will
            appear here.
          </p>
          <Link
            to="/tracker"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#8C3B5E] text-white text-xs font-semibold"
          >
            Go to Symptom Tracker
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs">
              <span className="text-xs text-[#7A7177] font-semibold uppercase tracking-wider">Total Recorded</span>
              <p className="text-2xl font-bold font-serif text-[#2B232A] mt-1">{data.total_entries} entries</p>
              <span className="text-[10px] text-[#8C3B5E] mt-1 block">Chronological observations</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs">
              <span className="text-xs text-[#7A7177] font-semibold uppercase tracking-wider">Average Severity</span>
              <p className="text-2xl font-bold font-serif text-[#2B232A] mt-1">{data.average_severity} / 10</p>
              <span className="text-[10px] text-amber-700 mt-1 block">Mean self-reported rating</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs">
              <span className="text-xs text-[#7A7177] font-semibold uppercase tracking-wider">Peak Severity</span>
              <p className="text-2xl font-bold font-serif text-[#2B232A] mt-1">{data.peak_severity} / 10</p>
              <span className="text-[10px] text-rose-700 mt-1 block">Highest observation recorded</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs">
              <span className="text-xs text-[#7A7177] font-semibold uppercase tracking-wider">Top Category</span>
              <p className="text-2xl font-bold font-serif text-[#2B232A] mt-1 truncate">
                {data.category_distribution[0]?.category || 'N/A'}
              </p>
              <span className="text-[10px] text-teal-700 mt-1 block">
                {data.category_distribution[0]?.percentage}% of all entries
              </span>
            </div>
          </div>

          {/* Charts Row 1: Severity Timeline (Chart A) */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B232A] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#8C3B5E]" /> Chart A: Symptom Severity Timeline
                </h3>
                <p className="text-xs text-[#7A7177]">
                  Track how self-reported severity fluctuated across recorded observations over time.
                </p>
              </div>
              <span className="text-[11px] text-[#8C3B5E] font-semibold bg-[#FAF2ED] px-3 py-1 rounded-full">
                1 (Mild) to 10 (Severe)
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sevGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8C3B5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8C3B5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E6DE" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7A7177' }} />
                  <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11, fill: '#7A7177' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E8DFD8',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                    formatter={(val: any, _name: any, item: any) => [
                      `${val}/10 (Duration: ${item.payload.duration}h)`,
                      `${item.payload.symptom} (${item.payload.category})`,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="severity"
                    name="Severity"
                    stroke="#8C3B5E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sevGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2: Frequency & Category Distribution (Chart B & C) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart B: Frequency by Date */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B232A] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#C86D51]" /> Chart B: Observation Frequency
                </h3>
                <p className="text-xs text-[#7A7177]">Number of symptom entries recorded per logging day.</p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.frequency_by_date} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E6DE" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7A7177' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#7A7177' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E8DFD8',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Entries" fill="#C86D51" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart C: Category Distribution */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B232A] flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-teal-700" /> Chart C: Category Breakdown
                </h3>
                <p className="text-xs text-[#7A7177]">Proportion of observations by anatomical/symptom domain.</p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.category_distribution}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {data.category_distribution.map((entry, index) => (
                        <Cell key={`cell-${entry.category}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E8DFD8',
                        fontSize: '11px',
                      }}
                      formatter={(val: any, _name: any, item: any) => [`${val} entries (${item.payload.percentage}%)`, item.payload.category]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart D: Wellness Context Correlation */}
          {data.wellness_correlation.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B232A] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-700" /> Chart D: Wellness Context & Symptom Severity
                </h3>
                <p className="text-xs text-[#7A7177]">
                  Self-reported sleep quality (1–5) and fatigue levels (1–5) graphed alongside symptom severity.
                </p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.wellness_correlation} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E6DE" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7A7177' }} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 10, fill: '#7A7177' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E8DFD8',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      type="monotone"
                      dataKey="severity"
                      name="Severity (1-10)"
                      stroke="#8C3B5E"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fatigue_level"
                      name="Fatigue (1-5)"
                      stroke="#D99B62"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sleep_quality"
                      name="Sleep Quality (1-5)"
                      stroke="#5C8276"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
