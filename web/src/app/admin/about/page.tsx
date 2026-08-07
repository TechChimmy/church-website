"use client";

import { useEffect, useState, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  AdminPageHeader, Card, CardSection, Field, Input,
  Textarea, SaveButton, Toast,
} from "@/components/admin/AdminUI";

type S = Record<string, string>;

// Keys for static site settings (About Us + Shepherd sections)
const ABOUT_KEYS = [
  "about_hero_title", "about_hero_title_ta",
  "about_hero_subtitle", "about_hero_subtitle_ta",
  "about_heading", "about_heading_ta",
  "about_body", "about_body_ta",
  "about_image",
  "shepherd_heading", "shepherd_heading_ta",
  "shepherd_body", "shepherd_body_ta",
  "shepherd_image",
  "doctrine_heading", "doctrine_heading_ta",
  "doctrine_paragraph", "doctrine_paragraph_ta",
  "community_heading", "community_heading_ta",
];

// ─── Dynamic Doctrine Item type ───────────────────────────────────────────────
interface DoctrineItem {
  _id: string;
  title: string;
  titleTa: string;
  description: string;
  descriptionTa: string;
  imageUrl?: string;
  order: number;
  active: boolean;
}

const EMPTY_ITEM: Omit<DoctrineItem, "_id"> = {
  title: "", titleTa: "", description: "", descriptionTa: "",
  imageUrl: "", order: 0, active: true,
};

// ─── DoctrineItemCard — editable card for one item ───────────────────────────
function DoctrineItemCard({
  item, onSave, onDelete, onImageUploaded,
}: {
  item: DoctrineItem;
  onSave: (updated: DoctrineItem) => void;
  onDelete: () => void;
  onImageUploaded: (url: string) => void;
}) {
  const [draft, setDraft] = useState<DoctrineItem>(item);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (k: keyof DoctrineItem, v: string | number | boolean) =>
    setDraft(d => ({ ...d, [k]: v }));

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/doctrine", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: draft._id,
        title: draft.title, titleTa: draft.titleTa,
        description: draft.description, descriptionTa: draft.descriptionTa,
        order: Number(draft.order), active: draft.active,
      }),
    });
    setSaving(false);
    onSave(draft);
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch("/api/admin/doctrine", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draft._id }),
    });
    setDeleting(false);
    onDelete();
  }

  return (
    <div className="border border-stone-200 rounded-[8px] p-5 bg-white relative"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-lato text-[11px] font-bold uppercase tracking-widest" style={{ color: "#9B8A90" }}>
          {draft.title || "Untitled Item"}
        </p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={draft.active} onChange={e => set("active", e.target.checked)} className="w-3.5 h-3.5 accent-[var(--burgundy)]" />
            <span className="font-lato text-[11px]" style={{ color: "#9B8A90" }}>Active</span>
          </label>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="font-lato text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-[5px] transition-colors"
              style={{ color: "#c53030", border: "1px solid rgba(197,48,48,0.25)" }}>
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <span className="font-lato text-[10px]" style={{ color: "#c53030" }}>Sure?</span>
              <button onClick={handleDelete} disabled={deleting}
                className="font-lato text-[10px] font-bold px-2 py-1 rounded-[5px] text-white transition-colors"
                style={{ backgroundColor: "#c53030" }}>
                {deleting ? "…" : "Yes"}
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="font-lato text-[10px] px-2 py-1 rounded-[5px]"
                style={{ border: "1px solid #ccc", color: "#666" }}>
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image + fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <ImageUploader
            label="Image"
            currentUrl={draft.imageUrl}
            folder="doctrine"
            onUploaded={url => { setDraft(d => ({ ...d, imageUrl: url })); onImageUploaded(url); }}
          />
          <div className="mt-3">
            <Field label="Display Order">
              <Input type="number" value={String(draft.order)} onChange={e => set("order", e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Title (English)">
            <Input value={draft.title} onChange={e => set("title", e.target.value)} />
          </Field>
          <Field label="Title (Tamil)">
            <Input value={draft.titleTa} onChange={e => set("titleTa", e.target.value)} />
          </Field>
          <Field label="Description (English)">
            <Textarea rows={4} value={draft.description} onChange={e => set("description", e.target.value)} />
          </Field>
          <Field label="Description (Tamil)">
            <Textarea rows={4} value={draft.descriptionTa} onChange={e => set("descriptionTa", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <SaveButton loading={saving} onClick={handleSave} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAbout() {
  const [settings, setSettings] = useState<S>({});
  const [saving, setSaving]     = useState<string | null>(null);
  const [toast, setToast]       = useState("");

  // Dynamic doctrine items state
  const [docItems, setDocItems]   = useState<DoctrineItem[]>([]);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [creating, setCreating]   = useState(false);
  const [newItem, setNewItem]     = useState<Omit<DoctrineItem, "_id">>(EMPTY_ITEM);
  const [addingNew, setAddingNew] = useState(false);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  // Load static settings
  const load = useCallback(async () => {
    const r   = await fetch("/api/cms/settings");
    const all: { key: string; value: string }[] = await r.json();
    const map: S = {};
    ABOUT_KEYS.forEach(k => { map[k] = all.find(s => s.key === k)?.value ?? ""; });
    setSettings(map);
  }, []);

  // Load dynamic doctrine items
  const loadDocItems = useCallback(async () => {
    setLoadingDoc(true);
    const r = await fetch("/api/admin/doctrine");
    if (r.ok) setDocItems(await r.json());
    setLoadingDoc(false);
  }, []);

  useEffect(() => { load(); loadDocItems(); }, [load, loadDocItems]);

  // Save a static setting key
  async function save(key: string) {
    setSaving(key);
    await fetch("/api/cms/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: settings[key] }),
    });
    setSaving(null);
    showToast("Saved");
  }

  const set = (key: string, value: string) =>
    setSettings(s => ({ ...s, [key]: value }));

  // Create new doctrine item
  async function handleCreate() {
    if (!newItem.title.trim()) { showToast("Title is required"); return; }
    setCreating(true);
    const r = await fetch("/api/admin/doctrine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (r.ok) {
      setNewItem(EMPTY_ITEM);
      setAddingNew(false);
      showToast("Item created");
      await loadDocItems();
    }
    setCreating(false);
  }

  return (
    <div>
      <AdminPageHeader title="About Page" description="Edit About Us content, shepherd bio, and doctrine items." />

      {/* ── About Us ─────────────────────────────────────── */}
      <Card className="mb-6">
        <CardSection title="About Page Hero & Banner">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field label="Hero Title (English)">
                <Input value={settings.about_hero_title ?? ""} onChange={e => set("about_hero_title", e.target.value)} placeholder="About Us" />
              </Field>
              <SaveButton loading={saving === "about_hero_title"} onClick={() => save("about_hero_title")} />
            </div>
            <div>
              <Field label="Hero Title (Tamil)">
                <Input value={settings.about_hero_title_ta ?? ""} onChange={e => set("about_hero_title_ta", e.target.value)} placeholder="எங்களைப் பற்றி" />
              </Field>
              <SaveButton loading={saving === "about_hero_title_ta"} onClick={() => save("about_hero_title_ta")} />
            </div>
            <div>
              <Field label="Hero Subtitle / Tagline (English)">
                <Input value={settings.about_hero_subtitle ?? ""} onChange={e => set("about_hero_subtitle", e.target.value)} placeholder="Christian Fellowship Church" />
              </Field>
              <SaveButton loading={saving === "about_hero_subtitle"} onClick={() => save("about_hero_subtitle")} />
            </div>
            <div>
              <Field label="Hero Subtitle / Tagline (Tamil)">
                <Input value={settings.about_hero_subtitle_ta ?? ""} onChange={e => set("about_hero_subtitle_ta", e.target.value)} placeholder="கிறிஸ்தவ ஐக்கிய சபை" />
              </Field>
              <SaveButton loading={saving === "about_hero_subtitle_ta"} onClick={() => save("about_hero_subtitle_ta")} />
            </div>
          </div>
        </CardSection>
      </Card>

      <Card className="mb-6">
        <CardSection title="About Us Section">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field label="Heading (English)">
                <Input value={settings.about_heading ?? ""} onChange={e => set("about_heading", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "about_heading"} onClick={() => save("about_heading")} />
            </div>
            <div>
              <Field label="Heading (Tamil)">
                <Input value={settings.about_heading_ta ?? ""} onChange={e => set("about_heading_ta", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "about_heading_ta"} onClick={() => save("about_heading_ta")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-100">
            <div>
              <Field label="Body Text (English)">
                <Textarea rows={6} value={settings.about_body ?? ""} onChange={e => set("about_body", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "about_body"} onClick={() => save("about_body")} />
            </div>
            <div>
              <Field label="Body Text (Tamil)">
                <Textarea rows={6} value={settings.about_body_ta ?? ""} onChange={e => set("about_body_ta", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "about_body_ta"} onClick={() => save("about_body_ta")} />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-stone-100">
            <ImageUploader label="About Section Image" currentUrl={settings.about_image} folder="about"
              onUploaded={url => { set("about_image", url); save("about_image"); }} />
          </div>
        </CardSection>
      </Card>

      {/* ── Our Shepherd ─────────────────────────────────── */}
      <Card className="mb-6">
        <CardSection title="Our Shepherd Section">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field label="Heading (English)">
                <Input value={settings.shepherd_heading ?? ""} onChange={e => set("shepherd_heading", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "shepherd_heading"} onClick={() => save("shepherd_heading")} />
            </div>
            <div>
              <Field label="Heading (Tamil)">
                <Input value={settings.shepherd_heading_ta ?? ""} onChange={e => set("shepherd_heading_ta", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "shepherd_heading_ta"} onClick={() => save("shepherd_heading_ta")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-100">
            <div>
              <Field label="Bio Text (English)">
                <Textarea rows={6} value={settings.shepherd_body ?? ""} onChange={e => set("shepherd_body", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "shepherd_body"} onClick={() => save("shepherd_body")} />
            </div>
            <div>
              <Field label="Bio Text (Tamil)">
                <Textarea rows={6} value={settings.shepherd_body_ta ?? ""} onChange={e => set("shepherd_body_ta", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "shepherd_body_ta"} onClick={() => save("shepherd_body_ta")} />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-stone-100">
            <ImageUploader label="Shepherd Photo" currentUrl={settings.shepherd_image} folder="about"
              onUploaded={url => { set("shepherd_image", url); save("shepherd_image"); }} />
          </div>
        </CardSection>
      </Card>

      {/* ── Our Doctrine ─────────────────────────────────── */}
      <Card className="mb-6">
        <CardSection title="Our Doctrine — Section Intro">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field label="Section Heading (English)">
                <Input value={settings.doctrine_heading ?? ""} onChange={e => set("doctrine_heading", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "doctrine_heading"} onClick={() => save("doctrine_heading")} />
            </div>
            <div>
              <Field label="Section Heading (Tamil)">
                <Input value={settings.doctrine_heading_ta ?? ""} onChange={e => set("doctrine_heading_ta", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "doctrine_heading_ta"} onClick={() => save("doctrine_heading_ta")} />
            </div>
            <div>
              <Field label="Intro Paragraph (English)">
                <Textarea rows={4} value={settings.doctrine_paragraph ?? ""} onChange={e => set("doctrine_paragraph", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "doctrine_paragraph"} onClick={() => save("doctrine_paragraph")} />
            </div>
            <div>
              <Field label="Intro Paragraph (Tamil)">
                <Textarea rows={4} value={settings.doctrine_paragraph_ta ?? ""} onChange={e => set("doctrine_paragraph_ta", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "doctrine_paragraph_ta"} onClick={() => save("doctrine_paragraph_ta")} />
            </div>
          </div>
        </CardSection>
      </Card>

      {/* ── Our Community Section ───────────────────────────── */}
      <Card className="mb-6">
        <CardSection title="Our Community — Section Heading">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field label="Section Heading (English)">
                <Input value={settings.community_heading ?? ""} onChange={e => set("community_heading", e.target.value)} placeholder="Our Community" />
              </Field>
              <SaveButton loading={saving === "community_heading"} onClick={() => save("community_heading")} />
            </div>
            <div>
              <Field label="Section Heading (Tamil)">
                <Input value={settings.community_heading_ta ?? ""} onChange={e => set("community_heading_ta", e.target.value)} placeholder="எங்கள் சமூகம்" />
              </Field>
              <SaveButton loading={saving === "community_heading_ta"} onClick={() => save("community_heading_ta")} />
            </div>
          </div>
        </CardSection>
      </Card>

      {/* ── Doctrine Items (dynamic) ──────────────────────── */}
      <div className="mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-playfair text-[18px] font-bold" style={{ color: "var(--text-dark)" }}>
              Our Doctrine Items
            </h2>
            <p className="font-lato text-[12px] mt-0.5" style={{ color: "#9B8A90" }}>
              {docItems.length} item{docItems.length !== 1 ? "s" : ""} — shown on the About page
            </p>
          </div>
          <button
            onClick={() => setAddingNew(v => !v)}
            className="font-lato text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-[7px] transition-all"
            style={{ backgroundColor: "var(--burgundy)", color: "white" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            {addingNew ? "✕ Cancel" : "+ Add New"}
          </button>
        </div>

        {/* Create new form */}
        {addingNew && (
          <div className="mb-4 border-2 rounded-[8px] p-5 bg-white"
            style={{ borderColor: "rgba(140,58,99,0.25)", boxShadow: "0 2px 12px rgba(140,58,99,0.08)" }}>
            <p className="font-lato text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: "var(--burgundy)" }}>
              New Doctrine Item
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <ImageUploader label="Image" folder="doctrine"
                  currentUrl={newItem.imageUrl}
                  onUploaded={url => setNewItem(n => ({ ...n, imageUrl: url }))} />
                <div className="mt-3">
                  <Field label="Display Order">
                    <Input type="number" value={String(newItem.order)}
                      onChange={e => setNewItem(n => ({ ...n, order: Number(e.target.value) }))} />
                  </Field>
                </div>
              </div>
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Title (English) *">
                  <Input value={newItem.title} onChange={e => setNewItem(n => ({ ...n, title: e.target.value }))} />
                </Field>
                <Field label="Title (Tamil)">
                  <Input value={newItem.titleTa} onChange={e => setNewItem(n => ({ ...n, titleTa: e.target.value }))} />
                </Field>
                <Field label="Description (English)">
                  <Textarea rows={4} value={newItem.description} onChange={e => setNewItem(n => ({ ...n, description: e.target.value }))} />
                </Field>
                <Field label="Description (Tamil)">
                  <Textarea rows={4} value={newItem.descriptionTa} onChange={e => setNewItem(n => ({ ...n, descriptionTa: e.target.value }))} />
                </Field>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={handleCreate} disabled={creating}
                className="font-lato text-[11px] font-bold uppercase tracking-widest px-5 py-2 rounded-[7px] transition-opacity"
                style={{ backgroundColor: "var(--burgundy)", color: "white", opacity: creating ? 0.6 : 1 }}>
                {creating ? "Creating…" : "Create Item"}
              </button>
            </div>
          </div>
        )}

        {/* Existing items */}
        {loadingDoc ? (
          <div className="text-center py-10 font-lato text-[13px]" style={{ color: "#9B8A90" }}>Loading items…</div>
        ) : docItems.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-[8px]">
            <p className="font-lato text-[13px]" style={{ color: "#9B8A90" }}>No doctrine items yet. Click "+ Add New" to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {docItems.map(item => (
              <DoctrineItemCard
                key={item._id}
                item={item}
                onSave={updated => {
                  setDocItems(items => items.map(i => i._id === updated._id ? updated : i));
                  showToast("Saved");
                }}
                onDelete={() => {
                  setDocItems(items => items.filter(i => i._id !== item._id));
                  showToast("Deleted");
                }}
                onImageUploaded={() => showToast("Image uploaded")}
              />
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
