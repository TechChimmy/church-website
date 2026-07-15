"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AdminPageHeader, Card, Field, Input, Textarea,
  SaveButton, DangerButton, Toast,
} from "@/components/admin/AdminUI";

type A = { id: string; title: string; titleTa: string; content: string; contentTa: string; date: string; active: boolean };
const EMPTY: Omit<A,"id"> = { title: "", titleTa: "", content: "", contentTa: "", date: new Date().toISOString().slice(0, 10), active: true };

export default function AdminAnnouncements() {
  const [items, setItems]     = useState<A[]>([]);
  const [form, setForm]       = useState<Omit<A,"id"> & { id?: string }>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r = await fetch("/api/cms/announcements");
    setItems(await r.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(a: A) { setEditing(a.id); setForm({ ...a, date: a.date ? a.date.slice(0, 10) : new Date().toISOString().slice(0, 10) }); }
  function cancel() { setEditing(null); setForm(EMPTY); }

  async function save() {
    if (!form.title.trim()) {
      alert("Title is required.");
      return;
    }
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    await fetch("/api/cms/announcements", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false); cancel(); load();
    showToast(editing ? "Announcement updated" : "Announcement added");
  }

  async function del(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch("/api/cms/announcements", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load(); showToast("Deleted");
  }

  const set = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminPageHeader title="Announcements Manager"
        description="Add, edit, delete, and control visibility of site announcements." />

      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
        {/* List */}
        <div className="flex flex-col gap-4">
          {items.length === 0 && (
            <Card><p className="font-lato text-[13px] text-stone-400">No announcements found.</p></Card>
          )}
          {items.map(a => (
            <Card key={a.id}>
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="min-w-0 flex-1 pr-4">
                  <h4 className="font-lato font-bold text-[15px] text-stone-900 truncate">
                    {a.title} / {a.titleTa || "(No Tamil Title)"} {!a.active && <span className="text-[11px] text-red-500 italic">(Inactive)</span>}
                  </h4>
                  <p className="font-lato text-[11px] text-stone-400 mt-0.5">
                    Date: {a.date ? new Date(a.date).toLocaleDateString("en-IN") : "No Date"}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(a)}
                    className="font-lato text-[11px] font-bold uppercase tracking-wider
                               bg-stone-100 text-stone-700 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                    Edit
                  </button>
                  <DangerButton onClick={() => del(a.id)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-stone-100">
                <div>
                  <p className="font-lato text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1">English Content</p>
                  <p className="font-lato text-[13px] text-stone-600 bg-stone-50/50 p-3 border border-stone-100 rounded-sm whitespace-pre-wrap">{a.content}</p>
                </div>
                <div>
                  <p className="font-lato text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1">Tamil Content</p>
                  <p className="font-lato text-[13px] text-stone-600 bg-stone-50/50 p-3 border border-stone-100 rounded-sm whitespace-pre-wrap">{a.contentTa || "(No Tamil Content)"}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card>
          <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
            {editing ? "Edit Announcement" : "Add Announcement"}
          </h3>
          <Field label="Announcement Title (English)">
            <Input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. Special Revival Meeting" />
          </Field>
          <Field label="Announcement Title (Tamil)">
            <Input value={form.titleTa} onChange={e => set("titleTa", e.target.value)}
              placeholder="எ.கா. சிறப்பு எழுப்புதல் கூட்டம்" />
          </Field>
          <Field label="Publish Date">
            <Input type="date" value={form.date ?? ""} onChange={e => set("date", e.target.value)} />
          </Field>
          <Field label="Content / Details (English)">
            <Textarea rows={4} value={form.content} onChange={e => set("content", e.target.value)}
              placeholder="Write the details here..." />
          </Field>
          <Field label="Content / Details (Tamil)">
            <Textarea rows={4} value={form.contentTa} onChange={e => set("contentTa", e.target.value)}
              placeholder="விவரங்களை இங்கே எழுதவும்..." />
          </Field>
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={form.active}
              onChange={e => set("active", e.target.checked)}
              className="accent-amber-500" />
            <span className="font-lato text-[13px] text-stone-600">Active (Visible)</span>
          </label>
          <div className="flex gap-2">
            <SaveButton loading={saving} label={editing ? "Update" : "Add"} onClick={save} />
            {editing && (
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
