"use client";

import { useEffect, useState, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  AdminPageHeader, Card, CardSection, Field, Input,
  Textarea, SaveButton, DangerButton, Toast,
} from "@/components/admin/AdminUI";

/* ── Hero Slides ── */
type Slide = {
  id: string; title: string; titleTa: string; subtitle: string; subtitleTa: string;
  ctaText: string; ctaHref: string; imageUrl: string; active: boolean; order: number;
};

/* ── Settings ── */
type Settings = Record<string, string>;

const HOMEPAGE_KEYS = [
  "join_us_text", "join_us_text_ta",
  "visit_us_text", "visit_us_text_ta",
  "visit_us_btn_text", "visit_us_btn_text_ta", "visit_us_btn_link",
  "pray_heading", "pray_heading_ta"
];

export default function AdminHomepage() {
  const [slides, setSlides]     = useState<Slide[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [toast, setToast]       = useState("");
  const [saving, setSaving]     = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const loadSlides = useCallback(async () => {
    const r = await fetch("/api/cms/hero"); setSlides(await r.json());
  }, []);

  const loadSettings = useCallback(async () => {
    const r = await fetch("/api/cms/settings");
    const all: { key: string; value: string }[] = await r.json();
    const map: Settings = {};
    HOMEPAGE_KEYS.forEach(k => { map[k] = all.find(s => s.key === k)?.value ?? ""; });
    setSettings(map);
  }, []);

  useEffect(() => { loadSlides(); loadSettings(); }, [loadSlides, loadSettings]);

  async function saveSlide(slide: Slide) {
    setSaving(true);
    await fetch("/api/cms/hero", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slide),
    });
    showToast("Slide saved");
    setSaving(false);
  }

  async function deleteSlide(id: string) {
    if (!confirm("Delete this slide?")) return;
    await fetch("/api/cms/hero", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadSlides();
    showToast("Slide deleted");
  }

  async function addSlide() {
    await fetch("/api/cms/hero", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Slide", titleTa: "", subtitle: "", subtitleTa: "", ctaText: "Learn More", ctaHref: "/", imageUrl: "", order: slides.length }),
    });
    loadSlides();
  }

  async function saveSetting(key: string, value: string) {
    setSaving(true);
    await fetch("/api/cms/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSaving(false);
    showToast("Saved");
  }

  return (
    <div>
      <AdminPageHeader title="Homepage" description="Manage hero slides and homepage text sections." />

      {/* ── Hero Slides ── */}
      <Card className="mb-6">
        <CardSection title="Hero Slides">
          <div className="flex flex-col gap-6">
            {slides.map(slide => (
              <div key={slide.id} className="border border-stone-200 rounded-sm p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Heading (English)">
                    <Input value={slide.title}
                      onChange={e => setSlides(s => s.map(x => x.id === slide.id ? { ...x, title: e.target.value } : x))} />
                  </Field>
                  <Field label="Heading (Tamil)">
                    <Input value={slide.titleTa ?? ""}
                      onChange={e => setSlides(s => s.map(x => x.id === slide.id ? { ...x, titleTa: e.target.value } : x))} />
                  </Field>
                  <Field label="Subtext (English)">
                    <Input value={slide.subtitle}
                      onChange={e => setSlides(s => s.map(x => x.id === slide.id ? { ...x, subtitle: e.target.value } : x))} />
                  </Field>
                  <Field label="Subtext (Tamil)">
                    <Input value={slide.subtitleTa ?? ""}
                      onChange={e => setSlides(s => s.map(x => x.id === slide.id ? { ...x, subtitleTa: e.target.value } : x))} />
                  </Field>
                  <Field label="Button Text">
                    <Input value={slide.ctaText}
                      onChange={e => setSlides(s => s.map(x => x.id === slide.id ? { ...x, ctaText: e.target.value } : x))} />
                  </Field>
                  <Field label="Button Link">
                    <Input value={slide.ctaHref}
                      onChange={e => setSlides(s => s.map(x => x.id === slide.id ? { ...x, ctaHref: e.target.value } : x))} />
                  </Field>
                  <Field label="Display Order">
                    <Input type="number" value={String(slide.order ?? 0)}
                      onChange={e => setSlides(s => s.map(x => x.id === slide.id ? { ...x, order: parseInt(e.target.value) || 0 } : x))} />
                  </Field>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={slide.active ?? true}
                        onChange={e => setSlides(s => s.map(x => x.id === slide.id ? { ...x, active: e.target.checked } : x))}
                        className="accent-amber-500" />
                      <span className="font-lato text-[13px] text-stone-600">Active</span>
                    </label>
                  </div>
                </div>
                <ImageUploader
                  label="Slide Background Image"
                  currentUrl={slide.imageUrl}
                  folder="hero"
                  onUploaded={url => setSlides(s => s.map(x => x.id === slide.id ? { ...x, imageUrl: url } : x))}
                />
                <div className="flex gap-3 mt-4">
                  <SaveButton loading={saving} label="Save Slide" onClick={() => saveSlide(slide)} />
                  <DangerButton onClick={() => deleteSlide(slide.id)} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={addSlide}
            className="mt-4 font-lato text-[12px] font-bold uppercase tracking-widest
                       text-amber-700 hover:text-amber-900 transition-colors">
            + Add Slide
          </button>
        </CardSection>
      </Card>

      {/* ── Join Us / Visit Us text ── */}
      <Card className="mb-6">
        <CardSection title="Join Us Live & Visit Us Section">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field label="Join Us Live Text (English)">
                <Textarea rows={3} value={settings.join_us_text ?? ""}
                  onChange={e => setSettings(s => ({ ...s, join_us_text: e.target.value }))} />
              </Field>
              <SaveButton loading={saving} onClick={() => saveSetting("join_us_text", settings.join_us_text)} />
            </div>
            <div>
              <Field label="Join Us Live Text (Tamil)">
                <Textarea rows={3} value={settings.join_us_text_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, join_us_text_ta: e.target.value }))} />
              </Field>
              <SaveButton loading={saving} onClick={() => saveSetting("join_us_text_ta", settings.join_us_text_ta)} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-100">
            <div>
              <Field label="Visit Us Text (English)">
                <Textarea rows={3} value={settings.visit_us_text ?? ""}
                  onChange={e => setSettings(s => ({ ...s, visit_us_text: e.target.value }))} />
              </Field>
              <SaveButton loading={saving} onClick={() => saveSetting("visit_us_text", settings.visit_us_text)} />
            </div>
            <div>
              <Field label="Visit Us Text (Tamil)">
                <Textarea rows={3} value={settings.visit_us_text_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, visit_us_text_ta: e.target.value }))} />
              </Field>
              <SaveButton loading={saving} onClick={() => saveSetting("visit_us_text_ta", settings.visit_us_text_ta)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-100">
            <div>
              <Field label="Visit Us Button Text (English)">
                <Input value={settings.visit_us_btn_text ?? ""}
                  onChange={e => setSettings(s => ({ ...s, visit_us_btn_text: e.target.value }))} />
              </Field>
              <SaveButton loading={saving} onClick={() => saveSetting("visit_us_btn_text", settings.visit_us_btn_text)} />
            </div>
            <div>
              <Field label="Visit Us Button Text (Tamil)">
                <Input value={settings.visit_us_btn_text_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, visit_us_btn_text_ta: e.target.value }))} />
              </Field>
              <SaveButton loading={saving} onClick={() => saveSetting("visit_us_btn_text_ta", settings.visit_us_btn_text_ta)} />
            </div>
            <div>
              <Field label="Visit Us Button Link (Empty = scroll to footer)">
                <Input value={settings.visit_us_btn_link ?? ""}
                  onChange={e => setSettings(s => ({ ...s, visit_us_btn_link: e.target.value }))} />
              </Field>
              <SaveButton loading={saving} onClick={() => saveSetting("visit_us_btn_link", settings.visit_us_btn_link)} />
            </div>
          </div>
        </CardSection>
      </Card>

      {/* ── Pray With Us ── */}
      <Card>
        <CardSection title="Pray With Us Section">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Section Heading (English)">
              <Input value={settings.pray_heading ?? ""}
                onChange={e => setSettings(s => ({ ...s, pray_heading: e.target.value }))} />
            </Field>
            <Field label="Section Heading (Tamil)">
              <Input value={settings.pray_heading_ta ?? ""}
                onChange={e => setSettings(s => ({ ...s, pray_heading_ta: e.target.value }))} />
            </Field>
          </div>
          <div className="flex gap-3 mt-4">
            <SaveButton loading={saving} label="Save English Heading" onClick={() => saveSetting("pray_heading", settings.pray_heading)} />
            <SaveButton loading={saving} label="Save Tamil Heading" onClick={() => saveSetting("pray_heading_ta", settings.pray_heading_ta)} />
          </div>
        </CardSection>
      </Card>

      {toast && <Toast message={toast} />}
    </div>
  );
}
