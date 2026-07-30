"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  AdminPageHeader, Card, CardSection, Field, Input,
  SaveButton, Toast,
} from "@/components/admin/AdminUI";

export default function AdminJoinUsLive() {
  const { lang, t } = useLanguage();
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
    showToast(lang === "ta" ? "சேனல் ஐடி சேமிக்கப்பட்டது!" : "Channel ID saved — live detection will update automatically.");
  }

  return (
    <div>
      <AdminPageHeader
        title={t("admin.joinUsLive")}
        description={lang === "ta" ? "யூடியூப் சேனலை உள்ளமைக்கவும். இணையதளம் நேரடி ஒளிபரப்புகள் மற்றும் சமீபத்திய பிரசங்கங்களை தானாகவே கண்டறியும்." : "Configure the YouTube channel. The website auto-detects live streams and latest sermons."}
      />

      <Card className="mb-6">
        <CardSection title={lang === "ta" ? "யூடியூப் சேனல் அமைப்புகள்" : "YouTube Channel Settings"}>
          <Field
            label={lang === "ta" ? "யூடியூப் சேனல் ஐடி" : "YouTube Channel ID"}
            hint={lang === "ta" ? "உங்கள் யூடியூப் சேனல் URL இல் காணப்படுகிறது: youtube.com/channel/UC_xxxxxxxxx" : "Found in your YouTube channel URL: youtube.com/channel/UC_xxxxxxxxx"}
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
        <CardSection title={lang === "ta" ? "இது எவ்வாறு செயல்படுகிறது" : "How It Works"}>
          <ul className="font-lato text-[13px] text-stone-500 space-y-2 list-disc list-inside">
            {lang === "ta" ? (
              <>
                <li>உங்கள் சேனல் நேரலையில் செல்லும்போது, இணையதளம் நேரடி ஒளிபரப்பைத் தானாகவே காட்டும்.</li>
                <li>நேரலையில் இல்லாதபோது, கடைசியாக பதிவேற்றப்பட்ட பிரசங்கம் தானாகவே தோன்றும்.</li>
                <li>முந்தைய பிரசங்கங்கள் வரிசையில் 4 மிகச் சமீபத்திய பிரசங்கங்கள் காட்டப்படும்.</li>
                <li>குறியீடு மாற்றங்கள் எதுவும் தேவையில்லை - மேலே உள்ள சேனல் ஐடியை மட்டும் புதுப்பிக்கவும்.</li>
                <li>உங்கள் <code className="bg-stone-100 px-1.5 py-0.5 text-[12px]">.env.local</code> கோப்பில் <code className="bg-stone-100 px-1.5 py-0.5 text-[12px]">YOUTUBE_API_KEY</code> அமைக்கப்பட்டிருப்பதை உறுதிசெய்யவும்.</li>
              </>
            ) : (
              <>
                <li>When your channel goes live, the website automatically shows the live stream.</li>
                <li>When not live, the latest uploaded sermon appears automatically.</li>
                <li>The 4 most recent sermons are shown in the Previous Sermons row.</li>
                <li>No code changes are ever needed — just update the channel ID above.</li>
                <li>Make sure <code className="bg-stone-100 px-1.5 py-0.5 text-[12px]">YOUTUBE_API_KEY</code> is set in your <code className="bg-stone-100 px-1.5 py-0.5 text-[12px]">.env.local</code> file.</li>
              </>
            )}
          </ul>
        </CardSection>

        <CardSection title={lang === "ta" ? "API சாவி அமைவு" : "API Key Setup"}>
          <ol className="font-lato text-[13px] text-stone-500 space-y-1 list-decimal list-inside">
            {lang === "ta" ? (
              <>
                <li><a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">கூகிள் கிளவுட் கன்சோலுக்குச்</a> செல்லவும்</li>
                <li><strong>YouTube Data API v3</strong> ஐ இயக்கவும்</li>
                <li>Credentials இன் கீழ் ஒரு API சாவியை உருவாக்கவும்</li>
                <li>.env.local கோப்பில் <code className="bg-stone-100 px-1.5 py-0.5 text-[12px]">YOUTUBE_API_KEY=your_key</code> ஐச் சேர்க்கவும்</li>
                <li>இணையதளத்தை மீண்டும் வரிசைப்படுத்தவும்</li>
              </>
            ) : (
              <>
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">Google Cloud Console</a></li>
                <li>Enable <strong>YouTube Data API v3</strong></li>
                <li>Create an API key under Credentials</li>
                <li>Add <code className="bg-stone-100 px-1.5 py-0.5 text-[12px]">YOUTUBE_API_KEY=your_key</code> to .env.local</li>
                <li>Redeploy the website</li>
              </>
            )}
          </ol>
        </CardSection>
      </Card>

      {toast && <Toast message={toast} />}
    </div>
  );
}
