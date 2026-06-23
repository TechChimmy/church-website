"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type UpcomingEvent = {
  id: string;
  date: string;
  title: string;
  desc: string;
  imageUrl?: string;
  time?: string;
  location?: string;
  organizer?: string;
  notes?: string;
};

type UpcomingEventsProps = {
  events?: UpcomingEvent[];
};

type ParticipationForm = {
  name: string;
  email: string;
  phone: string;
};

const EMPTY_FORM: ParticipationForm = { name: "", email: "", phone: "" };

export default function UpcomingEvents({ events = [] }: UpcomingEventsProps) {
  const [modalEvent, setModalEvent] = useState<UpcomingEvent | null>(null);
  const [form, setForm] = useState<ParticipationForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modalEvent]);

  const items = events.length > 0
    ? events
    : [
        {
          id: "fallback-1",
          date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
          title: "Event details coming soon",
          desc: "Add events from the admin panel to show upcoming church activities here.",
          imageUrl: "",
        },
      ];

  function openModal(ev: UpcomingEvent) {
    setModalEvent(ev);
    setForm(EMPTY_FORM);
    setSubmitted(false);
    setError("");
  }

  function closeModal() {
    setModalEvent(null);
    setForm(EMPTY_FORM);
    setSubmitted(false);
    setError("");
  }

  async function handleSubmit() {
    setError("");
    if (!form.name.trim()) { setError("Please enter your name."); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address."); return;
    }
    if (!modalEvent) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/event-participation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: modalEvent.id,
          eventTitle: modalEvent.title,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(closeModal, 3000);
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="py-14 px-4 sm:px-10" style={{ backgroundColor: "var(--bg-light)" }}>
        <div className="max-w-[1280px] mx-auto">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
            <h2 className="font-playfair text-[26px] sm:text-[28px] font-bold" style={{ color: "var(--text-dark)" }}>
              Upcoming Events
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {items.map((ev) => (
              <div
                key={ev.id}
                className="flex gap-0 overflow-hidden rounded-sm transition-all duration-200 will-change-transform"
                style={{
                  border: "1px solid rgba(140,58,99,0.12)",
                  boxShadow: "0 2px 12px rgba(140,58,99,0.06)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-3px) scale(1.01)";
                  el.style.boxShadow = "0 8px 28px rgba(140,58,99,0.15)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "";
                  el.style.boxShadow = "0 2px 12px rgba(140,58,99,0.06)";
                }}
              >
                {/* Image */}
                <div className="w-[100px] sm:w-[120px] shrink-0 relative min-h-[140px]"
                  style={{ backgroundColor: "rgba(140,58,99,0.15)" }}>
                  {ev.imageUrl ? (
                    <Image
                      src={ev.imageUrl}
                      alt={ev.title}
                      fill
                      className="object-cover"
                      sizes="120px"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center min-h-[140px]">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(140,58,99,0.4)" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="py-4 px-4 sm:py-5 sm:pr-5 flex flex-col justify-between flex-1 min-w-0 bg-white">
                  <div>
                    <p className="font-lato text-[11px] uppercase tracking-[1.5px] mb-1.5"
                      style={{ color: "var(--burgundy)" }}>{ev.date}</p>
                    <h3 className="font-playfair text-[15px] sm:text-[17px] font-semibold mb-2 leading-snug"
                      style={{ color: "var(--text-dark)" }}>
                      {ev.title}
                    </h3>
                    {/* Show full description, no Read More on events page */}
                    <p className="font-lato text-[12px] sm:text-[12.5px] leading-relaxed"
                      style={{ color: "#8A7078" }}>
                      {ev.desc}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <button type="button" className="btn-primary" onClick={() => openModal(ev)}>
                      Confirm Participation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Participation Modal */}
      <AnimatePresence>
        {modalEvent && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              className="fixed z-50 bg-white shadow-2xl w-[calc(100%-2rem)] max-w-[520px] rounded-sm overflow-y-auto"
              style={{
                top: "50%",
                left: "50%",
                translateX: "-50%",
                translateY: "-50%",
                maxHeight: "90vh",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Modal header */}
              <div className="px-7 pt-7 pb-5" style={{ borderBottom: "1px solid rgba(140,58,99,0.1)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-lato text-[10px] uppercase tracking-widest mb-1"
                      style={{ color: "var(--burgundy)" }}>Confirm Participation</p>
                    <h3 className="font-playfair text-[20px] sm:text-[22px] font-bold"
                      style={{ color: "var(--text-dark)" }}>{modalEvent.title}</h3>
                  </div>
                  <button onClick={closeModal} aria-label="Close"
                    className="w-7 h-7 flex items-center justify-center text-xl leading-none shrink-0 transition-colors"
                    style={{ color: "#8A7078" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--burgundy)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#8A7078"; }}>
                    ×
                  </button>
                </div>

                {/* Event details */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="var(--burgundy)" strokeWidth="2" className="shrink-0">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="font-lato text-[12px]" style={{ color: "#8A7078" }}>{modalEvent.date}</span>
                  </div>
                  {modalEvent.time && (
                    <div className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="var(--burgundy)" strokeWidth="2" className="shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="font-lato text-[12px]" style={{ color: "#8A7078" }}>{modalEvent.time}</span>
                    </div>
                  )}
                  {modalEvent.location && (
                    <div className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="var(--burgundy)" strokeWidth="2" className="shrink-0">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="font-lato text-[12px]" style={{ color: "#8A7078" }}>{modalEvent.location}</span>
                    </div>
                  )}
                  {modalEvent.organizer && (
                    <div className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="var(--burgundy)" strokeWidth="2" className="shrink-0">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="font-lato text-[12px]" style={{ color: "#8A7078" }}>{modalEvent.organizer}</span>
                    </div>
                  )}
                </div>
                {modalEvent.desc && (
                  <p className="font-lato text-[12.5px] leading-relaxed mt-3" style={{ color: "#8A7078" }}>
                    {modalEvent.desc}
                  </p>
                )}
                {modalEvent.notes && (
                  <p className="font-lato text-[12px] mt-2 italic" style={{ color: "rgba(140,58,99,0.7)" }}>
                    Note: {modalEvent.notes}
                  </p>
                )}
              </div>

              {/* Form */}
              <div className="px-7 py-6">
                {submitted ? (
                  <div className="text-center py-4">
                    <p className="font-playfair text-[17px] font-semibold mb-1" style={{ color: "var(--burgundy)" }}>
                      ✓ You&apos;re registered!
                    </p>
                    <p className="font-lato text-[13px]" style={{ color: "#8A7078" }}>
                      We&apos;ll see you at {modalEvent.title}.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="font-lato text-[12px] font-bold uppercase tracking-widest mb-4"
                      style={{ color: "#8A7078" }}>
                      Your details
                    </p>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        placeholder="Your full name *"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 font-lato text-[13px] border border-stone-300 outline-none
                                   bg-white text-stone-800 focus:border-[var(--burgundy)] transition-colors
                                   placeholder:text-stone-300 rounded-sm"
                      />
                      <input
                        type="email"
                        placeholder="Your email address *"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 font-lato text-[13px] border border-stone-300 outline-none
                                   bg-white text-stone-800 focus:border-[var(--burgundy)] transition-colors
                                   placeholder:text-stone-300 rounded-sm"
                      />
                      <input
                        type="tel"
                        placeholder="Phone number (optional)"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 font-lato text-[13px] border border-stone-300 outline-none
                                   bg-white text-stone-800 focus:border-[var(--burgundy)] transition-colors
                                   placeholder:text-stone-300 rounded-sm"
                      />
                    </div>
                    {error && (
                      <p className="font-lato text-[12.5px] text-red-500 mt-3">{error}</p>
                    )}
                    <div className="flex gap-3 mt-5">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary flex-1 text-center disabled:opacity-60"
                      >
                        {submitting ? "Registering…" : "Confirm My Participation"}
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="font-lato text-[11px] uppercase tracking-wider px-4 py-2 rounded-sm border transition-colors"
                        style={{ borderColor: "rgba(140,58,99,0.2)", color: "#8A7078" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--burgundy)"; (e.currentTarget as HTMLElement).style.color = "var(--burgundy)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,58,99,0.2)"; (e.currentTarget as HTMLElement).style.color = "#8A7078"; }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
