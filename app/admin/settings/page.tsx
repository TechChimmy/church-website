"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AdminPageHeader, Card, CardSection, Field, Input,
  Textarea, SaveButton, Toast,
} from "@/components/admin/AdminUI";

type Setting = { id: string; key: string; value: string; label: string; group: string; type: string };

const GROUP_LABELS: Record<string,string> = {
  general:  "Church Information",
  about:    "About Page",
  shepherd: "Our Shepherd",
  doctrine: "Our Doctrine",
  events:   "Events Page",
  activity: "We Stay Active",
  homepage: "Homepage",
  youtube:  "YouTube Integration",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [saving, setSaving]     = useState<string | null>(null);
  const [toast, setToast]       = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r = await fetch("/api/cms/settings");
    setSettings(await r.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(key: string, value: string) {
    setSaving(key);
    await fetch("/api/cms/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSaving(null);
    showToast("Saved");
  }

  function update(key: string, value: string) {
    setSettings(s => s.map(x => x.key === key ? { ...x, value } : x));
  }

  // Group settings
  const groups = Array.from(new Set(settings.map(s => s.group)));

  return (
    <div>
      <AdminPageHeader title="Site Settings"
        description="Edit church contact information, map, and global settings." />

      {groups.map(group => (
        <Card key={group} className="mb-5">
          <CardSection title={GROUP_LABELS[group] ?? group}>
            {settings.filter(s => s.group === group).map(s => (
              <div key={s.key} className="mb-5 last:mb-0">
                <Field label={s.label}>
                  {s.type === "textarea" ? (
                    <Textarea rows={4} value={s.value}
                      onChange={e => update(s.key, e.target.value)} />
                  ) : (
                    <Input
                      type={s.type === "url" ? "url" : "text"}
                      value={s.value}
                      onChange={e => update(s.key, e.target.value)}
                    />
                  )}
                </Field>
                <SaveButton
                  loading={saving === s.key}
                  onClick={() => save(s.key, s.value)}
                />
              </div>
            ))}
          </CardSection>
        </Card>
      ))}

      {toast && <Toast message={toast} />}
    </div>
  );
}
