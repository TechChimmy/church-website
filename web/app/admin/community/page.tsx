"use client";

import { useEffect, useState, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  AdminPageHeader, Card, Field, Input, Textarea,
  SaveButton, DangerButton, Toast,
} from "@/components/admin/AdminUI";
import Image from "next/image";

type T = { id: string; name: string; nameTa: string; body: string; bodyTa: string; imageUrl: string; order: number; active: boolean };
const EMPTY: Omit<T,"id"> = { name:"", nameTa:"", body:"", bodyTa:"", imageUrl:"", order:0, active:true };

export default function AdminCommunity() {
  const [items, setItems]     = useState<T[]>([]);
  const [form, setForm]       = useState<Omit<T,"id"> & { id?: string }>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r = await fetch("/api/cms/testimonials");
    setItems(await r.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(t: T) { setEditing(t.id); setForm({ ...t }); }
  function cancel() { setEditing(null); setForm(EMPTY); }

  async function save() {
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    await fetch("/api/cms/testimonials", {
      method, headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body),
    });
    setSaving(false); cancel(); load();
    showToast(editing ? "Updated" : "Added");
  }

  async function del(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch("/api/cms/testimonials", {
      method:"DELETE", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id }),
    });
    load(); showToast("Deleted");
  }

  const set = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminPageHeader title="Community Testimonials"
        description="Manage the testimonials shown on the Our Community slider." />

      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns:"1fr 1fr", alignItems:"start" }}>
        {/* List */}
        <div className="flex flex-col gap-4">
          {items.length === 0 && (
            <Card><p className="font-lato text-[13px] text-stone-400">No testimonials yet.</p></Card>
          )}
          {items.map(t => (
            <Card key={t.id}>
              <div className="flex items-start gap-3 mb-3">
                {t.imageUrl ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 relative">
                    <Image src={t.imageUrl} alt={t.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-stone-200 shrink-0 flex items-center
                                  justify-center font-playfair text-[14px] text-stone-500 font-bold">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-lato font-bold text-[14px] text-stone-900">
                    {t.name} / {t.nameTa || "(No Tamil Name)"}
                  </p>
                  <p className="font-lato text-[12px] text-stone-500 line-clamp-2 mt-0.5">{t.body}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(t)}
                  className="font-lato text-[11px] font-bold uppercase tracking-wider
                             bg-stone-100 text-stone-700 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                  Edit
                </button>
                <DangerButton onClick={() => del(t.id)} />
              </div>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card>
          <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
            {editing ? "Edit Testimonial" : "Add Testimonial"}
          </h3>
          <Field label="Name (English)">
            <Input value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="e.g. Blake & Kay" />
          </Field>
          <Field label="Name (Tamil)">
            <Input value={form.nameTa} onChange={e => set("nameTa", e.target.value)}
              placeholder="எ.கா. பிளேக் & கே" />
          </Field>
          <Field label="Testimonial (English)">
            <Textarea rows={4} value={form.body} onChange={e => set("body", e.target.value)} />
          </Field>
          <Field label="Testimonial (Tamil)">
            <Textarea rows={4} value={form.bodyTa} onChange={e => set("bodyTa", e.target.value)} />
          </Field>
          <Field label="Display Order">
            <Input type="number" value={String(form.order)}
              onChange={e => set("order", parseInt(e.target.value)||0)} />
          </Field>
          <div className="mb-4">
            <ImageUploader label="Profile Photo (optional)" currentUrl={form.imageUrl}
              folder="testimonials" onUploaded={url => set("imageUrl", url)} />
          </div>
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
