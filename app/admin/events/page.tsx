"use client";

import { useEffect, useState, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  AdminPageHeader, Card, CardSection, Field, Input, Textarea,
  SaveButton, DangerButton, Toast,
} from "@/components/admin/AdminUI";

type Ev = {
  id: string; title: string; description: string; date: string;
  time: string; location: string; imageUrl: string; featured: boolean; active: boolean;
};

const EMPTY: Omit<Ev, "id"> = {
  title: "", description: "", date: "", time: "", location: "", imageUrl: "", featured: false, active: true,
};

type S = Record<string, string>;
const EVENTS_PAGE_KEYS = [
  "events_banner_image",
  "activity_fellowship_image", "activity_retreat_image", "activity_evangelical_image",
];

export default function AdminEvents() {
  const [events, setEvents]     = useState<Ev[]>([]);
  const [settings, setSettings] = useState<S>({});
  const [form, setForm]       = useState<Omit<Ev,"id"> & { id?: string }>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r = await fetch("/api/cms/events");
    setEvents(await r.json());
  }, []);

  const loadSettings = useCallback(async () => {
    const r = await fetch("/api/cms/settings");
    const all: { key: string; value: string }[] = await r.json();
    const map: S = {};
    EVENTS_PAGE_KEYS.forEach(k => { map[k] = all.find(s => s.key === k)?.value ?? ""; });
    setSettings(map);
  }, []);

  useEffect(() => { load(); loadSettings(); }, [load, loadSettings]);

  const setSettingValue = (key: string, value: string) =>
    setSettings(s => ({ ...s, [key]: value }));

  async function saveSetting(key: string) {
    await fetch("/api/cms/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: settings[key], group: "events", type: "image" }),
    });
    showToast("Saved");
  }

  function startEdit(ev: Ev) {
    setEditing(ev.id);
    setForm({ ...ev, date: ev.date?.slice(0, 10) ?? "" });
  }

  function cancelEdit() { setEditing(null); setForm(EMPTY); }

  async function save() {
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    await fetch("/api/cms/events", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    cancelEdit();
    load();
    showToast(editing ? "Event updated" : "Event created");
  }

  async function del(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch("/api/cms/events", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
    showToast("Deleted");
  }

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminPageHeader title="Events" description="Create, edit and delete events. All changes appear instantly on Homepage Calendar, Events Page, and Upcoming Events." />

      {/* Events Page Images */}
      <Card className="mb-6">
        <CardSection title="Events Page Banner">
          <ImageUploader
            label="Events Page Banner Image"
            currentUrl={settings.events_banner_image}
            folder="events"
            onUploaded={url => { setSettingValue("events_banner_image", url); saveSetting("events_banner_image"); }}
          />
        </CardSection>
        <CardSection title="We Stay Active — Activity Images">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ImageUploader
              label="Fellowship Groups"
              currentUrl={settings.activity_fellowship_image}
              folder="activity"
              onUploaded={url => { setSettingValue("activity_fellowship_image", url); saveSetting("activity_fellowship_image"); }}
            />
            <ImageUploader
              label="Church Retreat"
              currentUrl={settings.activity_retreat_image}
              folder="activity"
              onUploaded={url => { setSettingValue("activity_retreat_image", url); saveSetting("activity_retreat_image"); }}
            />
            <ImageUploader
              label="Evangelical Sunday"
              currentUrl={settings.activity_evangelical_image}
              folder="activity"
              onUploaded={url => { setSettingValue("activity_evangelical_image", url); saveSetting("activity_evangelical_image"); }}
            />
          </div>
        </CardSection>
      </Card>

      {/* Form */}
      <Card className="mb-6">
        <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest
                       text-stone-500 mb-5">
          {editing ? "Edit Event" : "Add New Event"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title">
            <Input value={form.title} onChange={e => set("title", e.target.value)} />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          </Field>
          <Field label="Time">
            <Input value={form.time} onChange={e => set("time", e.target.value)} placeholder="e.g. 9:00 AM" />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={e => set("location", e.target.value)} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)} />
        </Field>
        <div className="mb-4">
          <ImageUploader label="Event Image" currentUrl={form.imageUrl} folder="events"
            onUploaded={url => set("imageUrl", url)} />
        </div>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={form.featured as boolean}
            onChange={e => set("featured", e.target.checked)}
            className="accent-amber-500" />
          <span className="font-lato text-[13px] text-stone-600">Featured on homepage</span>
        </label>
        <div className="flex gap-3">
          <SaveButton loading={saving} label={editing ? "Update Event" : "Create Event"} onClick={save} />
          {editing && (
            <button onClick={cancelEdit}
              className="font-lato text-[11px] text-stone-500 hover:text-stone-800 transition-colors">
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
            <div key={ev.id}
              className="flex items-center justify-between border border-stone-200 px-4 py-3">
              <div>
                <p className="font-lato text-[14px] font-bold text-stone-900">{ev.title}</p>
                <p className="font-lato text-[12px] text-stone-400">
                  {ev.date?.slice(0, 10)} {ev.time && `· ${ev.time}`} {ev.location && `· ${ev.location}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(ev)}
                  className="font-lato text-[11px] font-bold uppercase tracking-wider
                             bg-stone-100 text-stone-700 px-3 py-1.5 rounded-sm
                             hover:bg-stone-200 transition-colors">
                  Edit
                </button>
                <DangerButton onClick={() => del(ev.id)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {toast && <Toast message={toast} />}
    </div>
  );
}
