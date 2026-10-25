import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  Video,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Doctor, AvailabilitySlot, Appointment } from '../types';
import { JitsiDemoModal } from '../components/common/JitsiDemoModal';

export const DoctorsPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'directory' | 'my_appointments'>('directory');

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [appointmentType, setAppointmentType] = useState<'video' | 'in_person'>('video');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Reschedule Modal
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<AvailabilitySlot[]>([]);
  const [newSlotId, setNewSlotId] = useState<number | null>(null);

  // Video Consultation Demo Modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoConsultationData, setVideoConsultationData] = useState<{
    roomUrl: string;
    doctorName: string;
    specialty: string;
  } | null>(null);

  // Cancel Consultation Modal
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [cancellingLoading, setCancellingLoading] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);
  const [cancelErrorMsg, setCancelErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDoctors();
    if (user) {
      loadMyAppointments();
    }
  }, [user, selectedSpecialty]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.getDoctors(selectedSpecialty !== 'All' ? selectedSpecialty : undefined);
      setDoctors(res.doctors);
    } catch (e) {
      console.error('Failed to load doctors', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMyAppointments = async () => {
    try {
      const res = await api.getAppointments();
      setMyAppointments(res.appointments);
    } catch (e) {
      console.error('Failed to load appointments', e);
    }
  };

  const handleOpenBooking = async (doctor: Doctor) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setSelectedDoctor(doctor);
    setSelectedSlotId(null);
    setNotes('');
    setBookingError(null);
    setBookingSuccess(null);
    try {
      const res = await api.getDoctorSlots(doctor.id);
      setAvailableSlots(res.slots);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setBookingError('Please choose an available appointment time slot.');
      return;
    }
    setBookingLoading(true);
    setBookingError(null);

    try {
      await api.bookAppointment({
        slot_id: selectedSlotId,
        appointment_type: appointmentType,
        notes: notes.trim() || undefined,
      });
      setBookingSuccess('Appointment confirmed successfully!');
      loadMyAppointments();
      setTimeout(() => {
        setSelectedDoctor(null);
        setActiveTab('my_appointments');
      }, 1500);
    } catch (err: any) {
      if (err.data?.conflict) {
        setBookingError('This time slot was just booked by another user. Please choose another slot.');
        // Refresh slots
        if (selectedDoctor) {
          const res = await api.getDoctorSlots(selectedDoctor.id);
          setAvailableSlots(res.slots);
        }
      } else {
        setBookingError(err.message || 'Failed to book appointment.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;
    setCancellingLoading(true);
    setCancelErrorMsg(null);
    try {
      await api.cancelAppointment(appointmentToCancel.id);
      setMyAppointments((prev) =>
        prev.map((a) => (a.id === appointmentToCancel.id ? { ...a, status: 'cancelled' } : a))
      );
      setCancelSuccessMsg(
        `Consultation #${appointmentToCancel.id} with ${appointmentToCancel.doctor_name} was successfully cancelled. The time slot has been released.`
      );
      setAppointmentToCancel(null);
      loadMyAppointments();
      loadDoctors();
    } catch (err: any) {
      setCancelErrorMsg(err.message || 'Failed to cancel appointment. Please try again.');
    } finally {
      setCancellingLoading(false);
    }
  };

  const handleOpenReschedule = async (apt: Appointment) => {
    setRescheduleAppointment(apt);
    setNewSlotId(null);
    try {
      const res = await api.getDoctorSlots(apt.doctor_id);
      setRescheduleSlots(res.slots.filter((s) => s.id !== apt.slot_id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleAppointment || !newSlotId) return;
    try {
      await api.rescheduleAppointment(rescheduleAppointment.id, newSlotId);
      setRescheduleAppointment(null);
      loadMyAppointments();
      loadDoctors();
    } catch (err: any) {
      alert(`Rescheduling failed: ${err.message}`);
    }
  };

  const handleLaunchVideoDemo = (apt: Appointment) => {
    const roomName = `HerHealth360-Demo-Apt${apt.id}`;
    setVideoConsultationData({
      roomUrl: `https://meet.jit.si/${roomName}`,
      doctorName: apt.doctor_name,
      specialty: apt.doctor_specialty,
    });
    setVideoModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-xs font-semibold text-[#8C3B5E]">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Fictional Demonstration Clinicians</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#261E23]">Doctor Directory & Consultations</h1>
        <p className="text-xs sm:text-sm text-[#61575D] max-w-2xl leading-relaxed">
          Book educational consultations with demonstration specialist profiles. Features atomic conflict prevention and a
          public Jitsi video consultation demonstration.
        </p>
      </div>

      {/* Mandatory Demo Disclosure Alert */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Important Fictional Profile Notice:</p>
          <p className="text-[11px] leading-relaxed text-amber-950">
            All practitioners listed on this platform are <strong>fictional demonstration profiles</strong>. They do not represent real physicians, licenses, or hospital
            affiliations.
          </p>
        </div>
      </div>

      {cancelSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{cancelSuccessMsg}</span>
          </div>
          <button
            onClick={() => setCancelSuccessMsg(null)}
            className="p-1 rounded-md text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E8DFD8] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('directory')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'border-[#8C3B5E] text-[#8C3B5E] font-bold'
              : 'border-transparent text-[#7A7177] hover:text-[#2B232A]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Clinician Directory & Booking</span>
        </button>

        <button
          onClick={() => {
            if (!user) openAuthModal('login');
            else setActiveTab('my_appointments');
          }}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'my_appointments'
              ? 'border-[#8C3B5E] text-[#8C3B5E] font-bold'
              : 'border-transparent text-[#7A7177] hover:text-[#2B232A]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Consultations {myAppointments.length > 0 && `(${myAppointments.length})`}</span>
        </button>
      </div>

      {/* TAB 1: CLINICIAN DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Specialty Dropdown Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs">
            <label htmlFor="specialty-dropdown" className="text-[#584F55] font-semibold flex items-center gap-1.5 shrink-0">
              <Filter className="w-4 h-4 text-[#8C3B5E]" />
              <span>Specialty / Focus Area:</span>
            </label>
            <div className="relative w-full sm:w-80">
              <select
                id="specialty-dropdown"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-[#D5C7BE] bg-white text-xs font-medium text-[#2B232A] shadow-xs focus:outline-hidden focus:border-[#8C3B5E] focus:ring-1 focus:ring-[#8C3B5E] cursor-pointer hover:border-[#8C3B5E] transition-colors"
              >
                <option value="All">All Focus Areas</option>
                <option value="PCOS and PCOD">PCOS and PCOD</option>
                <option value="Endometriosis">Endometriosis</option>
                <option value="Cervical cancer and HPV">Cervical cancer and HPV</option>
                <option value="Breast health">Breast health</option>
                <option value="Pregnancy and antenatal care">Pregnancy and antenatal care</option>
                <option value="Postpartum recovery">Postpartum recovery</option>
                <option value="Menopause and perimenopause">Menopause and perimenopause</option>
                <option value="Nutrition, movement, sleep, and general wellness">Nutrition, movement, sleep, and general wellness</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-[#7A7177] pointer-events-none" />
            </div>
          </div>

          {/* Clinicians Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs text-[#7A7177]">
              <div className="inline-block w-6 h-6 border-2 border-[#8C3B5E] border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading clinician profiles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-6 rounded-3xl bg-white border border-[#E8DFD8] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Fictional Demo Profile
                      </span>
                      <span className="text-[11px] text-[#5C8276] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Available Slots
                      </span>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FAF2ED] to-[#F2E5DD] border border-[#E8DFD8] flex items-center justify-center text-xl font-bold font-serif text-[#8C3B5E]">
                      {doc.name.replace('Dr ', '').charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#261E23]">{doc.name}</h3>
                      <p className="text-xs font-semibold text-[#8C3B5E] mt-0.5">{doc.specialty}</p>
                    </div>

                    <p className="text-xs text-[#6D636B] leading-relaxed line-clamp-3">{doc.bio}</p>
                  </div>

                  <div className="pt-4 border-t border-[#F0E6DE] flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-[#7A7177]">
                      <Video className="w-3.5 h-3.5 text-purple-600" />
                      <span>Video & In-Person Demo</span>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(doc)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white text-xs font-semibold hover:opacity-95 shadow-xs transition-opacity"
                    >
                      Book Slot &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPOINTMENTS */}
      {activeTab === 'my_appointments' && (
        <div className="space-y-4">
          {myAppointments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#E8DFD8] space-y-3">
              <Calendar className="w-10 h-10 text-[#B5AAB1] mx-auto" />
              <h3 className="text-base font-bold text-[#2B232A]">No appointments booked yet</h3>
              <p className="text-xs text-[#6D636B] max-w-sm mx-auto">
                Select a fictional demonstration clinician above to test the double-booking conflict prevention and video
                consultation demonstration.
              </p>
              <button
                onClick={() => setActiveTab('directory')}
                className="px-4 py-2 rounded-xl bg-[#8C3B5E] text-white text-xs font-semibold"
              >
                Browse Fictional Clinicians
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAppointments.map((apt) => {
                const isCancelled = apt.status === 'cancelled';
                return (
                  <div
                    key={apt.id}
                    className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-3 ${
                      isCancelled ? 'bg-[#FAF8F6] border-[#E8DFD8] opacity-75' : 'bg-white border-[#E8DFD8]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#7A7177]">Consultation #{apt.id}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCancelled
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <h3 className="font-serif text-base font-bold text-[#261E23]">{apt.doctor_name}</h3>
                      <p className="text-xs text-[#8C3B5E]">{apt.doctor_specialty}</p>

                      <div className="flex items-center gap-3 text-xs text-[#584F55] pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#C86D51]" />
                          {new Date(apt.appointment_time).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C86D51]" />
                          {new Date(apt.appointment_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="capitalize text-[11px] font-semibold text-[#7A7177]">
                          &bull; {apt.appointment_type}
                        </span>
                      </div>

                      {apt.notes && (
                        <p className="text-xs text-[#6D636B] bg-[#FAF7F5] p-2.5 rounded-xl border border-[#F0E6DE]">
                          Notes: {apt.notes}
                        </p>
                      )}
                    </div>

                    {!isCancelled && (
                      <div className="pt-3 border-t border-[#F0E6DE] flex flex-wrap items-center justify-between gap-2">
                        {apt.appointment_type === 'video' ? (
                          <button
                            onClick={() => handleLaunchVideoDemo(apt)}
                            className="px-3.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5 text-purple-700" />
                            <span>Launch Video Demo</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#7A7177]">In-Person Demo</span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenReschedule(apt)}
                            className="px-3 py-1.5 rounded-lg border border-[#D5C7BE] text-xs font-semibold text-[#584F55] hover:bg-[#FAF7F5]"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => {
                              setCancelErrorMsg(null);
                              setAppointmentToCancel(apt);
                            }}
                            className="px-3.5 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Slot Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#E8DFD8] overflow-hidden">
            <div className="p-5 pb-4 bg-white border-b border-[#E8DFD8] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#261E23]">Book Demonstration Appointment</h3>
                <p className="text-xs text-[#7A7177]">
                  {selectedDoctor.name} &bull; {selectedDoctor.specialty}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="p-1 rounded-xl text-[#7A7177] hover:bg-[#F2E8E1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 text-xs">
              {bookingError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {bookingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{bookingSuccess}</span>
                </div>
              )}

              {/* Slot Selection */}
              <div>
                <label className="block font-semibold text-[#584F55] mb-1.5">
                  Choose Available Slot ({availableSlots.length} available) *
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-xs text-[#7A7177] italic p-3 bg-white rounded-xl border border-[#E8DFD8]">
                    No unbooked slots currently available for this clinician.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.slice(0, 16).map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      const dateObj = new Date(slot.start_time);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-[#8C3B5E] text-white border-[#8C3B5E] shadow-xs'
                              : 'bg-white border-[#D5C7BE] hover:border-[#8C3B5E] text-[#2B232A]'
                          }`}
                        >
                          <div className="font-bold text-xs">{dateObj.toLocaleDateString()}</div>
                          <div className={`text-[11px] ${isSelected ? 'text-rose-100' : 'text-[#7A7177]'}`}>
                            {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Type Selection */}
              <div>
                <label className="block font-semibold text-[#584F55] mb-1">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAppointmentType('video')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      appointmentType === 'video'
                        ? 'bg-[#8C3B5E] text-white border-[#8C3B5E]'
                        : 'bg-white border-[#D5C7BE] text-[#584F55]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video (Demo Jitsi)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppointmentType('in_person')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      appointmentType === 'in_person'
                        ? 'bg-[#8C3B5E] text-white border-[#8C3B5E]'
                        : 'bg-white border-[#D5C7BE] text-[#584F55]'
                    }`}
                  >
                    <span>In-Person Demo</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-[#584F55] mb-1">Optional Preparation Notes (Max 500)</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Questions regarding menstrual cramps, cycle irregularities..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7BE] bg-white focus:outline-hidden focus:border-[#8C3B5E]"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#584F55] hover:bg-[#FAF7F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlotId}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8C3B5E] to-[#C86D51] text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 shadow-xs"
                >
                  {bookingLoading ? 'Confirming...' : 'Confirm Demo Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E8DFD8] space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#261E23]">Reschedule Appointment</h3>
              <p className="text-xs text-[#7A7177]">{rescheduleAppointment.doctor_name}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#584F55]">Select New Available Slot:</label>
              {rescheduleSlots.length === 0 ? (
                <p className="text-xs text-[#7A7177] italic">No other upcoming slots found for this clinician.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {rescheduleSlots.slice(0, 10).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setNewSlotId(s.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs ${
                        newSlotId === s.id ? 'bg-[#8C3B5E] text-white' : 'bg-white border-[#D5C7BE]'
                      }`}
                    >
                      <div className="font-bold">{new Date(s.start_time).toLocaleDateString()}</div>
                      <div className="text-[11px] opacity-80">
                        {new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRescheduleAppointment(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#584F55]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={!newSlotId}
                className="px-5 py-2 rounded-xl bg-[#8C3B5E] text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jitsi Video Consultation Demo Modal */}
      {videoConsultationData && (
        <JitsiDemoModal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          roomUrl={videoConsultationData.roomUrl}
          doctorName={videoConsultationData.doctorName}
          specialty={videoConsultationData.specialty}
        />
      )}

      {/* In-App Cancel Consultation Confirmation Modal */}
      {appointmentToCancel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => {
            if (!cancellingLoading) setAppointmentToCancel(null);
          }}
        >
          <div
            className="w-full max-w-md bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#E8DFD8] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#8C3B5E]">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#261E23]">Cancel Consultation?</h3>
                <p className="text-xs text-[#6D636B] mt-1.5 leading-relaxed">
                  Are you sure you want to cancel your consultation with{' '}
                  <strong className="text-[#261E23]">{appointmentToCancel.doctor_name}</strong> scheduled for{' '}
                  <strong className="text-[#261E23]">
                    {new Date(appointmentToCancel.appointment_time).toLocaleDateString()} at{' '}
                    {new Date(appointmentToCancel.appointment_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                  ? The time slot will be immediately released so other members can book it.
                </p>
              </div>

              {cancelErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cancelErrorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAppointmentToCancel(null)}
                  disabled={cancellingLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#584F55] hover:bg-[#FAF7F5] transition-colors cursor-pointer"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancellingLoading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {cancellingLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Yes, Cancel Consultation</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
