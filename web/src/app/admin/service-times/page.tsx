"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AdminPageHeader, Card, Field, Input,
  SaveButton, DangerButton, Toast,
} from "@/components/admin/AdminUI";

type ST = { id: string; title: string; titleTa: string; day: string; dayTa: string; time: string; timeTa: string; order: number; active: boolean };
const EMPTY: Omit<ST,"id"> = { title: "", titleTa: "", day: "Sunday", dayTa: "ஞாயிற்றுக்கிழமை", time: "", timeTa: "", order: 0, active: true };

export default function AdminServiceTimes() {
  const [items, setItems]     = useState<ST[]>([]);
  const [form, setForm]       = useState<Omit<ST,"id"> & { id?: string }>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r = await fetch("/api/cms/service-times");
    setItems(await r.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(st: ST) {
    setEditing(st.id); setForm({ ...st });
  }

  function cancel() { setEditing(null); setForm(EMPTY); }

  async function save() {
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    await fetch("/api/cms/service-times", {
      method, headers: { "Content-Type":"application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false); cancel(); load();
    showToast(editing ? "Updated" : "Added");
  }

  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await fetch("/api/cms/service-times", {
      method:"DELETE", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id }),
    });
    load(); showToast("Deleted");
  }

  const set = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminPageHeader
        title="Service Times"
        description="Manage service times — changes update the Homepage, About, and Join Us Live pages automatically."
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 340px" }}>
        {/* Current services */}
        <Card>
          <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
            Current Service Times ({items.length})
          </h3>
          {items.length === 0 && (
            <p className="font-lato text-[13px] text-stone-400">No service times added yet.</p>
          )}
          <div className="flex flex-col gap-3">
            {items.map(st => (
              <div key={st.id}
                className="flex items-center justify-between border border-stone-200 px-4 py-3">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="font-lato font-bold text-[14px] text-stone-900 truncate">
                    {st.title} / {st.titleTa || "(No Tamil Name)"}
                  </p>
                  <p className="font-lato text-[12px] text-stone-400">
                    {st.day} / {st.dayTa} · {st.time} / {st.timeTa}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(st)}
                    className="font-lato text-[11px] font-bold uppercase tracking-wider
                               bg-stone-100 text-stone-700 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                    Edit
                  </button>
                  <DangerButton onClick={() => del(st.id)} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Form */}
        <Card>
          <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
            {editing ? "Edit Service" : "Add Service"}
          </h3>
          <Field label="Service Name (English)">
            <Input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. Sunday Morning Worship" />
          </Field>
          <Field label="Service Name (Tamil)">
            <Input value={form.titleTa} onChange={e => set("titleTa", e.target.value)}
              placeholder="எ.கா. ஞாயிறு காலை ஆராதனை" />
          </Field>
          <Field label="Day (English)">
            <Input value={form.day} onChange={e => set("day", e.target.value)}
              placeholder="e.g. Sunday" />
          </Field>
          <Field label="Day (Tamil)">
            <Input value={form.dayTa} onChange={e => set("dayTa", e.target.value)}
              placeholder="எ.கா. ஞாயிற்றுக்கிழமை" />
          </Field>
          <Field label="Time (English)">
            <Input value={form.time} onChange={e => set("time", e.target.value)}
              placeholder="e.g. 9:00 AM to 11:00 AM" />
          </Field>
          <Field label="Time (Tamil)">
            <Input value={form.timeTa} onChange={e => set("timeTa", e.target.value)}
              placeholder="எ.கா. காலை 9:00 முதல் 11:00 வரை" />
          </Field>
          <Field label="Display Order">
            <Input type="number" value={String(form.order)}
              onChange={e => set("order", parseInt(e.target.value) || 0)} />
          </Field>
          <div className="flex gap-2 flex-wrap mt-2">
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
