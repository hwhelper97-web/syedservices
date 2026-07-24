"use client";

import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiLoader, FiPlusCircle } from "react-icons/fi";

const TIME_SLOTS = [
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form states
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.appointments);
      }
    } catch (e) {
      console.error("Failed to load appointments", e);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setBooking(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, timeSlot, notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      setSuccess(true);
      setDate("");
      setNotes("");
      fetchAppointments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Booking Form */}
        <div className="md:col-span-5 space-y-6">
          <h3 className="text-xl font-black text-white tracking-tight">Book Consultation</h3>
          
          <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2.5rem] shadow-xl space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                Appointment scheduled successfully!
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Preferred Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Add Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about your visa requirements..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none placeholder-slate-650 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={booking}
                className="w-full py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {booking ? (
                  <FiLoader className="animate-spin" size={18} />
                ) : (
                  <>
                    <FiPlusCircle size={18} /> Book Appointment
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Appointments List */}
        <div className="md:col-span-7 space-y-6">
          <h3 className="text-xl font-black text-white tracking-tight">Your Schedule History</h3>

          {loading ? (
            <div className="flex justify-center items-center h-48 text-yellow-400">
              <FiLoader className="animate-spin" size={28} />
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed p-12 rounded-[2.5rem] text-center flex flex-col items-center justify-center gap-3">
              <FiCalendar className="text-slate-500 text-4xl" />
              <h4 className="text-white font-bold text-sm">No Appointments Found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Schedule a consultation to align with a dedicated agent regarding your immigration processes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2.5rem] shadow-md flex items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-center text-yellow-400 shrink-0">
                      <FiCalendar size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {new Date(apt.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <FiClock className="text-yellow-400" /> {apt.timeSlot}
                      </p>
                      {apt.notes && (
                        <p className="text-[11px] text-slate-500 mt-2 bg-slate-950/20 px-3 py-1.5 rounded-lg">
                          Notes: {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border shrink-0 ${
                    apt.status === "SCHEDULED" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    apt.status === "COMPLETED" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
