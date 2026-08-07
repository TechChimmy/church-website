"use client";

import { useEffect, useState, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  AdminPageHeader, Card, Field, Input, Textarea,
  SaveButton, DangerButton, Badge, Toast,
} from "@/components/admin/AdminUI";

type Q = {
  id: string; name: string; phone: string | null; email: string | null; question: string; questionTa?: string | null;
  answer: string | null; answerTa?: string | null; answerTitle: string | null; answerTitleTa?: string | null; status: string;
  consent: boolean; read: boolean; archived: boolean; createdAt: string;
  videoName?: string | null; timestamp?: string | null;
};

type APIResponse = {
  items: Q[]; total: number; page: number; limit: number;
  unreadCount: number; pendingCount: number;
};

type AnswerItem = {
  id: string; title: string; titleTa: string; question: string; questionTa: string; answer: string; answerTa: string;
  imageUrl?: string | null; publishDate?: string | null;
  category: string; categoryTa: string; excerpt: string; excerptTa: string; order: number; active: boolean;
};

const STATUSES = ["ALL","PENDING","APPROVED","REJECTED","PUBLISHED"] as const;
const EMPTY_ANSWER = {
  title: "", titleTa: "", question: "", questionTa: "", answer: "", answerTa: "", imageUrl: "",
  publishDate: new Date().toISOString().slice(0, 10),
  category: "Faith", categoryTa: "விசுவாசம்", excerpt: "", excerptTa: "", order: 0, active: true
};

const EMPTY_QUESTION: Q = {
  id: "",
  name: "Anonymous",
  phone: "",
  email: "",
  question: "",
  questionTa: "",
  answer: "",
  answerTa: "",
  answerTitle: "",
  answerTitleTa: "",
  status: "PUBLISHED",
  consent: true,
  read: true,
  archived: false,
  createdAt: new Date().toISOString(),
};

const ASK_COLLINS_KEYS = [
  "ask_collins_banner_image",
  "ask_collins_hero_title", "ask_collins_hero_title_ta",
  "ask_collins_hero_subtitle", "ask_collins_hero_subtitle_ta",
  "ask_collins_tagline", "ask_collins_tagline_ta",
  "ask_collins_heading", "ask_collins_heading_ta",
  "ask_collins_subheading", "ask_collins_subheading_ta",
  "answered_questions_tagline", "answered_questions_tagline_ta",
  "answered_questions_heading", "answered_questions_heading_ta",
  "answers_word_tagline", "answers_word_tagline_ta",
  "answers_word_heading", "answers_word_heading_ta",
];

export default function AdminAskCollins() {
  const [data, setData]       = useState<APIResponse>({ items: [], total: 0, page: 1, limit: 20, unreadCount: 0, pendingCount: 0 });
  const [filter, setFilter]   = useState("ALL");
  const [search, setSearch]   = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [archived, setArchived]     = useState(false);
  const [page, setPage]       = useState(1);
  const [editing, setEditing] = useState<Q | null>(null);
  const [saving, setSaving]   = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast]     = useState("");

  // Page level settings
  const [settings, setSettings]       = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Answers state
  const [answers, setAnswers]             = useState<AnswerItem[]>([]);
  const [answerForm, setAnswerForm]       = useState<Omit<AnswerItem, "id"> & { id?: string }>(EMPTY_ANSWER);
  const [answerEditingId, setAnswerEditingId] = useState<string | null>(null);
  const [answersSaving, setAnswersSaving]   = useState(false);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const loadSettings = useCallback(async () => {
    const r = await fetch("/api/cms/settings");
    if (!r.ok) return;
    const all: { key: string; value: string }[] = await r.json();
    const map: Record<string, string> = {};
    ASK_COLLINS_KEYS.forEach(k => { map[k] = all.find(s => s.key === k)?.value ?? ""; });
    setSettings(map);
  }, []);

  async function saveSetting(key: string, value: string) {
    setSettingsSaving(true);
    await fetch("/api/cms/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSettingsSaving(false);
    showToast("Setting saved");
  }

  const load = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page), limit: "20", status: filter,
      ...(search     ? { search }           : {}),
      ...(unreadOnly ? { unread: "true" }   : {}),
      ...(archived   ? { archived: "true" } : {}),
    });
    const r = await fetch(`/api/cms/ask-collins?${params}`);
    if (r.ok) setData(await r.json());
  }, [filter, search, page, unreadOnly, archived]);

  const loadAnswers = useCallback(async () => {
    const r = await fetch("/api/cms/answers");
    if (r.ok) setAnswers(await r.json());
  }, []);

  useEffect(() => { setPage(1); }, [filter, search, unreadOnly, archived]);
  useEffect(() => {
    load();
    loadAnswers();
    loadSettings();
  }, [load, loadAnswers, loadSettings]);

  async function patch(id: string, upd: Record<string, unknown>) {
    setSaving(true);
    await fetch("/api/cms/ask-collins", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...upd }),
    });
    setSaving(false); load(); showToast("Updated");
  }

  async function bulkAction(action: string) {
    if (selected.size === 0) return;
    await fetch("/api/cms/ask-collins", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], action }),
    });
    setSelected(new Set()); load(); showToast(`Done: ${action}`);
  }

  async function del(id: string) {
    if (!confirm("Delete this question?")) return;
    await fetch("/api/cms/ask-collins", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load(); showToast("Deleted");
  }

  async function saveEdit(newStatus?: string) {
    if (!editing) return;
    setSaving(true);
    const isNew = !editing.id;
    const url = "/api/cms/ask-collins";
    const method = isNew ? "POST" : "PATCH";
    
    await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(!isNew ? { id: editing.id } : {}),
        name: editing.name,
        question: editing.question,
        questionTa: editing.questionTa,
        answer: editing.answer,
        answerTa: editing.answerTa,
        answerTitle: editing.answerTitle,
        answerTitleTa: editing.answerTitleTa,
        consent: editing.consent,
        status: newStatus || editing.status,
      }),
    });
    setSaving(false); setEditing(null); load(); showToast(isNew ? "Created" : "Saved");
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Answers CMS actions
  function startEditAnswer(ans: AnswerItem) {
    setAnswerEditingId(ans.id);
    setAnswerForm({
      ...ans,
      publishDate: ans.publishDate ? ans.publishDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    });
  }

  function cancelEditAnswer() {
    setAnswerEditingId(null);
    setAnswerForm(EMPTY_ANSWER);
  }

  async function saveAnswer() {
    if (!answerForm.title.trim()) {
      alert("Title is required");
      return;
    }
    setAnswersSaving(true);
    const method = answerEditingId ? "PATCH" : "POST";
    const body   = answerEditingId ? { ...answerForm, id: answerEditingId } : answerForm;
    await fetch("/api/cms/answers", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setAnswersSaving(false);
    cancelEditAnswer();
    loadAnswers();
    showToast(answerEditingId ? "Answer updated" : "Answer created");
  }

  async function deleteAnswer(id: string) {
    if (!confirm("Delete this answer document?")) return;
    await fetch("/api/cms/answers", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadAnswers();
    showToast("Deleted");
  }

  const setAnswer = (k: string, v: string | number | boolean) =>
    setAnswerForm(f => ({ ...f, [k]: v }));

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div>
      <AdminPageHeader title="Ask Collins & Answers" description="Review submitted questions and publish answers into the blog database." />

      {/* ── Page & Section Copy Settings Card ── */}
      <Card className="mb-8">
        <h2 className="font-playfair text-[18px] font-bold text-stone-900 mb-4">Page Headers & Section Copy Settings</h2>
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="border-b border-stone-100 pb-6">
            <h3 className="font-lato text-[12px] font-bold uppercase tracking-wider text-stone-500 mb-3">1. Hero Banner & Title</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Hero Title (English)">
                <Input value={settings.ask_collins_hero_title ?? ""}
                  onChange={e => setSettings(s => ({ ...s, ask_collins_hero_title: e.target.value }))} placeholder="Ask Collins" />
              </Field>
              <Field label="Hero Title (Tamil)">
                <Input value={settings.ask_collins_hero_title_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, ask_collins_hero_title_ta: e.target.value }))} placeholder="போதகரிடம் கேளுங்கள்" />
              </Field>
              <Field label="Hero Subtitle / Tagline (English)">
                <Input value={settings.ask_collins_hero_subtitle ?? ""}
                  onChange={e => setSettings(s => ({ ...s, ask_collins_hero_subtitle: e.target.value }))} placeholder="Biblical Wisdom & Guidance" />
              </Field>
              <Field label="Hero Subtitle / Tagline (Tamil)">
                <Input value={settings.ask_collins_hero_subtitle_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, ask_collins_hero_subtitle_ta: e.target.value }))} placeholder="உங்கள் கேள்விகளுக்கு வேதாகம பதில்கள்" />
              </Field>
            </div>
            <ImageUploader
              label="Ask Collins Hero Banner Image"
              currentUrl={settings.ask_collins_banner_image ?? ""}
              folder="banners"
              onUploaded={url => {
                setSettings(s => ({ ...s, ask_collins_banner_image: url }));
                saveSetting("ask_collins_banner_image", url);
              }}
            />
            <div className="flex gap-2 mt-3">
              <SaveButton loading={settingsSaving} label="Save Hero Settings" onClick={() => {
                saveSetting("ask_collins_hero_title", settings.ask_collins_hero_title);
                saveSetting("ask_collins_hero_title_ta", settings.ask_collins_hero_title_ta);
                saveSetting("ask_collins_hero_subtitle", settings.ask_collins_hero_subtitle);
                saveSetting("ask_collins_hero_subtitle_ta", settings.ask_collins_hero_subtitle_ta);
              }} />
            </div>
          </div>

          {/* Submission Form Section */}
          <div className="border-b border-stone-100 pb-6">
            <h3 className="font-lato text-[12px] font-bold uppercase tracking-wider text-stone-500 mb-3">2. Question Submission Form Section</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Form Tagline (English)">
                <Input value={settings.ask_collins_tagline ?? ""}
                  onChange={e => setSettings(s => ({ ...s, ask_collins_tagline: e.target.value }))} />
              </Field>
              <Field label="Form Tagline (Tamil)">
                <Input value={settings.ask_collins_tagline_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, ask_collins_tagline_ta: e.target.value }))} />
              </Field>
              <Field label="Form Heading (English)">
                <Input value={settings.ask_collins_heading ?? ""}
                  onChange={e => setSettings(s => ({ ...s, ask_collins_heading: e.target.value }))} />
              </Field>
              <Field label="Form Heading (Tamil)">
                <Input value={settings.ask_collins_heading_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, ask_collins_heading_ta: e.target.value }))} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Form Subheading / Description (English)">
                  <Textarea rows={2} value={settings.ask_collins_subheading ?? ""}
                    onChange={e => setSettings(s => ({ ...s, ask_collins_subheading: e.target.value }))} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Form Subheading / Description (Tamil)">
                  <Textarea rows={2} value={settings.ask_collins_subheading_ta ?? ""}
                    onChange={e => setSettings(s => ({ ...s, ask_collins_subheading_ta: e.target.value }))} />
                </Field>
              </div>
            </div>
            <SaveButton loading={settingsSaving} label="Save Form Headings" onClick={() => {
              saveSetting("ask_collins_tagline", settings.ask_collins_tagline);
              saveSetting("ask_collins_tagline_ta", settings.ask_collins_tagline_ta);
              saveSetting("ask_collins_heading", settings.ask_collins_heading);
              saveSetting("ask_collins_heading_ta", settings.ask_collins_heading_ta);
              saveSetting("ask_collins_subheading", settings.ask_collins_subheading);
              saveSetting("ask_collins_subheading_ta", settings.ask_collins_subheading_ta);
            }} />
          </div>

          {/* Answered Questions & Answers from the Word Headings */}
          <div>
            <h3 className="font-lato text-[12px] font-bold uppercase tracking-wider text-stone-500 mb-3">3. Section Headings (Q&A Slider & Answers Blog)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Community Q&A Tagline (English)">
                <Input value={settings.answered_questions_tagline ?? ""}
                  onChange={e => setSettings(s => ({ ...s, answered_questions_tagline: e.target.value }))} />
              </Field>
              <Field label="Community Q&A Tagline (Tamil)">
                <Input value={settings.answered_questions_tagline_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, answered_questions_tagline_ta: e.target.value }))} />
              </Field>
              <Field label="Community Q&A Heading (English)">
                <Input value={settings.answered_questions_heading ?? ""}
                  onChange={e => setSettings(s => ({ ...s, answered_questions_heading: e.target.value }))} />
              </Field>
              <Field label="Community Q&A Heading (Tamil)">
                <Input value={settings.answered_questions_heading_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, answered_questions_heading_ta: e.target.value }))} />
              </Field>
              <Field label="Answers from Word Tagline (English)">
                <Input value={settings.answers_word_tagline ?? ""}
                  onChange={e => setSettings(s => ({ ...s, answers_word_tagline: e.target.value }))} />
              </Field>
              <Field label="Answers from Word Tagline (Tamil)">
                <Input value={settings.answers_word_tagline_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, answers_word_tagline_ta: e.target.value }))} />
              </Field>
              <Field label="Answers from Word Heading (English)">
                <Input value={settings.answers_word_heading ?? ""}
                  onChange={e => setSettings(s => ({ ...s, answers_word_heading: e.target.value }))} />
              </Field>
              <Field label="Answers from Word Heading (Tamil)">
                <Input value={settings.answers_word_heading_ta ?? ""}
                  onChange={e => setSettings(s => ({ ...s, answers_word_heading_ta: e.target.value }))} />
              </Field>
            </div>
            <SaveButton loading={settingsSaving} label="Save Section Headings" onClick={() => {
              saveSetting("answered_questions_tagline", settings.answered_questions_tagline);
              saveSetting("answered_questions_tagline_ta", settings.answered_questions_tagline_ta);
              saveSetting("answered_questions_heading", settings.answered_questions_heading);
              saveSetting("answered_questions_heading_ta", settings.answered_questions_heading_ta);
              saveSetting("answers_word_tagline", settings.answers_word_tagline);
              saveSetting("answers_word_tagline_ta", settings.answers_word_tagline_ta);
              saveSetting("answers_word_heading", settings.answers_word_heading);
              saveSetting("answers_word_heading_ta", settings.answers_word_heading_ta);
            }} />
          </div>
        </div>
      </Card>

      {/* ── Ask Collins Questions section ── */}
      <div className="mb-10 border-b border-stone-200/80 pb-10">
        <h2 className="font-playfair text-[20px] font-bold text-stone-800 mb-4">Submitted Questions</h2>
        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4 justify-between w-full items-center">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`font-lato text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-sm transition-colors
                           ${filter === s ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"}`}>
                {s}
              </button>
            ))}
            <input type="text" placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 font-lato text-[12px] border border-stone-200 rounded-sm
                         outline-none focus:border-stone-400 bg-white text-stone-800 placeholder:text-stone-300 w-44" />
            <label className="flex items-center gap-1.5 font-lato text-[12px] text-stone-600 cursor-pointer">
              <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} />
              Unread only
            </label>
            <label className="flex items-center gap-1.5 font-lato text-[12px] text-stone-600 cursor-pointer">
              <input type="checkbox" checked={archived} onChange={e => setArchived(e.target.checked)} />
              Archived
            </label>
          </div>
          
          <button onClick={() => setEditing(EMPTY_QUESTION)}
            className="font-lato text-[11px] font-bold uppercase tracking-wider bg-[#8c3a63] text-white px-4 py-2 rounded-sm hover:bg-[#6d2c4e] transition-colors">
            + Create New Q&A
          </button>
        </div>

        {/* Bulk operations */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 bg-stone-100 px-4 py-2 rounded-sm mb-4">
            <span className="font-lato text-[12px] text-stone-600 font-bold">{selected.size} selected:</span>
            <button onClick={() => bulkAction("READ")} className="font-lato text-[10px] font-bold uppercase tracking-wider bg-white text-stone-700 px-2 py-1 rounded border border-stone-300 hover:bg-stone-50">Mark Read</button>
            <button onClick={() => bulkAction("ARCHIVE")} className="font-lato text-[10px] font-bold uppercase tracking-wider bg-white text-stone-700 px-2 py-1 rounded border border-stone-300 hover:bg-stone-50">Archive</button>
            <button onClick={() => bulkAction("UNARCHIVE")} className="font-lato text-[10px] font-bold uppercase tracking-wider bg-white text-stone-700 px-2 py-1 rounded border border-stone-300 hover:bg-stone-50">Restore</button>
          </div>
        )}

        {/* Questions List */}
        <div className="flex flex-col gap-4">
          {data.items.length === 0 && (
            <Card><p className="font-lato text-[13px] text-stone-400">No questions found.</p></Card>
          )}
          {data.items.map(q => (
            <Card key={q.id}>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 shrink-0"
                  checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className={`font-lato font-bold text-[14px] ${!q.read ? "text-stone-900" : "text-stone-500"}`}>
                          {q.name}
                          {!q.read && <span className="ml-2 inline-block w-2 h-2 bg-[#8c3a63] rounded-full" />}
                        </p>
                        <Badge status={q.status} />
                        {q.consent && <span className="font-lato text-[10px] text-stone-400">Consent: Public Review ✓</span>}
                        {q.archived && <span className="font-lato text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-sm">Archived</span>}
                      </div>
                      <p className="font-lato text-[12px] text-stone-400 mb-1.5">
                        {q.email ?? "No Email"} {q.phone ? `· Phone: ${q.phone}` : ""} · {new Date(q.createdAt).toLocaleDateString("en-IN")}
                      </p>
                      {q.videoName && (
                        <div className="mb-2 text-[11px] font-lato text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm w-fit border border-amber-100/60">
                          Sermon: <strong>{q.videoName}</strong> {q.timestamp ? `at ${q.timestamp}` : ""}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                      {!q.read && (
                        <button onClick={() => patch(q.id, { read: true })}
                          className="font-lato text-[10px] font-bold uppercase tracking-wider
                                     bg-stone-100 text-stone-600 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                          Mark Read
                        </button>
                      )}
                      <button onClick={() => setEditing(q)}
                        className="font-lato text-[10px] font-bold uppercase tracking-wider
                                   bg-stone-900 text-white px-3 py-1.5 hover:bg-stone-800 transition-colors">
                        Answer
                      </button>
                      <button onClick={() => patch(q.id, { archived: !q.archived })}
                        className="font-lato text-[10px] font-bold uppercase tracking-wider
                                   bg-stone-100 text-stone-600 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                        {q.archived ? "Restore" : "Archive"}
                      </button>
                      <DangerButton onClick={() => del(q.id)} />
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-sm px-4 py-3 mb-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-lato text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1">Question (English)</p>
                      <p className="font-lato text-[13px] text-stone-700">{q.question}</p>
                    </div>
                    <div>
                      <p className="font-lato text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1">Question (Tamil)</p>
                      <p className="font-lato text-[13px] text-stone-700">{q.questionTa || "(No Tamil Question)"}</p>
                    </div>
                  </div>

                  {(q.answer || q.answerTa) && (
                    <div className="border-l-2 border-stone-300 pl-4 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="font-lato text-[11px] uppercase tracking-wider text-stone-400 font-bold mb-1">
                          Answer (English): {q.answerTitle ?? "Untitled"}
                        </p>
                        <p className="font-lato text-[13px] text-stone-600 whitespace-pre-wrap">{q.answer}</p>
                      </div>
                      <div>
                        <p className="font-lato text-[11px] uppercase tracking-wider text-stone-400 font-bold mb-1">
                          Answer (Tamil): {q.answerTitleTa ?? "Untitled"}
                        </p>
                        <p className="font-lato text-[13px] text-stone-600 whitespace-pre-wrap">{q.answerTa || "(No Tamil Answer)"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3 mt-6 justify-center">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="font-lato text-[12px] px-4 py-2 border border-stone-200 rounded-sm
                         disabled:opacity-40 hover:border-stone-400 transition-colors">
            ← Prev
          </button>
            <span className="font-lato text-[12px] text-stone-500">
              Page {page} of {totalPages} ({data.total} total)
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="font-lato text-[12px] px-4 py-2 border border-stone-200 rounded-sm
                         disabled:opacity-40 hover:border-stone-400 transition-colors">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Answers From The Word CMS Section ── */}
      <div>
        <h2 className="font-playfair text-[20px] font-bold text-stone-800 mb-4">Answers from the Word Cards</h2>
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 360px" }}>
          {/* Answers list */}
          <Card>
            <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
              Current Answers ({answers.length})
            </h3>
            {answers.length === 0 && (
              <p className="font-lato text-[13px] text-stone-400">No blog answers added yet.</p>
            )}
            <div className="flex flex-col gap-3">
              {answers.map(ans => (
                <div key={ans.id} className="flex items-center justify-between border border-stone-200 px-4 py-3 bg-stone-50/50">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="font-lato font-bold text-[14px] text-stone-900 truncate">
                      {ans.title || ans.question} / {ans.titleTa || ans.questionTa || "(No Tamil Title)"} {!ans.active && <span className="text-[11px] text-red-500 italic">(Inactive)</span>}
                    </p>
                    <p className="font-lato text-[12px] text-stone-400">
                      Category: {ans.category} / {ans.categoryTa || "(No Tamil)"} · Order: {ans.order}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEditAnswer(ans)}
                      className="font-lato text-[11px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                      Edit
                    </button>
                    <DangerButton onClick={() => deleteAnswer(ans.id)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Form */}
          <Card>
            <h3 className="font-lato text-[12px] font-bold uppercase tracking-widest text-stone-500 mb-5">
              {answerEditingId ? "Edit Answer" : "Add Answer"}
            </h3>
            <Field label="Title / Header (English)">
              <Input value={answerForm.title} onChange={e => setAnswer("title", e.target.value)} placeholder="e.g. Try Jesus" />
            </Field>
            <Field label="Title / Header (Tamil)">
              <Input value={answerForm.titleTa} onChange={e => setAnswer("titleTa", e.target.value)} placeholder="எ.கா. இயேசுவை முயற்சி செய்" />
            </Field>
            <Field label="Original Question (English)">
              <Input value={answerForm.question} onChange={e => setAnswer("question", e.target.value)} placeholder="Optional if matching title" />
            </Field>
            <Field label="Original Question (Tamil)">
              <Input value={answerForm.questionTa} onChange={e => setAnswer("questionTa", e.target.value)} />
            </Field>
            <Field label="Short Excerpt Preview (English)">
              <Textarea rows={2} value={answerForm.excerpt} onChange={e => setAnswer("excerpt", e.target.value)} placeholder="Short excerpt summary..." />
            </Field>
            <Field label="Short Excerpt Preview (Tamil)">
              <Textarea rows={2} value={answerForm.excerptTa} onChange={e => setAnswer("excerptTa", e.target.value)} />
            </Field>
            <Field label="Full Answer Text (English)">
              <Textarea rows={4} value={answerForm.answer} onChange={e => setAnswer("answer", e.target.value)} />
            </Field>
            <Field label="Full Answer Text (Tamil)">
              <Textarea rows={4} value={answerForm.answerTa} onChange={e => setAnswer("answerTa", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category (English)">
                <Input value={answerForm.category} onChange={e => setAnswer("category", e.target.value)} />
              </Field>
              <Field label="Category (Tamil)">
                <Input value={answerForm.categoryTa} onChange={e => setAnswer("categoryTa", e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Publish Date">
                <Input type="date" value={answerForm.publishDate ?? ""} onChange={e => setAnswer("publishDate", e.target.value)} />
              </Field>
              <Field label="Display Order">
                <Input type="number" value={String(answerForm.order)} onChange={e => setAnswer("order", parseInt(e.target.value) || 0)} />
              </Field>
            </div>
            <div className="mb-4">
              <ImageUploader label="Featured Image" currentUrl={answerForm.imageUrl ?? undefined} folder="doctrine" onUploaded={url => setAnswer("imageUrl", url)} />
            </div>
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={answerForm.active} onChange={e => setAnswer("active", e.target.checked)} className="accent-amber-500" />
              <span className="font-lato text-[13px] text-stone-600">Active</span>
            </label>
            <div className="flex gap-2">
              <SaveButton loading={answersSaving} label={answerEditingId ? "Update" : "Add"} onClick={saveAnswer} />
              {answerEditingId && (
                <button onClick={cancelEditAnswer} className="font-lato text-[11px] text-stone-400 hover:text-stone-700 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit answer modal */}
      {editing && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setEditing(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                          bg-white w-full max-w-[640px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="font-playfair text-[18px] font-bold text-stone-900 mb-5">
              {!editing.id ? "Create Q&A Card" : "Edit Q&A Card"}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Author Name">
                <Input value={editing.name ?? ""}
                  onChange={e => setEditing(v => v ? { ...v, name: e.target.value } : v)} placeholder="e.g. John or Anonymous" />
              </Field>
              <div className="flex items-end pb-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.consent}
                    onChange={e => setEditing(v => v ? { ...v, consent: e.target.checked } : v)} className="accent-[#8c3a63]" />
                  <span className="font-lato text-[13px] text-stone-600">Show Name Publicly (Consent)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Question (English)">
                <Textarea rows={3} value={editing.question ?? ""}
                  onChange={e => setEditing(v => v ? { ...v, question: e.target.value } : v)} placeholder="Enter question in English..." />
              </Field>
              <Field label="Question (Tamil)">
                <Textarea rows={3} value={editing.questionTa ?? ""}
                  onChange={e => setEditing(v => v ? { ...v, questionTa: e.target.value } : v)} placeholder="Enter question in Tamil..." />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Answer Title (English)">
                <Input value={editing.answerTitle ?? ""}
                  onChange={e => setEditing(v => v ? { ...v, answerTitle: e.target.value } : v)} />
              </Field>
              <Field label="Answer Title (Tamil)">
                <Input value={editing.answerTitleTa ?? ""}
                  onChange={e => setEditing(v => v ? { ...v, answerTitleTa: e.target.value } : v)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Field label="Answer (English)">
                <Textarea rows={6} value={editing.answer ?? ""}
                  onChange={e => setEditing(v => v ? { ...v, answer: e.target.value } : v)} />
              </Field>
              <Field label="Answer (Tamil)">
                <Textarea rows={6} value={editing.answerTa ?? ""}
                  onChange={e => setEditing(v => v ? { ...v, answerTa: e.target.value } : v)} />
              </Field>
            </div>

            <div className="flex gap-3 mt-2">
              <SaveButton loading={saving} label="Save & Publish" onClick={() => {
                saveEdit("PUBLISHED");
              }} />
              <SaveButton loading={saving} label="Save Draft" onClick={() => saveEdit()} />
              <button onClick={() => setEditing(null)}
                className="font-lato text-[11px] text-stone-400 hover:text-stone-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
