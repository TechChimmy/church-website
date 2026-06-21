"use client";

import { useEffect, useState, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  AdminPageHeader, Card, CardSection, Field, Input,
  Textarea, SaveButton, Toast,
} from "@/components/admin/AdminUI";

type S = Record<string, string>;

const ABOUT_KEYS = [
  "about_heading","about_body","about_image",
  "shepherd_heading","shepherd_body","shepherd_image",
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
          <Field label="Heading">
            <Input value={settings.about_heading ?? ""}
              onChange={e => set("about_heading", e.target.value)} />
          </Field>
          <SaveButton loading={saving === "about_heading"} onClick={() => save("about_heading")} />
          <div className="mt-4">
            <Field label="Body Text">
              <Textarea rows={8} value={settings.about_body ?? ""}
                onChange={e => set("about_body", e.target.value)} />
            </Field>
            <SaveButton loading={saving === "about_body"} onClick={() => save("about_body")} />
          </div>
          <div className="mt-4">
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
          <Field label="Heading">
            <Input value={settings.shepherd_heading ?? ""}
              onChange={e => set("shepherd_heading", e.target.value)} />
          </Field>
          <SaveButton loading={saving === "shepherd_heading"} onClick={() => save("shepherd_heading")} />
          <div className="mt-4">
            <Field label="Bio Text">
              <Textarea rows={8} value={settings.shepherd_body ?? ""}
                onChange={e => set("shepherd_body", e.target.value)} />
            </Field>
            <SaveButton loading={saving === "shepherd_body"} onClick={() => save("shepherd_body")} />
          </div>
          <div className="mt-4">
            <ImageUploader
              label="Shepherd Photo"
              currentUrl={settings.shepherd_image}
              folder="about"
              onUploaded={url => { set("shepherd_image", url); save("shepherd_image"); }}
            />
          </div>
        </CardSection>
      </Card>

      {toast && <Toast message={toast} />}
    </div>
  );
}
