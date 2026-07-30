"use client";

import { useEffect, useState, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  AdminPageHeader, Card, Field, Input,
  SaveButton, DangerButton, Toast,
} from "@/components/admin/AdminUI";
import Image from "next/image";

type G = { id: string; title: string; imageUrl: string; order: number; active: boolean };
const EMPTY: Omit<G,"id"> = { title: "", imageUrl: "", order: 0, active: true };

export default function AdminGallery() {
  const [items, setItems]     = useState<G[]>([]);
  const [form, setForm]       = useState<Omit<G,"id"> & { id?: string }>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r = await fetch("/api/cms/gallery");
    setItems(await r.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(g: G) { setEditing(g.id); setForm({ ...g }); }
  function cancel() { setEditing(null); setForm(EMPTY); }

  async function save() {
    if (!form.imageUrl) {
      alert("Image file is required.");
      return;
    }
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    await fetch("/api/cms/gallery", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false); cancel(); load();
    showToast(editing ? "Image updated" : "Image added");
  }

  async function del(id: string) {
    if (!confirm("Delete this gallery image?")) return;
    await fetch("/api/cms/gallery", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load(); showToast("Deleted");
  }

  const set = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminPageHeader title="Gallery Manager"
        description="Add, edit, delete, and reorder images shown in the media galleries." />

      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
        {/* List */}
        <div className="flex flex-col gap-4">
          {items.length === 0 && (
            <Card><p className="font-lato text-[13px] text-stone-400">No gallery images found.</p></Card>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(g => (
              <Card key={g.id} className="flex flex-col justify-between">
                <div>
                  {g.imageUrl ? (
                    <div className="w-full h-36 relative overflow-hidden rounded-sm mb-3">
                      <Image src={g.imageUrl} alt={g.title || "Gallery Image"} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-36 bg-stone-100 rounded-sm mb-3 flex items-center justify-center font-lato text-stone-400 text-[12px]">
                      No Image Uploaded
                    </div>
                  )}
                  <p className="font-lato font-bold text-[14px] text-stone-900 truncate">
                    {g.title || "Untitled"} {!g.active && <span className="text-[11px] text-red-500 italic">(Inactive)</span>}
                  </p>
                  <p className="font-lato text-[11px] text-stone-400 mt-0.5">Order: {g.order}</p>
                </div>
                <div className="flex gap-2 mt-4 pt-2 border-t border-stone-100">
                  <button onClick={() => startEdit(g)}
                    className="font-lato text-[11px] font-bold uppercase tracking-wider
                               bg-stone-100 text-stone-700 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                    Edit
                  </button>
                  <DangerButton onClick={() => del(g.id)} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Form */}
        <Card>
          <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
            {editing ? "Edit Gallery Image" : "Add Gallery Image"}
          </h3>
          <Field label="Image Caption / Title">
            <Input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. Sunday Fellowship Gathering" />
          </Field>
          <Field label="Display Order">
            <Input type="number" value={String(form.order)}
              onChange={e => set("order", parseInt(e.target.value) || 0)} />
          </Field>
          <div className="mb-4">
            <ImageUploader label="Upload Image" currentUrl={form.imageUrl}
              folder="general" onUploaded={url => set("imageUrl", url)} />
          </div>
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={form.active}
              onChange={e => set("active", e.target.checked)}
              className="accent-amber-500" />
            <span className="font-lato text-[13px] text-stone-600">Active (Visible)</span>
          </label>
          <div className="flex gap-2">
            <SaveButton loading={saving} label={editing ? "Update" : "Add Image"} onClick={save} />
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
