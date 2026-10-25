import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar,
  Clock,
  Video,
  User as UserIcon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  LogOut,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AvailabilitySlot, DoctorAppointmentItem } from '../types';
import { JitsiDemoModal } from '../components/common/JitsiDemoModal';

export const DoctorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { doctor, role, logout } = useAuth();

  const [appointments, setAppointments] = useState<DoctorAppointmentItem[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'appointments' | 'slots'>('appointments');

  // New slot form state
  const [slotDate, setSlotDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slotTime, setSlotTime] = useState<string>('10:00');
  const [submittingSlot, setSubmittingSlot] = useState<boolean>(false);

  // Video Consultation Modal
  const [selectedConsultation, setSelectedConsultation] = useState<{
    roomUrl: string;
    userName: string;
  } | null>(null);

  // Redirect if not authenticated as a doctor
  useEffect(() => {
    if (role !== 'doctor' || !doctor) {
      navigate('/doctors');
    }
  }, [role, doctor, navigate]);

  const loadDoctorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [aptRes, slotRes] = await Promise.all([
        api.getDoctorAppointments(),
        api.getDoctorPortalSlots(),
      ]);
      setAppointments(aptRes.appointments || []);
      setSlots(slotRes.slots || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctor) {
      loadDoctorData();
    }
  }, [doctor]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDate || !slotTime) {
      setError('Please select both a date and time.');
      return;
    }

    setSubmittingSlot(true);
    setError(null);
    setSuccessMsg(null);

    const startDateTimeStr = `${slotDate}T${slotTime}:00`;

    try {
      const res = await api.addDoctorSlot({ start_time: startDateTimeStr });
      setSuccessMsg(res.message || 'Availability slot successfully added.');
      // Refresh slots
      const slotRes = await api.getDoctorPortalSlots();
      setSlots(slotRes.slots || []);
    } catch (err: any) {
      setError(err.message || 'Failed to create availability slot.');
    } finally {
      setSubmittingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.deleteDoctorSlot(slotId);
      setSuccessMsg(res.message || 'Slot deleted.');
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete slot.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!doctor) {
    return null;
  }

  const bookedAppointmentsCount = appointments.filter((a) => a.status === 'booked').length;
  const openSlotsCount = slots.filter((s) => !s.is_booked).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Clinician Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#2B232A] via-[#382D35] to-[#2B232A] text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5 text-[#E07E63]" />
              <span>Clinician Portal & Consultation Manager</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {doctor.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#D5C7CE] max-w-2xl leading-relaxed">
              {doctor.specialty} &bull; <span className="text-[#E07E63]">{doctor.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadDoctorData}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-700/50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-[#A699A2] block">Booked User Consultations</span>
            <span className="text-2xl font-bold text-white">{bookedAppointmentsCount}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-[#A699A2] block">Open Available Slots</span>
            <span className="text-2xl font-bold text-emerald-400">{openSlotsCount}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-[#A699A2] block">Account Status</span>
            <span className="text-sm font-semibold text-rose-300 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Active Clinician Profile
            </span>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
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

      {/* Tab Controls */}
      <div className="flex border-b border-[#E8DFD8] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-3 px-6 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'border-[#8C3B5E] text-[#8C3B5E] font-bold'
              : 'border-transparent text-[#7A7177] hover:text-[#2B232A]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scheduled User Appointments ({bookedAppointmentsCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`py-3 px-6 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'slots'
              ? 'border-[#8C3B5E] text-[#8C3B5E] font-bold'
              : 'border-transparent text-[#7A7177] hover:text-[#2B232A]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Manage Available Slots ({slots.length})</span>
        </button>
      </div>

      {/* TAB 1: Scheduled User Consultations */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#261E23]">
                Upcoming User Consultations
              </h2>
              <p className="text-xs text-[#61575D]">
                Review booked user requests, health consultation notes, and launch teleconsultation rooms.
              </p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E8DFD8] space-y-3">
              <Calendar className="w-10 h-10 text-[#C86D51] mx-auto opacity-40" />
              <h3 className="font-serif text-base font-bold text-[#261E23]">No Consultations Scheduled</h3>
              <p className="text-xs text-[#7A7177] max-w-md mx-auto">
                Users who book your available slots will appear here with their notes and direct video consultation access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((apt) => {
                const dateObj = new Date(apt.appointment_time);
                return (
                  <div
                    key={apt.id}
                    className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8C3B5E]/40 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-[#8C3B5E] font-bold text-xs">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-serif text-sm font-bold text-[#2B232A]">
                              User: {apt.user_name}
                            </h4>
                            <p className="text-[11px] text-[#7A7177]">{apt.user_email}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            apt.status === 'booked'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#F0E6DE] text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[#584F55]">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-[#C86D51]" />
                            {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8C3B5E]">
                            <Clock className="w-3.5 h-3.5" />
                            {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {apt.user_life_stage && (
                          <p className="text-[11px] text-[#7A7177]">
                            <strong>Life Stage:</strong> {apt.user_life_stage}
                          </p>
                        )}
                      </div>

                      {apt.notes && (
                        <div className="text-xs text-[#584F55] bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                          <span className="font-semibold text-amber-900 block mb-1 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> User Notes / Symptoms:
                          </span>
                          <p className="italic text-[11px] text-amber-950 leading-relaxed">{apt.notes}</p>
                        </div>
                      )}
                    </div>

                    {apt.status === 'booked' && apt.jitsi_room_url && (
                      <button
                        onClick={() =>
                          setSelectedConsultation({
                            roomUrl: apt.jitsi_room_url!,
                            userName: apt.user_name,
                          })
                        }
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-95 shadow-xs transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>Launch Video Consultation Room</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Manage Available Slots */}
      {activeTab === 'slots' && (
        <div className="space-y-8">
          {/* Add Slot Panel */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 text-[#8C3B5E]">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#261E23]">
                  Open a New Consultation Slot
                </h3>
                <p className="text-xs text-[#61575D]">
                  Choose date and start time. The slot will instantly become available for users to book.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#584F55] mb-1">Slot Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-[#9B8F97]" />
                  <input
                    type="date"
                    required
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#584F55] mb-1">Start Time</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-2.5 text-[#9B8F97]" />
                  <input
                    type="time"
                    required
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E]"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={submittingSlot}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submittingSlot ? 'Adding Slot...' : 'Add Available Slot'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Slots List */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#261E23]">
              Your Scheduled Slots ({slots.length})
            </h3>

            {slots.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#E8DFD8]">
                <Clock className="w-8 h-8 text-[#C86D51] mx-auto opacity-40 mb-2" />
                <p className="text-xs text-[#7A7177]">You have no upcoming availability slots configured.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {slots.map((s) => {
                  const sTime = new Date(s.start_time);
                  const eTime = new Date(s.end_time);
                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        s.is_booked
                          ? 'bg-purple-50/60 border-purple-200'
                          : 'bg-white border-[#E8DFD8] hover:border-[#8C3B5E]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2B232A]">
                          <Calendar className="w-3.5 h-3.5 text-[#C86D51]" />
                          <span>{sTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                        </div>
                        <div className="text-[11px] text-[#7A7177] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {sTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &ndash;{' '}
                            {eTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {s.is_booked ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-[10px] font-bold text-purple-800">
                            <UserIcon className="w-3 h-3" />
                            <span>Booked by User: {s.booked_by_user?.user_name || 'Booked'}</span>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-[10px] font-bold text-emerald-800">
                            Available for Users
                          </span>
                        )}
                      </div>

                      {!s.is_booked && (
                        <button
                          onClick={() => handleDeleteSlot(s.id)}
                          title="Delete unbooked slot"
                          className="p-2 rounded-xl text-[#8A8187] hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Consultation Modal */}
      {selectedConsultation && (
        <JitsiDemoModal
          isOpen={true}
          onClose={() => setSelectedConsultation(null)}
          roomUrl={selectedConsultation.roomUrl}
          doctorName={doctor.name}
          specialty={`Consultation with User: ${selectedConsultation.userName}`}
        />
      )}
    </div>
  );
};
