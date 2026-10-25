import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  LogOut,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  AdminOverviewResponse,
  AdminUserProblemsResponse,
  AdminDoctorQuestionsResponse,
} from '../types';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, admin, logout } = useAuth();

  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [problems, setProblems] = useState<AdminUserProblemsResponse | null>(null);
  const [doctorQuestions, setDoctorQuestions] = useState<AdminDoctorQuestionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'problems' | 'questions'>('problems');

  useEffect(() => {
    if (role !== 'admin' || !admin) {
      navigate('/admin/login');
    }
  }, [role, admin, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, probRes, qRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUserProblems(),
        api.getAdminDoctorQuestions(),
      ]);
      setOverview(ovRes);
      setProblems(probRes);
      setDoctorQuestions(qRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      loadAdminData();
    }
  }, [admin]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!admin) return null;

  const COLORS = ['#8C3B5E', '#C86D51', '#5C8276', '#D9822B', '#5A6F80', '#A0522D'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1E181D] via-[#2D2329] to-[#1E181D] text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Administrator Command & Insights Hub</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              HerHealth 360 Platform Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#D5C7CE] max-w-2xl leading-relaxed">
              Super Admin: {admin.email} &bull; Full-stack system monitoring, health trend analytics & wellness resources
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-700/50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Top KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-purple-300 text-xs mb-1">
              <Users className="w-4 h-4" />
              <span>Total Registered Users</span>
            </div>
            <span className="text-3xl font-bold text-white">
              {overview?.metrics.total_users ?? '—'}
            </span>
            <p className="text-[10px] text-[#A699A2] mt-1">Active platform members</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-rose-300 text-xs mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Total Doctors</span>
            </div>
            <span className="text-3xl font-bold text-rose-400">
              {overview?.metrics.total_doctors ?? '—'}
            </span>
            <p className="text-[10px] text-[#A699A2] mt-1">Verified specialist profiles</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-amber-300 text-xs mb-1">
              <Calendar className="w-4 h-4" />
              <span>Consultations</span>
            </div>
            <span className="text-3xl font-bold text-amber-400">
              {overview?.metrics.total_appointments ?? '—'}
            </span>
            <p className="text-[10px] text-[#A699A2] mt-1">Booked & completed sessions</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs mb-1">
              <Activity className="w-4 h-4" />
              <span>Symptoms Logged</span>
            </div>
            <span className="text-3xl font-bold text-emerald-400">
              {overview?.metrics.total_symptoms_logged ?? '—'}
            </span>
            <p className="text-[10px] text-[#A699A2] mt-1">User symptom diary entries</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Tab Controls */}
      <div className="flex border-b border-[#E8DFD8] text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('problems')}
          className={`py-3 px-5 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'problems'
              ? 'border-[#8C3B5E] text-[#8C3B5E] font-bold'
              : 'border-transparent text-[#7A7177] hover:text-[#2B232A]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Main Problems Users Are Facing</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`py-3 px-5 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'questions'
              ? 'border-[#8C3B5E] text-[#8C3B5E] font-bold'
              : 'border-transparent text-[#7A7177] hover:text-[#2B232A]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Questions Doctors Are Getting</span>
        </button>
      </div>

      {/* SECTION 1: MAIN PROBLEMS USERS ARE FACING */}
      {activeTab === 'problems' && problems && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#261E23]">
              User Health Challenges & Symptom Analytics
            </h2>
            <p className="text-xs text-[#61575D]">
              Aggregated insights from user health logs showing most prevalent symptoms, severity distributions, and category breakdowns.
            </p>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Categories Bar Chart */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-[#261E23] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#8C3B5E]" /> Most Prevalent Problem Categories
                </h3>
                <span className="text-[11px] text-[#7A7177]">{problems.total_observations} total observations</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={problems.category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 10, fill: '#7A7177' }}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#7A7177' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FAF8F6', borderRadius: '12px', border: '1px solid #E8DFD8', fontSize: '11px' }}
                      formatter={(value: any) => [`${value} reports`, 'Count']}
                    />
                    <Bar dataKey="count" fill="#8C3B5E" radius={[6, 6, 0, 0]}>
                      {problems.category_distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Severity Distribution Donut Chart */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4 flex flex-col justify-between">
              <h3 className="font-serif text-base font-bold text-[#261E23] flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#C86D51]" /> Symptom Severity Distribution
              </h3>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={problems.severity_distribution}
                      dataKey="count"
                      nameKey="tier"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {problems.severity_distribution.map((entry, index) => (
                        <Cell key={`sev-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FAF8F6', borderRadius: '12px', border: '1px solid #E8DFD8', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0E6DE] text-center">
                {problems.severity_distribution.map((item) => (
                  <div key={item.tier} className="p-2 rounded-xl bg-[#FAF8F6]">
                    <span className="text-[10px] text-[#7A7177] block">{item.tier}</span>
                    <strong className="text-xs font-bold text-[#2B232A]">{item.percentage}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 10 Reported Specific Symptoms Table */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#261E23] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#8C3B5E]" /> Top 10 Specific Health Symptoms Reported by Users
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8DFD8] text-[#7A7177]">
                    <th className="py-2.5 px-3 font-semibold">Symptom</th>
                    <th className="py-2.5 px-3 font-semibold">Health Category</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Report Count</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Average Severity (1-10)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Peak Reported Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EAE4]">
                  {problems.top_symptoms.map((s, idx) => (
                    <tr key={s.symptom} className="hover:bg-[#FAF8F6]">
                      <td className="py-2.5 px-3 font-bold text-[#2B232A] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-[#8C3B5E] text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{s.symptom}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[#584F55]">{s.category}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-[#8C3B5E]">{s.report_count}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                          {s.avg_severity} / 10
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-rose-700 font-bold">{s.max_severity} / 10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: QUESTIONS DOCTORS ARE GETTING */}
      {activeTab === 'questions' && doctorQuestions && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#261E23]">
              Consultation Inquiries & Clinical Questions Received by Doctors
            </h2>
            <p className="text-xs text-[#61575D]">
              Visualization of consultation inquiry themes submitted by users when booking specialist appointments.
            </p>
          </div>

          {/* Theme Breakdown Visual Bar Chart */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#261E23] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#8C3B5E]" /> Most Frequent Clinical Question Categories
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doctorQuestions.theme_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis
                    dataKey="theme"
                    tick={{ fontSize: 10, fill: '#7A7177' }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#7A7177' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF8F6', borderRadius: '12px', border: '1px solid #E8DFD8', fontSize: '11px' }}
                    formatter={(val: any) => [`${val} consultations`, 'Volume']}
                  />
                  <Bar dataKey="count" fill="#C86D51" radius={[6, 6, 0, 0]}>
                    {doctorQuestions.theme_distribution.map((_, index) => (
                      <Cell key={`theme-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Consultation Questions Table */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#261E23] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#C86D51]" /> Detailed Consultation Inquiries Submitted by Users
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8DFD8] text-[#7A7177]">
                    <th className="py-2.5 px-3 font-semibold">User</th>
                    <th className="py-2.5 px-3 font-semibold">Consulting Doctor</th>
                    <th className="py-2.5 px-3 font-semibold">Inquiry Theme</th>
                    <th className="py-2.5 px-3 font-semibold">User Notes & Question Details</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EAE4]">
                  {doctorQuestions.recent_inquiries.map((inq) => (
                    <tr key={inq.appointment_id} className="hover:bg-[#FAF8F6]">
                      <td className="py-3 px-3 font-bold text-[#2B232A]">
                        {inq.user_name}
                        <span className="block text-[10px] font-normal text-[#7A7177] capitalize">
                          {inq.user_life_stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#8C3B5E] block">{inq.doctor_name}</span>
                        <span className="text-[10px] text-[#7A7177]">{inq.doctor_specialty}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-[#8C3B5E]">
                          {inq.theme}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#584F55] max-w-xs">
                        <p className="line-clamp-2 italic text-[11px] text-[#2B232A]">
                          "{inq.user_notes}"
                        </p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {inq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

