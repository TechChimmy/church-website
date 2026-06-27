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
  const [submittedId, setSubmittedId] = useState("");
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
    setSubmittedId("");
    setError("");
  }

  function closeModal() {
    setModalEvent(null);
    setForm(EMPTY_FORM);
    setSubmitted(false);
    setSubmittedId("");
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
        const data = await res.json();
        setSubmittedId(data.id || "");
        setSubmitted(true);
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

  async function downloadTicket() {
    if (!modalEvent) return;

    try {
      // 1. Fetch QR code image and convert to Base64 Data URL
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        `CFT Church Ticket\nID: ${submittedId}\nEvent: ${modalEvent.title}\nAttendee: ${form.name}`
      )}`;
      const response = await fetch(qrUrl);
      const qrBlob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(qrBlob);
      reader.onloadend = () => {
        const base64Qr = reader.result as string;

        // 2. Construct the HTML content with embedded QR code
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CFT Event Ticket - ${modalEvent.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .ticket {
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 420px;
      overflow: hidden;
      border-top: 6px solid #8c3a63;
    }
    .header {
      padding: 24px;
      text-align: center;
      background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
    }
    .header h1 {
      font-size: 18px;
      margin: 0 0 4px 0;
      color: #1f2937;
      font-weight: 700;
    }
    .header p {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 0;
      color: #8c3a63;
      font-weight: 600;
    }
    .dashed-line {
      border-top: 2px dashed #e5e7eb;
      height: 0;
      margin: 0;
      position: relative;
    }
    .dashed-line::before, .dashed-line::after {
      content: '';
      position: absolute;
      top: -10px;
      width: 20px;
      height: 20px;
      background-color: #f3f4f6;
      border-radius: 50%;
    }
    .dashed-line::before { left: -10px; }
    .dashed-line::after { right: -10px; }
    
    .body {
      padding: 24px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 10px;
      color: #9ca3af;
      margin-bottom: 2px;
      font-weight: bold;
    }
    .info-value {
      font-size: 14px;
      color: #374151;
      font-weight: 600;
    }
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background-color: #fafafa;
      border-radius: 8px;
      border: 1px solid #f3f4f6;
      margin-bottom: 20px;
    }
    .qr-code {
      width: 160px;
      height: 160px;
      margin-bottom: 12px;
    }
    .ticket-id {
      font-family: monospace;
      font-size: 11px;
      color: #9ca3af;
    }
    .footer {
      padding: 16px 24px;
      background-color: #f9fafb;
      text-align: center;
      border-top: 1px solid #f3f4f6;
    }
    .footer p {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <h1>Christian Fellowship Church</h1>
      <p>Official Event Ticket</p>
    </div>
    
    <div class="dashed-line"></div>
    
    <div class="body">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">EVENT</span>
          <span class="info-value" style="color: #1f2937; font-size: 16px;">${modalEvent.title}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ATTENDEE</span>
          <span class="info-value">${form.name}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="info-item">
            <span class="info-label">DATE</span>
            <span class="info-value">${modalEvent.date}</span>
          </div>
          ${modalEvent.time ? `
          <div class="info-item">
            <span class="info-label">TIME</span>
            <span class="info-value">${modalEvent.time}</span>
          </div>` : ''}
        </div>
        ${modalEvent.location ? `
        <div class="info-item">
          <span class="info-label">LOCATION</span>
          <span class="info-value">${modalEvent.location}</span>
        </div>` : ''}
      </div>

      <div class="qr-container">
        <img class="qr-code" src="${base64Qr}" alt="Ticket QR Code" />
        <span class="ticket-id">TICKET ID: ${submittedId}</span>
      </div>
    </div>
    
    <div class="footer">
      <p>Please present this digital ticket at the entrance.</p>
    </div>
  </div>
</body>
</html>`;

        const htmlBlob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        const htmlLink = document.createElement("a");
        htmlLink.href = htmlUrl;
        htmlLink.download = `cft-ticket-${submittedId.substring(0, 8)}.html`;
        document.body.appendChild(htmlLink);
        htmlLink.click();
        document.body.removeChild(htmlLink);
        URL.revokeObjectURL(htmlUrl);
      };
    } catch (err) {
      console.error("Failed to generate HTML ticket:", err);
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
                  <div className="text-center py-2">
                    {/* Ticket Card Container */}
                    <div className="border border-dashed border-stone-300 rounded-lg p-5 bg-stone-50 text-left mb-6 relative overflow-hidden"
                         style={{ borderLeft: "4px solid var(--burgundy)" }}>
                      {/* Ticket Header */}
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <p className="font-lato text-[10px] uppercase tracking-widest text-stone-400">Event Ticket</p>
                          <h4 className="font-playfair text-[16px] font-bold text-stone-800 leading-snug">{modalEvent.title}</h4>
                        </div>
                        <div className="shrink-0 bg-white p-1.5 border border-stone-200 rounded-sm">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                              `CFT Church Ticket\nID: ${submittedId}\nEvent: ${modalEvent.title}\nAttendee: ${form.name}`
                            )}`}
                            alt="QR Code Ticket"
                            className="w-16 h-16"
                          />
                        </div>
                      </div>

                      {/* Dash separator */}
                      <div className="border-t border-dashed border-stone-200 my-3" />

                      {/* Attendee Info */}
                      <div className="space-y-1.5 font-lato text-[12px] text-stone-600">
                        <p><span className="text-stone-400">Attendee:</span> <strong className="text-stone-800">{form.name}</strong></p>
                        <p><span className="text-stone-400">Date:</span> {modalEvent.date}</p>
                        {modalEvent.time && <p><span className="text-stone-400">Time:</span> {modalEvent.time}</p>}
                        {modalEvent.location && <p><span className="text-stone-400">Location:</span> {modalEvent.location}</p>}
                        <p className="text-[10px] text-stone-400 pt-2 font-mono">ID: {submittedId}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <button
                        type="button"
                        onClick={downloadTicket}
                        className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6 rounded-sm w-full sm:w-auto text-[11px] font-bold uppercase tracking-wider"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Ticket
                      </button>

                      <button
                        type="button"
                        onClick={closeModal}
                        className="font-lato text-[11px] font-bold uppercase tracking-widest px-8 py-2.5 rounded-sm border transition-all hover:bg-stone-100 w-full sm:w-auto"
                        style={{ borderColor: "rgba(140,58,99,0.25)", color: "var(--burgundy)" }}
                      >
                        Close
                      </button>
                    </div>
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
