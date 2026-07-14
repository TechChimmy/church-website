"use client";

import { useEffect, useState, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  AdminPageHeader, Card, CardSection, Field, Input,
  Textarea, SaveButton, Toast,
} from "@/components/admin/AdminUI";

type S = Record<string, string>;

const ABOUT_KEYS = [
  "about_heading", "about_heading_ta",
  "about_body", "about_body_ta",
  "about_image",
  "shepherd_heading", "shepherd_heading_ta",
  "shepherd_body", "shepherd_body_ta",
  "shepherd_image",
  "doctrine_word_image","doctrine_faith_image","doctrine_spirit_image","doctrine_church_image",
];

export default function AdminAbout() {
  const [settings, setSettings] = useState<S>({});
  const [saving, setSaving]     = useState<string | null>(null);
  const [toast, setToast]       = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r   = await fetch("/api/cms/settings");
    const all: { key: string; value: string }[] = await r.json();
    const map: S = {};
    ABOUT_KEYS.forEach(k => { map[k] = all.find(s => s.key === k)?.value ?? ""; });
    setSettings(map);
  }, []);

  useEffect(() => { load(); }, [load]);

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

  return (
    <div>
      <AdminPageHeader title="About Page" description="Edit About Us content, shepherd bio and images." />

      {/* About Us */}
      <Card className="mb-6">
        <CardSection title="About Us Section">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field label="Heading (English)">
                <Input value={settings.about_heading ?? ""}
                  onChange={e => set("about_heading", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "about_heading"} onClick={() => save("about_heading")} />
            </div>
            <div>
              <Field label="Heading (Tamil)">
                <Input value={settings.about_heading_ta ?? ""}
                  onChange={e => set("about_heading_ta", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "about_heading_ta"} onClick={() => save("about_heading_ta")} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-100">
            <div>
              <Field label="Body Text (English)">
                <Textarea rows={6} value={settings.about_body ?? ""}
                  onChange={e => set("about_body", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "about_body"} onClick={() => save("about_body")} />
            </div>
            <div>
              <Field label="Body Text (Tamil)">
                <Textarea rows={6} value={settings.about_body_ta ?? ""}
                  onChange={e => set("about_body_ta", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "about_body_ta"} onClick={() => save("about_body_ta")} />
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-stone-100">
            <ImageUploader
              label="About Section Image"
              currentUrl={settings.about_image}
              folder="about"
              onUploaded={url => { set("about_image", url); save("about_image"); }}
            />
          </div>
        </CardSection>
      </Card>

      {/* Our Shepherd */}
      <Card>
        <CardSection title="Our Shepherd Section">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field label="Heading (English)">
                <Input value={settings.shepherd_heading ?? ""}
                  onChange={e => set("shepherd_heading", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "shepherd_heading"} onClick={() => save("shepherd_heading")} />
            </div>
            <div>
              <Field label="Heading (Tamil)">
                <Input value={settings.shepherd_heading_ta ?? ""}
                  onChange={e => set("shepherd_heading_ta", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "shepherd_heading_ta"} onClick={() => save("shepherd_heading_ta")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-100">
            <div>
              <Field label="Bio Text (English)">
                <Textarea rows={6} value={settings.shepherd_body ?? ""}
                  onChange={e => set("shepherd_body", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "shepherd_body"} onClick={() => save("shepherd_body")} />
            </div>
            <div>
              <Field label="Bio Text (Tamil)">
                <Textarea rows={6} value={settings.shepherd_body_ta ?? ""}
                  onChange={e => set("shepherd_body_ta", e.target.value)} />
              </Field>
              <SaveButton loading={saving === "shepherd_body_ta"} onClick={() => save("shepherd_body_ta")} />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-100">
            <ImageUploader
              label="Shepherd Photo"
              currentUrl={settings.shepherd_image}
              folder="about"
              onUploaded={url => { set("shepherd_image", url); save("shepherd_image"); }}
            />
          </div>
        </CardSection>
      </Card>

      {/* Our Doctrine Images */}
      <Card className="mt-6">
        <CardSection title="Our Doctrine Images">
          <p className="font-lato text-[12px] text-stone-400 mb-5">
            Images shown next to each doctrine item on the About page. Each saves automatically once uploaded.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ImageUploader
              label="The Word"
              currentUrl={settings.doctrine_word_image}
              folder="doctrine"
              onUploaded={url => { set("doctrine_word_image", url); save("doctrine_word_image"); }}
            />
            <ImageUploader
              label="The Faith"
              currentUrl={settings.doctrine_faith_image}
              folder="doctrine"
              onUploaded={url => { set("doctrine_faith_image", url); save("doctrine_faith_image"); }}
            />
            <ImageUploader
              label="The Spirit"
              currentUrl={settings.doctrine_spirit_image}
              folder="doctrine"
              onUploaded={url => { set("doctrine_spirit_image", url); save("doctrine_spirit_image"); }}
            />
            <ImageUploader
              label="The Church"
              currentUrl={settings.doctrine_church_image}
              folder="doctrine"
              onUploaded={url => { set("doctrine_church_image", url); save("doctrine_church_image"); }}
            />
          </div>
        </CardSection>
      </Card>

      {toast && <Toast message={toast} />}
    </div>
  );
}
