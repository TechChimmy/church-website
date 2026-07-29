"use client";

import { useEffect, useState, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  AdminPageHeader, Card, CardSection, Field, Input, Textarea,
  SaveButton, DangerButton, Toast,
} from "@/components/admin/AdminUI";

type Ev = {
  id: string; title: string; titleTa: string; description: string; descriptionTa: string; date: string;
  time: string; timeTa: string; location: string; locationTa: string; imageUrl: string; featured: boolean; active: boolean;
  order?: number;
};

const EMPTY: Omit<Ev, "id"> = {
  title: "", titleTa: "", description: "", descriptionTa: "", date: "", time: "", timeTa: "", location: "", locationTa: "", imageUrl: "", featured: false, active: true, order: 0,
};

type ActiveItem = {
  id: string; title: string; titleTa: string; description: string; descriptionTa: string; imageUrl: string; order: number; active: boolean;
};

const EMPTY_ACTIVE: Omit<ActiveItem, "id"> = {
  title: "", titleTa: "", description: "", descriptionTa: "", imageUrl: "", order: 0, active: true,
};

type S = Record<string, string>;
const EVENTS_PAGE_KEYS = ["events_banner_image"];

export default function AdminEvents() {
  const [events, setEvents]     = useState<Ev[]>([]);
  const [settings, setSettings] = useState<S>({});
  const [form, setForm]       = useState<Omit<Ev,"id"> & { id?: string }>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  // We Stay Active states
  const [actives, setActives]             = useState<ActiveItem[]>([]);
  const [activeForm, setActiveForm]       = useState<Omit<ActiveItem, "id"> & { id?: string }>(EMPTY_ACTIVE);
  const [activeEditing, setActiveEditing] = useState<string | null>(null);
  const [activeSaving, setActiveSaving]   = useState(false);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r = await fetch("/api/cms/events", { cache: "no-store" });
    setEvents(await r.json());
  }, []);

  const loadActives = useCallback(async () => {
    const r = await fetch("/api/cms/we-stay-active", { cache: "no-store" });
    setActives(await r.json());
  }, []);

  const loadSettings = useCallback(async () => {
    const r = await fetch("/api/cms/settings", { cache: "no-store" });
    const all: { key: string; value: string }[] = await r.json();
    const map: S = {};
    EVENTS_PAGE_KEYS.forEach(k => { map[k] = all.find(s => s.key === k)?.value ?? ""; });
    setSettings(map);
  }, []);

  useEffect(() => {
    load();
    loadActives();
    loadSettings();
  }, [load, loadActives, loadSettings]);

  const setSettingValue = (key: string, value: string) =>
    setSettings(s => ({ ...s, [key]: value }));

  async function saveSetting(key: string) {
    await fetch("/api/cms/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: settings[key], group: "events", type: "image" }),
    });
    showToast("Banner Saved");
  }

  // Events functions
  function startEdit(ev: Ev) {
    setEditing(ev.id);
    setForm({ ...ev, date: ev.date?.slice(0, 10) ?? "", order: ev.order ?? 0 });
  }

  function cancelEdit() { setEditing(null); setForm(EMPTY); }

  async function save() {
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    const res = await fetch("/api/cms/events", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save event");
      setSaving(false);
      return;
    }
    setSaving(false);
    cancelEdit();
    load();
    showToast(editing ? "Event updated" : "Event created");
  }

  async function del(id: string) {
    if (!confirm("Delete this event?")) return;
    const res = await fetch("/api/cms/events", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to delete event");
      return;
    }
    load();
    showToast("Deleted");
  }

  const set = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  // We Stay Active functions
  function startEditActive(item: ActiveItem) {
    setActiveEditing(item.id);
    setActiveForm({ ...item });
  }

  // We Stay Active cancel
  function cancelActive() {
    setActiveEditing(null);
    setActiveForm(EMPTY_ACTIVE);
  }

  async function saveActive() {
    if (!activeForm.title.trim()) {
      alert("Title is required");
      return;
    }
    setActiveSaving(true);
    const method = activeEditing ? "PATCH" : "POST";
    const body   = activeEditing ? { ...activeForm, id: activeEditing } : activeForm;
    const res = await fetch("/api/cms/we-stay-active", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save card");
      setActiveSaving(false);
      return;
    }
    setActiveSaving(false);
    cancelActive();
    loadActives();
    showToast(activeEditing ? "Card updated" : "Card created");
  }

  async function deleteActive(id: string) {
    if (!confirm("Delete this activity card?")) return;
    const res = await fetch("/api/cms/we-stay-active", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to delete card");
      return;
    }
    loadActives();
    showToast("Deleted");
  }

  const setActive = (k: string, v: string | number | boolean) =>
    setActiveForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminPageHeader title="Events & Activities" description="Manage Events page banner, upcoming events list, and the 'We Stay Active' layout cards." />

      {/* Events Page Banner */}
      <Card className="mb-8">
        <CardSection title="Events Page Banner">
          <ImageUploader
            label="Events Page Banner Image"
            currentUrl={settings.events_banner_image}
            folder="events"
            onUploaded={url => { setSettingValue("events_banner_image", url); saveSetting("events_banner_image"); }}
          />
        </CardSection>
      </Card>

      {/* ── We Stay Active Editor ── */}
      <div className="mb-8 border-b border-stone-200/80 pb-8" id="we-stay-active">
        <h2 className="font-playfair text-[20px] font-bold text-stone-800 mb-4">We Stay Active Section</h2>
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 340px" }}>
          {/* Active Cards List */}
          <Card>
            <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
              Current Activity Cards ({actives.length})
            </h3>
            {actives.length === 0 && (
              <p className="font-lato text-[13px] text-stone-400">No activity cards created yet.</p>
            )}
            <div className="flex flex-col gap-3">
              {actives.map(item => (
                <div key={item.id} className="flex items-center justify-between border border-stone-200 px-4 py-3 bg-stone-50/50">
                  <div>
                    <p className="font-lato font-bold text-[14px] text-stone-900">
                      {item.title} / {item.titleTa || "(No Tamil Title)"} {!item.active && <span className="text-[11px] text-red-500 italic">(Inactive)</span>}
                    </p>
                    <p className="font-lato text-[11px] text-stone-400">Display Order: {item.order}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditActive(item)}
                      className="font-lato text-[11px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                      Edit
                    </button>
                    <DangerButton onClick={() => deleteActive(item.id)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Card Form */}
          <Card>
            <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
              {activeEditing ? "Edit Activity Card" : "Add Activity Card"}
            </h3>
            <Field label="Card Title (English)">
              <Input value={activeForm.title} onChange={e => setActive("title", e.target.value)} placeholder="e.g. Youth Fellowship" />
            </Field>
            <Field label="Card Title (Tamil)">
              <Input value={activeForm.titleTa} onChange={e => setActive("titleTa", e.target.value)} placeholder="எ.கா. இளைஞர் ஐக்கியம்" />
            </Field>
            <Field label="Description (English)">
              <Textarea rows={3} value={activeForm.description} onChange={e => setActive("description", e.target.value)} />
            </Field>
            <Field label="Description (Tamil)">
              <Textarea rows={3} value={activeForm.descriptionTa} onChange={e => setActive("descriptionTa", e.target.value)} />
            </Field>
            <Field label="Display Order">
              <Input type="number" value={String(activeForm.order)} onChange={e => setActive("order", parseInt(e.target.value) || 0)} />
            </Field>
            <div className="mb-4">
              <ImageUploader label="Card Image" currentUrl={activeForm.imageUrl} folder="activity" onUploaded={url => setActive("imageUrl", url)} />
            </div>
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={activeForm.active} onChange={e => setActive("active", e.target.checked)} className="accent-amber-500" />
              <span className="font-lato text-[13px] text-stone-600">Active</span>
            </label>
            <div className="flex gap-2">
              <SaveButton loading={activeSaving} label={activeEditing ? "Update" : "Add"} onClick={saveActive} />
              {activeEditing && (
                <button onClick={cancelActive} className="font-lato text-[11px] text-stone-400 hover:text-stone-700 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Events Section ── */}
      <div>
        <h2 className="font-playfair text-[20px] font-bold text-stone-800 mb-4">Upcoming Events list</h2>
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 340px" }}>
          {/* Form */}
          <Card>
            <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
              {editing ? "Edit Event" : "Add New Event"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Title (English)">
                <Input value={form.title} onChange={e => set("title", e.target.value)} />
              </Field>
              <Field label="Title (Tamil)">
                <Input value={form.titleTa} onChange={e => set("titleTa", e.target.value)} />
              </Field>
              <Field label="Date">
                <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
              </Field>
              <Field label="Display Order">
                <Input type="number" value={String(form.order ?? 0)} onChange={e => set("order", parseInt(e.target.value) || 0)} />
              </Field>
              <Field label="Time (English)">
                <Input value={form.time} onChange={e => set("time", e.target.value)} placeholder="e.g. 9:00 AM" />
              </Field>
              <Field label="Time (Tamil)">
                <Input value={form.timeTa} onChange={e => set("timeTa", e.target.value)} placeholder="எ.கா. காலை 9:00 மணி" />
              </Field>
              <Field label="Location (English)">
                <Input value={form.location} onChange={e => set("location", e.target.value)} />
              </Field>
              <Field label="Location (Tamil)">
                <Input value={form.locationTa} onChange={e => set("locationTa", e.target.value)} />
              </Field>
            </div>
            <Field label="Description (English)">
              <Textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} />
            </Field>
            <Field label="Description (Tamil)">
              <Textarea rows={3} value={form.descriptionTa} onChange={e => set("descriptionTa", e.target.value)} />
            </Field>
            <div className="mb-4">
              <ImageUploader label="Event Image" currentUrl={form.imageUrl} folder="events" onUploaded={url => set("imageUrl", url)} />
            </div>
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={form.featured as boolean} onChange={e => set("featured", e.target.checked)} className="accent-amber-500" />
              <span className="font-lato text-[13px] text-stone-600">Featured on homepage</span>
            </label>
            <div className="flex gap-3">
              <SaveButton loading={saving} label={editing ? "Update Event" : "Create Event"} onClick={save} />
              {editing && (
                <button onClick={cancelEdit} className="font-lato text-[11px] text-stone-500 hover:text-stone-800 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </Card>

          {/* Events list */}
          <Card>
            <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
              All Events ({events.length})
            </h3>
            {events.length === 0 && (
              <p className="font-lato text-[13px] text-stone-400">No events yet.</p>
            )}
            <div className="flex flex-col gap-3">
              {events.map(ev => (
                <div key={ev.id} className="flex items-center justify-between border border-stone-200 px-4 py-3 bg-stone-50/50">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="font-lato text-[14px] font-bold text-stone-900 truncate">
                      {ev.title} / {ev.titleTa || "(No Tamil Title)"}
                    </p>
                    <p className="font-lato text-[12px] text-stone-400">
                      {ev.date?.slice(0, 10)} {ev.time && `· ${ev.time}`} {ev.order !== undefined && `· Order: ${ev.order}`}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEdit(ev)}
                      className="font-lato text-[11px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-3 py-1.5 rounded-sm hover:bg-stone-200 transition-colors">
                      Edit
                    </button>
                    <DangerButton onClick={() => del(ev.id)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
