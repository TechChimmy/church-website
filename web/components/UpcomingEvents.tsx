"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

type UpcomingEvent = {
  id: string;
  date: string;
  dateTa?: string;
  title: string;
  titleTa?: string;
  desc: string;
  descriptionTa?: string;
  imageUrl?: string;
  time?: string;
  timeTa?: string;
  location?: string;
  locationTa?: string;
  organizer?: string;
  organizerTa?: string;
  notes?: string;
  notesTa?: string;
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

function EventDescription({ desc }: { desc: string }) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 120;
  const shouldTruncate = desc.length > maxLength;

  if (!shouldTruncate) {
    return (
      <p className="font-lato text-[12px] sm:text-[12.5px] leading-relaxed break-words" style={{ color: "#8A7078" }}>
        {desc}
      </p>
    );
  }

  return (
    <div>
      <p className="font-lato text-[12px] sm:text-[12.5px] leading-relaxed break-words" style={{ color: "#8A7078" }}>
        {isExpanded ? desc : `${desc.slice(0, maxLength)}...`}
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="font-lato text-[11px] font-bold mt-1 text-[var(--burgundy)] hover:underline block"
      >
        {isExpanded ? t("events.showLess") : t("events.readMore")}
      </button>
    </div>
  );
}

export default function UpcomingEvents({ events = [] }: UpcomingEventsProps) {
  const { lang, t } = useLanguage();
  const [modalEvent, setModalEvent] = useState<UpcomingEvent | null>(null);
  const [form, setForm] = useState<ParticipationForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (modalEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modalEvent]);

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  const items: UpcomingEvent[] = events.length > 0
    ? events
    : [
        {
          id: "fallback-1",
          date: new Date().toISOString(),
          title: t("events.noEvents"),
          desc: t("events.noEventsDesc"),
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
    if (!form.name.trim()) { setError(t("askCollins.errorName")); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t("askCollins.errorEmail")); return;
    }
    if (!modalEvent) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/event-participation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: modalEvent.id,
          eventTitle: lang === "ta" && modalEvent.titleTa ? modalEvent.titleTa : modalEvent.title,
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
        setError(data.error ?? t("events.errorSomethingWrong"));
      }
    } catch {
      setError(t("events.errorNetworkError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadTicket() {
    if (!modalEvent) return;

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        `CFT Church Ticket\nID: ${submittedId}\nEvent: ${lang === "ta" && modalEvent.titleTa ? modalEvent.titleTa : modalEvent.title}\nAttendee: ${form.name}`
      )}`;
      const response = await fetch(qrUrl);
      const qrBlob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(qrBlob);
      reader.onloadend = () => {
        const base64Qr = reader.result as string;

        const eventTitle = lang === "ta" && modalEvent.titleTa ? modalEvent.titleTa : modalEvent.title;
        const eventDate = lang === "ta" && modalEvent.dateTa ? modalEvent.dateTa : formatDate(modalEvent.date);
        const eventTime = lang === "ta" && modalEvent.timeTa ? modalEvent.timeTa : modalEvent.time;
        const eventLocation = lang === "ta" && modalEvent.locationTa ? modalEvent.locationTa : modalEvent.location;

        const chName = lang === 'ta' ? 'கிறிஸ்தியன் பெல்லோஷிப் சர்ச்' : 'Christian Fellowship Church';
        const offTicket = lang === 'ta' ? 'அதிகாரப்பூர்வ நிகழ்வு நுழைவுச்சீட்டு' : 'Official Event Ticket';
        const lblEvent = lang === 'ta' ? 'நிகழ்வு' : 'EVENT';
        const lblAttendee = lang === 'ta' ? 'பங்கேற்பாளர்' : 'ATTENDEE';
        const lblDate = lang === 'ta' ? 'தேதி' : 'DATE';
        const lblTime = lang === 'ta' ? 'நேரம்' : 'TIME';
        const lblLocation = lang === 'ta' ? 'இடம்' : 'LOCATION';
        const lblId = lang === 'ta' ? 'நுழைவுச்சீட்டு ஐடி' : 'TICKET ID';
        const lblFooter = lang === 'ta' ? 'தயவுசெய்து நுழைவாயிலில் இந்த டிஜிட்டல் நுழைவுச்சீட்டை காண்பிக்கவும்.' : 'Please present this digital ticket at the entrance.';

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${eventTitle} - Ticket</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .ticket { background-color: #ffffff; border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); width: 100%; max-width: 360px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #4A1630 0%, #8C3A63 100%); color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }
    .dashed-line { border-top: 2px dashed #e5e7eb; height: 0; margin: 0; position: relative; }
    .dashed-line::before, .dashed-line::after { content: ''; position: absolute; top: -8px; width: 16px; height: 16px; background-color: #f3f4f6; border-radius: 50%; }
    .dashed-line::before { left: -8px; } .dashed-line::after { right: -8px; }
    .body { padding: 24px; }
    .info-grid { display: grid; gap: 16px; margin-bottom: 24px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .info-value { font-size: 13px; color: #374151; font-weight: 600; }
    .qr-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 0; }
    .qr-code { width: 160px; height: 160px; margin-bottom: 12px; }
    .ticket-id { font-family: monospace; font-size: 11px; color: #9ca3af; }
    .footer { padding: 16px 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6; }
    .footer p { font-size: 12px; color: #6b7280; margin: 0; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header"><h1>${chName}</h1><p>${offTicket}</p></div>
    <div class="dashed-line"></div>
    <div class="body">
      <div class="info-grid">
        <div class="info-item"><span class="info-label">${lblEvent}</span><span class="info-value" style="color: #1f2937; font-size: 16px;">${eventTitle}</span></div>
        <div class="info-item"><span class="info-label">${lblAttendee}</span><span class="info-value">${form.name}</span></div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="info-item"><span class="info-label">${lblDate}</span><span class="info-value">${eventDate}</span></div>
          ${eventTime ? `<div class="info-item"><span class="info-label">${lblTime}</span><span class="info-value">${eventTime}</span></div>` : ''}
        </div>
        ${eventLocation ? `<div class="info-item"><span class="info-label">${lblLocation}</span><span class="info-value">${eventLocation}</span></div>` : ''}
      </div>
      <div class="qr-container"><img class="qr-code" src="${base64Qr}" alt="QR" /><span class="ticket-id">${lblId}: ${submittedId}</span></div>
    </div>
    <div class="footer"><p>${lblFooter}</p></div>
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
          <div className="flex items-center gap-4 mb-10">
            <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
            <h2 className="font-playfair text-[26px] sm:text-[28px] font-bold" style={{ color: "var(--text-dark)" }}>
              {t("events.upcomingEvents")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {items.map((ev) => {
              const title = lang === "ta" && ev.titleTa ? ev.titleTa : ev.title;
              const desc = lang === "ta" && ev.descriptionTa ? ev.descriptionTa : ev.desc;
              const dateStr = lang === "ta" && ev.dateTa ? ev.dateTa : formatDate(ev.date);

              return (
                <div
                  key={ev.id}
                  className="flex gap-0 overflow-hidden rounded-sm transition-all duration-200 will-change-transform h-full w-full"
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
                  <div className="w-[100px] sm:w-[120px] shrink-0 relative min-h-[140px]"
                    style={{ backgroundColor: "rgba(140,58,99,0.15)" }}>
                    {ev.imageUrl ? (
                      <Image src={ev.imageUrl} alt={title} fill className="object-cover" sizes="120px" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center min-h-[140px]">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(140,58,99,0.4)" strokeWidth="1.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                    )}
                  </div>
 
                  <div className="py-4 px-4 sm:py-5 sm:pr-5 flex flex-col justify-between flex-1 min-w-0 bg-white h-full">
                    <div className="flex-1 pb-3">
                      <p className="font-lato text-[11px] uppercase tracking-[1.5px] mb-1.5" style={{ color: "var(--burgundy)" }}>{dateStr}</p>
                      <h3 className="font-playfair text-[15px] sm:text-[17px] font-semibold mb-2 leading-snug break-words" style={{ color: "var(--text-dark)" }}>
                        {title}
                      </h3>
                      <EventDescription desc={desc} />
                    </div>
                    {ev.id !== "fallback-1" && (
                      <div className="mt-auto shrink-0">
                        <button suppressHydrationWarning type="button" className="btn-primary" onClick={() => openModal(ev)}>
                          {t("events.rsvp")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
              style={{ top: "50%", left: "50%", translateX: "-50%", translateY: "-50%", maxHeight: "90vh" }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
            >
              <div className="px-7 pt-7 pb-5" style={{ borderBottom: "1px solid rgba(140,58,99,0.1)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-lato text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--burgundy)" }}>{t("events.rsvp")}</p>
                    <h3 className="font-playfair text-[20px] sm:text-[22px] font-bold" style={{ color: "var(--text-dark)" }}>
                      {lang === "ta" && modalEvent.titleTa ? modalEvent.titleTa : modalEvent.title}
                    </h3>
                  </div>
                  <button suppressHydrationWarning onClick={closeModal} aria-label={t("events.close")}
                    className="w-7 h-7 flex items-center justify-center text-xl leading-none shrink-0 transition-colors"
                    style={{ color: "#8A7078" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--burgundy)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#8A7078"; }}>
                    ×
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--burgundy)" strokeWidth="2" className="shrink-0">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="font-lato text-[12px]" style={{ color: "#8A7078" }}>{lang === "ta" && modalEvent.dateTa ? modalEvent.dateTa : formatDate(modalEvent.date)}</span>
                  </div>
                  {((lang === "ta" && modalEvent.timeTa) || modalEvent.time) && (
                    <div className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--burgundy)" strokeWidth="2" className="shrink-0">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="font-lato text-[12px]" style={{ color: "#8A7078" }}>{lang === "ta" && modalEvent.timeTa ? modalEvent.timeTa : modalEvent.time}</span>
                    </div>
                  )}
                  {((lang === "ta" && modalEvent.locationTa) || modalEvent.location) && (
                    <div className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--burgundy)" strokeWidth="2" className="shrink-0">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="font-lato text-[12px]" style={{ color: "#8A7078" }}>{lang === "ta" && modalEvent.locationTa ? modalEvent.locationTa : modalEvent.location}</span>
                    </div>
                  )}
                  {((lang === "ta" && modalEvent.organizerTa) || modalEvent.organizer) && (
                    <div className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--burgundy)" strokeWidth="2" className="shrink-0">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="font-lato text-[12px]" style={{ color: "#8A7078" }}>{lang === "ta" && modalEvent.organizerTa ? modalEvent.organizerTa : modalEvent.organizer}</span>
                    </div>
                  )}
                </div>
                {((lang === "ta" && modalEvent.descriptionTa) || modalEvent.desc) && (
                  <p className="font-lato text-[12.5px] leading-relaxed mt-3" style={{ color: "#8A7078" }}>
                    {lang === "ta" && modalEvent.descriptionTa ? modalEvent.descriptionTa : modalEvent.desc}
                  </p>
                )}
                {((lang === "ta" && modalEvent.notesTa) || modalEvent.notes) && (
                  <p className="font-lato text-[12px] mt-2 italic" style={{ color: "rgba(140,58,99,0.7)" }}>
                    {lang === "ta" ? "குறிப்பு: " : "Note: "}{lang === "ta" && modalEvent.notesTa ? modalEvent.notesTa : modalEvent.notes}
                  </p>
                )}
              </div>

              <div className="px-7 py-6">
                {submitted ? (
                  <div className="text-center py-2">
                    <div className="border border-dashed border-stone-300 rounded-lg p-5 bg-stone-50 text-left mb-6 relative overflow-hidden" style={{ borderLeft: "4px solid var(--burgundy)" }}>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <p className="font-lato text-[10px] uppercase tracking-widest text-stone-400">{lang === "ta" ? "நிகழ்வு நுழைவுச்சீட்டு" : "Event Ticket"}</p>
                          <h4 className="font-playfair text-[16px] font-bold text-stone-800 leading-snug">{lang === "ta" && modalEvent.titleTa ? modalEvent.titleTa : modalEvent.title}</h4>
                        </div>
                        <div className="shrink-0 bg-white p-1.5 border border-stone-200 rounded-sm">
<<<<<<< Updated upstream
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                              `CFT Church Ticket\nID: ${submittedId}\nEvent: ${modalEvent.title}\nAttendee: ${form.name}`
                            )}`}
                            alt="QR Code Ticket"
                            className="w-16 h-16"
                          />
=======
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(`CFT Church Ticket\nID: ${submittedId}\nEvent: ${lang === "ta" && modalEvent.titleTa ? modalEvent.titleTa : modalEvent.title}\nAttendee: ${form.name}`)}`} alt="QR Code" className="w-16 h-16" />
>>>>>>> Stashed changes
                        </div>
                      </div>
                      <div className="border-t border-dashed border-stone-200 my-3" />
                      <div className="space-y-1.5 font-lato text-[12px] text-stone-600">
                        <p><span className="text-stone-400">{lang === "ta" ? "பங்கேற்பாளர்:" : "Attendee:"}</span> <strong className="text-stone-800">{form.name}</strong></p>
                        <p><span className="text-stone-400">{lang === "ta" ? "தேதி:" : "Date:"}</span> {lang === "ta" && modalEvent.dateTa ? modalEvent.dateTa : formatDate(modalEvent.date)}</p>
                        {((lang === "ta" && modalEvent.timeTa) || modalEvent.time) && <p><span className="text-stone-400">{lang === "ta" ? "நேரம்:" : "Time:"}</span> {lang === "ta" && modalEvent.timeTa ? modalEvent.timeTa : modalEvent.time}</p>}
                        {((lang === "ta" && modalEvent.locationTa) || modalEvent.location) && <p><span className="text-stone-400">{lang === "ta" ? "இடம்:" : "Location:"}</span> {lang === "ta" && modalEvent.locationTa ? modalEvent.locationTa : modalEvent.location}</p>}
                        <p className="text-[10px] text-stone-400 pt-2 font-mono">ID: {submittedId}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <button suppressHydrationWarning type="button" onClick={downloadTicket} className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6 rounded-sm w-full sm:w-auto text-[11px] font-bold uppercase tracking-wider">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        {lang === "ta" ? "நுழைவுச்சீட்டை பதிவிறக்கு" : "Download Ticket"}
                      </button>
                      <button suppressHydrationWarning type="button" onClick={closeModal} className="font-lato text-[11px] font-bold uppercase tracking-widest px-8 py-2.5 rounded-sm border transition-all hover:bg-stone-100 w-full sm:w-auto" style={{ borderColor: "rgba(140,58,99,0.25)", color: "var(--burgundy)" }}>
                        {t("events.close")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-lato text-[12px] font-bold uppercase tracking-widest mb-4" style={{ color: "#8A7078" }}>{lang === "ta" ? "உங்கள் விவரங்கள்" : "Your details"}</p>
                    <div className="flex flex-col gap-3">
                      <input suppressHydrationWarning type="text" placeholder={lang === "ta" ? "உங்கள் முழு பெயர் *" : "Your full name *"} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 font-lato text-[13px] border border-stone-300 outline-none bg-white text-stone-800 focus:border-[var(--burgundy)] transition-colors placeholder:text-stone-300 rounded-sm" />
                      <input suppressHydrationWarning type="email" placeholder={lang === "ta" ? "உங்கள் மின்னஞ்சல் முகவரி *" : "Your email address *"} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 font-lato text-[13px] border border-stone-300 outline-none bg-white text-stone-800 focus:border-[var(--burgundy)] transition-colors placeholder:text-stone-300 rounded-sm" />
                      <input suppressHydrationWarning type="tel" placeholder={lang === "ta" ? "தொலைபேசி எண் (விருப்பம்)" : "Phone number (optional)"} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 font-lato text-[13px] border border-stone-300 outline-none bg-white text-stone-800 focus:border-[var(--burgundy)] transition-colors placeholder:text-stone-300 rounded-sm" />
                    </div>
                    {error && <p className="font-lato text-[12.5px] text-red-500 mt-3">{error}</p>}
                    <div className="flex gap-3 mt-5">
                      <button suppressHydrationWarning type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 text-center disabled:opacity-60">
                        {submitting ? (lang === "ta" ? "பதிவுசெய்கிறது..." : "Registering…") : (lang === "ta" ? "என் பங்கேற்பை உறுதிப்படுத்துக" : "Confirm My Participation")}
                      </button>
                      <button suppressHydrationWarning type="button" onClick={closeModal} className="font-lato text-[11px] uppercase tracking-wider px-4 py-2 rounded-sm border transition-colors" style={{ borderColor: "rgba(140,58,99,0.2)", color: "#8A7078" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--burgundy)"; (e.currentTarget as HTMLElement).style.color = "var(--burgundy)"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,58,99,0.2)"; (e.currentTarget as HTMLElement).style.color = "#8A7078"; }}>
                        {lang === "ta" ? "ரத்துசெய்" : "Cancel"}
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
