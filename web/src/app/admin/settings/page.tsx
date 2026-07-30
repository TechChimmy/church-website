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

  const [footerAddress, setFooterAddress] = useState("");
  const [footerAddressTa, setFooterAddressTa] = useState("");
  const [footerPhone, setFooterPhone] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [footerMapEmbed, setFooterMapEmbed] = useState("");
  const [footerSaving, setFooterSaving] = useState(false);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const [resSettings, resFooter] = await Promise.all([
      fetch("/api/cms/settings"),
      fetch("/api/cms/footer")
    ]);
    setSettings(await resSettings.json());

    const footerData = await resFooter.json();
    setFooterAddress(footerData.address || "");
    setFooterAddressTa(footerData.addressTa || "");
    setFooterPhone(footerData.phone || "");
    setFooterEmail(footerData.email || "");
    setFooterMapEmbed(footerData.mapEmbed || "");
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

  async function saveFooter() {
    setFooterSaving(true);
    await fetch("/api/cms/footer", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: footerAddress,
        addressTa: footerAddressTa,
        phone: footerPhone,
        email: footerEmail,
        mapEmbed: footerMapEmbed
      })
    });
    setFooterSaving(false);
    showToast("Footer contact details updated");
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

      {/* ── Footer Contact Information ── */}
      <Card className="mb-5">
        <CardSection title="Footer Contact Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <Field label="Church Address (English)">
              <Textarea rows={3} value={footerAddress} onChange={e => setFooterAddress(e.target.value)} />
            </Field>
            <Field label="Church Address (Tamil)">
              <Textarea rows={3} value={footerAddressTa} onChange={e => setFooterAddressTa(e.target.value)} />
            </Field>
          </div>
          <div className="mb-5">
            <Field label="Church Phone">
              <Input value={footerPhone} onChange={e => setFooterPhone(e.target.value)} />
            </Field>
          </div>
          <div className="mb-5">
            <Field label="Church Email">
              <Input type="email" value={footerEmail} onChange={e => setFooterEmail(e.target.value)} />
            </Field>
          </div>
          <div className="mb-5">
            <Field label="Google Map Embed URL">
              <Input type="url" value={footerMapEmbed} onChange={e => setFooterMapEmbed(e.target.value)} />
            </Field>
          </div>
          <SaveButton loading={footerSaving} onClick={saveFooter} />
        </CardSection>
      </Card>

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
