"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AdminPageHeader, Card, CardSection, Field, Input,
  SaveButton, Toast,
} from "@/components/admin/AdminUI";

export default function AdminJoinUsLive() {
  const [channelId, setChannelId] = useState("");
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r   = await fetch("/api/cms/settings");
    const all: { key: string; value: string }[] = await r.json();
    setChannelId(all.find(s => s.key === "youtube_channel_id")?.value ?? "");
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    await fetch("/api/cms/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "youtube_channel_id", value: channelId }),
    });
    setSaving(false);
    showToast("Channel ID saved — live detection will update automatically.");
  }

  return (
    <div>
      <AdminPageHeader
        title="Join Us Live"
        description="Configure the YouTube channel. The website auto-detects live streams and latest sermons."
      />

      <Card className="mb-6">
        <CardSection title="YouTube Channel Settings">
          <Field
            label="YouTube Channel ID"
            hint="Found in your YouTube channel URL: youtube.com/channel/UC_xxxxxxxxx"
          >
            <Input
              value={channelId}
              onChange={e => setChannelId(e.target.value)}
              placeholder="UCxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </Field>
          <SaveButton loading={saving} onClick={save} />
        </CardSection>
      </Card>

      <Card>
        <CardSection title="How It Works">
          <ul className="font-lato text-[13px] text-stone-500 space-y-2 list-disc list-inside">
            <li>When your channel goes live, the website automatically shows the live stream.</li>
            <li>When not live, the latest uploaded sermon appears automatically.</li>
            <li>The 4 most recent sermons are shown in the Previous Sermons row.</li>
            <li>No code changes are ever needed — just update the channel ID above.</li>
            <li>Make sure <code className="bg-stone-100 px-1.5 py-0.5 text-[12px]">YOUTUBE_API_KEY</code> is set in your <code className="bg-stone-100 px-1.5 py-0.5 text-[12px]">.env.local</code> file.</li>
          </ul>
        </CardSection>

        <CardSection title="API Key Setup">
          <ol className="font-lato text-[13px] text-stone-500 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">Google Cloud Console</a></li>
            <li>Enable <strong>YouTube Data API v3</strong></li>
            <li>Create an API key under Credentials</li>
            <li>Add <code className="bg-stone-100 px-1.5 py-0.5 text-[12px]">YOUTUBE_API_KEY=your_key</code> to .env.local</li>
            <li>Redeploy the website</li>
          </ol>
        </CardSection>
      </Card>

      {toast && <Toast message={toast} />}
    </div>
  );
}
