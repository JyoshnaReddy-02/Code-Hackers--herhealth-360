import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SymptomEntry, Appointment } from '../types';

export const PassportPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPreviewData();
    }
  }, [user, dateRange]);

  const getDateFilterParams = () => {
    if (dateRange === 'all') return {};
    const now = new Date();
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      start_date: start.toISOString(),
    };
  };

  const loadPreviewData = async () => {
    setLoading(true);
    try {
      const { start_date } = getDateFilterParams();
      const [symRes, aptRes] = await Promise.all([
        api.getSymptoms({ start_date }),
        api.getAppointments(),
      ]);
      setSymptoms(symRes.symptoms);
      setAppointments(aptRes.appointments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const { start_date } = getDateFilterParams();
      const blob = await api.downloadHealthPassport(start_date);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HerHealth360_Personal_Health_Passport_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setDownloadError(err.message || 'Failed to download Personal Health Passport PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-[#8C3B5E] flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#261E23]">Personal Health Passport PDF</h2>
          <p className="text-xs sm:text-sm text-[#6D636B] max-w-lg mx-auto leading-relaxed">
            Please log in to export your personalized clinical summary PDF.
          </p>
        </div>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-[#8C3B5E] text-white text-xs font-semibold hover:bg-[#722E4B]"
        >
          Sign In to Generate Passport
        </button>
      </div>
    );
  }

  const severities = symptoms.map((s) => s.severity).filter((v) => typeof v === 'number');
  const avgSev = severities.length > 0 ? (severities.reduce((a, b) => a + b, 0) / severities.length).toFixed(1) : '0.0';
  const maxSev = severities.length > 0 ? Math.max(...severities) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-xs font-semibold text-[#8C3B5E] mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Personalized Clinical Summary &bull; Downloadable PDF</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#261E23]">Personal Health Passport</h1>
          <p className="text-xs sm:text-sm text-[#61575D] max-w-2xl leading-relaxed mt-1">
            Organize your self-reported symptom patterns, cycle observations, and doctor appointments into an easily
            readable PDF to print or share during real clinical consultations.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white text-xs font-bold hover:opacity-95 shadow-md transition-transform active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Compiling PDF...' : 'Download Passport PDF'}</span>
        </button>
      </div>

      {downloadError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* Mandatory Scope Notice */}
      <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#E8DFD8] flex items-start gap-3 text-xs text-[#584F55]">
        <ShieldAlert className="w-5 h-5 text-[#8C3B5E] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#2B232A]">Clinical Disclaimer:</p>
          <p className="text-[11px] leading-relaxed text-[#6D636B]">
            This document contains self-reported observations from an educational prototype. It is{' '}
            <strong>not a certified medical record, lab diagnostic report, or doctor’s prescription</strong>. Always share this
            as contextual user-reported notes with a licensed healthcare professional.
          </p>
        </div>
      </div>

      {/* Date Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#584F55] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date Range Filter:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Recorded Time' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: '90days', label: 'Last 90 Days' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDateRange(f.id as any)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  dateRange === f.id
                    ? 'bg-[#8C3B5E] text-white font-semibold'
                    : 'bg-[#FAF2ED] text-[#584F55] hover:bg-[#F2E5DD]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-[#7A7177]">
          Includes <strong>{symptoms.length}</strong> symptom entries and <strong>{appointments.length}</strong>{' '}
          appointments
        </div>
      </div>

      {/* Interactive PDF Document Preview */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#E8DFD8] shadow-lg space-y-8 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="pb-6 border-b-2 border-[#8C3B5E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[#8C3B5E]">HerHealth 360</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF2ED] text-[#8C3B5E]">
                Personal Health Passport
              </span>
            </div>
            <p className="text-xs text-[#C86D51] italic mt-0.5">Every stage of her health. One trusted place.</p>
          </div>

          <div className="text-right text-[11px] text-[#7A7177] space-y-0.5">
            <p>
              Generated: <strong>{new Date().toLocaleDateString()}</strong>
            </p>
            <p>
              Scope: <strong>{dateRange === 'all' ? 'Complete History' : dateRange}</strong>
            </p>
            <p className="text-[#8C3B5E] font-medium">Personal Health Summary</p>
          </div>
        </div>

        {/* Section 1: User Profile */}
        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-[#8C3B5E] flex items-center gap-2">
            <UserIcon className="w-4 h-4" /> 1. User / Member Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FAF8F6] border border-[#F0E6DE] text-xs">
            <div>
              <span className="text-[11px] text-[#7A7177] block">Name</span>
              <strong className="text-[#2B232A]">{user.display_name}</strong>
            </div>
            <div>
              <span className="text-[11px] text-[#7A7177] block">Email</span>
              <strong className="text-[#2B232A] truncate block">{user.email}</strong>
            </div>
            <div>
              <span className="text-[11px] text-[#7A7177] block">Life Stage</span>
              <strong className="text-[#2B232A] capitalize">
                {user.life_stage ? user.life_stage.replace('_', ' ') : 'Reproductive'}
              </strong>
            </div>
            <div>
              <span className="text-[11px] text-[#7A7177] block">Date of Birth</span>
              <strong className="text-[#2B232A]">{user.date_of_birth || 'Not specified'}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Summary Stats */}
        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-[#8C3B5E] flex items-center gap-2">
            <Activity className="w-4 h-4" /> 2. Observation Statistics Summary
          </h3>
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FAF8F6] border border-[#F0E6DE] text-xs text-center">
            <div>
              <span className="text-[11px] text-[#7A7177]">Total Recorded</span>
              <p className="text-xl font-bold font-serif text-[#2B232A] mt-0.5">{symptoms.length}</p>
            </div>
            <div>
              <span className="text-[11px] text-[#7A7177]">Average Severity</span>
              <p className="text-xl font-bold font-serif text-[#8C3B5E] mt-0.5">{avgSev} / 10</p>
            </div>
            <div>
              <span className="text-[11px] text-[#7A7177]">Peak Severity</span>
              <p className="text-xl font-bold font-serif text-rose-700 mt-0.5">{maxSev} / 10</p>
            </div>
          </div>
        </div>

        {/* Section 3: Detailed Entries Table */}
        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-[#8C3B5E] flex items-center gap-2">
            <Clock className="w-4 h-4" /> 3. Recorded Symptom Observations
          </h3>

          {symptoms.length === 0 ? (
            <p className="text-xs text-[#7A7177] italic p-4 bg-[#FAF8F6] rounded-xl text-center">
              No symptoms recorded within the selected date window.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#E8DFD8]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#8C3B5E] text-white">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Symptom</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Sev.</th>
                    <th className="py-2.5 px-3 font-semibold">Duration</th>
                    <th className="py-2.5 px-3 font-semibold">Notes / Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6DE] text-[#2B232A]">
                  {symptoms.slice(0, 15).map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF8F6]">
                      <td className="py-2 px-3 whitespace-nowrap text-[11px]">{new Date(s.recorded_at).toLocaleDateString()}</td>
                      <td className="py-2 px-3 text-[11px]">{s.category}</td>
                      <td className="py-2 px-3 font-medium">{s.symptom_name}</td>
                      <td className="py-2 px-3 text-center font-bold text-[#8C3B5E]">{s.severity}/10</td>
                      <td className="py-2 px-3 text-[11px]">{s.duration_hours ? `${s.duration_hours}h` : '—'}</td>
                      <td className="py-2 px-3 text-[11px] text-[#6D636B] truncate max-w-xs">{s.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 4: Demo Consultations */}
        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-[#8C3B5E] flex items-center gap-2">
            <Calendar className="w-4 h-4" /> 4. Scheduled Consultations History
          </h3>
          {appointments.length === 0 ? (
            <p className="text-xs text-[#7A7177] italic p-4 bg-[#FAF8F6] rounded-xl text-center">
              No appointments on record.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#E8DFD8]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#C86D51] text-white">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Clinician (Fictional Demo)</th>
                    <th className="py-2 px-3">Specialty</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6DE]">
                  {appointments.slice(0, 5).map((a) => (
                    <tr key={a.id}>
                      <td className="py-2 px-3 text-[11px]">{new Date(a.appointment_time).toLocaleDateString()}</td>
                      <td className="py-2 px-3 font-medium">{a.doctor_name}</td>
                      <td className="py-2 px-3 text-[11px] text-[#7A7177]">{a.doctor_specialty}</td>
                      <td className="py-2 px-3 uppercase text-[10px] font-bold text-emerald-800">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PDF Download Action Bar */}
        <div className="pt-6 border-t border-[#E8DFD8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-[#7A7177] italic">
            * Formatted for clinical consultations &bull; Download as vector PDF
          </span>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white text-xs font-bold hover:opacity-95 shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating PDF...' : 'Download Full PDF Document'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
