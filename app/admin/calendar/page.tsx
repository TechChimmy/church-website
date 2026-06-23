"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AdminPageHeader, Card, Field, Input, Textarea,
  SaveButton, DangerButton, Toast,
} from "@/components/admin/AdminUI";

type CalEv = {
  id: string; title: string; description?: string;
  date: string; time?: string; endTime?: string; color: string;
};

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const EMPTY_FORM: Omit<CalEv,"id"> = { title:"", description:"", date:"", time:"", endTime:"", color:"#c9a84c" };

export default function AdminCalendar() {
  const [events, setEvents]   = useState<CalEv[]>([]);
  const [year, setYear]       = useState(new Date().getFullYear());
  const [month, setMonth]     = useState(new Date().getMonth());
  const [form, setForm]       = useState<Omit<CalEv,"id"> & { id?: string }>(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r = await fetch("/api/cms/calendar");
    setEvents(await r.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  function changeMonth(d: number) {
    let m = month + d, y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setMonth(m); setYear(y);
  }

  function dayKey(d: number) {
    return `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  function eventsForDay(d: number) {
    const k = dayKey(d);
    return events.filter(e => e.date.slice(0,10) === k);
  }

  function clickDay(d: number) {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: dayKey(d) });
  }

  function startEdit(ev: CalEv) {
    setEditing(ev.id);
    setForm({ ...ev, date: ev.date.slice(0,10) });
  }

  function cancel() { setEditing(null); setForm(EMPTY_FORM); }

  async function save() {
    if (!form.title || !form.date) return;
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    await fetch("/api/cms/calendar", {
      method, headers: { "Content-Type":"application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false); cancel(); load();
    showToast(editing ? "Event updated" : "Event added");
  }

  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await fetch("/api/cms/calendar", {
      method:"DELETE", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id }),
    });
    load(); cancel(); showToast("Deleted");
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Calendar grid
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells: (number|null)[] = Array.from({ length: Math.ceil((firstDay+daysInMonth)/7)*7 },
    (_, i) => { const d = i-firstDay+1; return d>=1&&d<=daysInMonth?d:null; });
  const rows: (number|null)[][] = [];
  for (let i=0;i<cells.length;i+=7) rows.push(cells.slice(i,i+7));

  return (
    <div>
      <AdminPageHeader title="Calendar" description="Add, edit and delete calendar events. Click a date to add." />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Calendar */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => changeMonth(-1)}
              className="w-8 h-8 border border-stone-300 flex items-center justify-center
                         hover:bg-stone-900 hover:text-white transition-colors text-lg leading-none">
              ‹
            </button>
            <span className="font-playfair text-[16px] font-semibold text-stone-900">
              {MONTHS[month]} {year}
            </span>
            <button onClick={() => changeMonth(1)}
              className="w-8 h-8 border border-stone-300 flex items-center justify-center
                         hover:bg-stone-900 hover:text-white transition-colors text-lg leading-none">
              ›
            </button>
          </div>

          <table className="w-full border-collapse border border-stone-200 table-fixed">
            <thead>
              <tr>
                {DAYS.map(d => (
                  <th key={d} className="py-2 font-lato text-[11px] uppercase tracking-widest
                                         text-stone-400 bg-stone-50 border border-stone-200 text-center">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((day, ci) => {
                    const evs = day ? eventsForDay(day) : [];
                    const today = new Date();
                    const isToday = day === today.getDate() &&
                      month === today.getMonth() && year === today.getFullYear();
                    return (
                      <td key={ci}
                        onClick={() => day && clickDay(day)}
                        className={`border border-stone-200 p-1.5 align-top cursor-pointer
                                   ${day ? "hover:bg-[rgba(140,58,99,0.06)]" : "bg-stone-50/50"}`}
                        style={{ minHeight: 68 }}>
                        {day && (
                          <>
                            <span className={`font-lato text-[11px] font-bold w-5 h-5 flex
                                            items-center justify-center rounded-full mb-1
                                            ${isToday ? "bg-stone-900 text-white" : "text-stone-700"}`}>
                              {day}
                            </span>
                            {evs.map(ev => (
                              <button key={ev.id}
                                onClick={e => { e.stopPropagation(); startEdit(ev); }}
                                className="block w-full text-left font-lato text-[9px] font-bold
                                           px-1 py-0.5 rounded-sm mb-0.5 truncate"
                                style={{ background: ev.color + "33", color: ev.color }}>
                                {ev.title}
                              </button>
                            ))}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="font-lato text-[11px] text-stone-400 mt-3 text-center">
            Click a date to add an event. Click an event to edit it.
          </p>
        </Card>

        {/* Form panel */}
        <Card>
          <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
            {editing ? "Edit Event" : "Add Event"}
          </h3>
          <Field label="Title">
            <Input value={form.title} onChange={e => set("title", e.target.value)} />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          </Field>
          <Field label="Start Time">
            <Input value={form.time ?? ""} onChange={e => set("time", e.target.value)} placeholder="e.g. 9:00 AM" />
          </Field>
          <Field label="End Time">
            <Input value={form.endTime ?? ""} onChange={e => set("endTime", e.target.value)} placeholder="e.g. 11:00 AM" />
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description ?? ""} onChange={e => set("description", e.target.value)} />
          </Field>
          <Field label="Color">
            <div className="flex items-center gap-3">
              <input type="color" value={form.color}
                onChange={e => set("color", e.target.value)}
                className="w-10 h-10 cursor-pointer border border-stone-300" />
              <Input value={form.color} onChange={e => set("color", e.target.value)} className="flex-1" />
            </div>
          </Field>
          <div className="flex gap-2 flex-wrap mt-2">
            <SaveButton loading={saving} label={editing ? "Update" : "Add Event"} onClick={save} />
            {editing && <DangerButton onClick={() => del(editing)} />}
            {(editing || form.title) && (
              <button onClick={cancel}
                className="font-lato text-[11px] text-stone-400 hover:text-stone-700 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </Card>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
