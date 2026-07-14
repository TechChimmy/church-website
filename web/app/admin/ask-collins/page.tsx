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

  // Answers state
  const [answers, setAnswers]             = useState<AnswerItem[]>([]);
  const [answerForm, setAnswerForm]       = useState<Omit<AnswerItem, "id"> & { id?: string }>(EMPTY_ANSWER);
  const [answerEditingId, setAnswerEditingId] = useState<string | null>(null);
  const [answersSaving, setAnswersSaving]   = useState(false);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

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
  }, [load, loadAnswers]);

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

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    await fetch("/api/cms/ask-collins", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing.id,
        answer: editing.answer,
        answerTa: editing.answerTa,
        answerTitle: editing.answerTitle,
        answerTitleTa: editing.answerTitleTa,
        questionTa: editing.questionTa,
        status: editing.status,
      }),
    });
    setSaving(false); setEditing(null); load(); showToast("Saved");
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

      {/* Stats row */}
      <div className="flex gap-4 mb-5">
        <div className="bg-white border border-stone-200 rounded-sm px-4 py-2">
          <span className="font-lato text-[11px] text-stone-400 uppercase tracking-wider">Unread</span>
          <span className="font-playfair text-[20px] font-bold text-stone-900 ml-3">{data.unreadCount}</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm px-4 py-2">
          <span className="font-lato text-[11px] text-stone-400 uppercase tracking-wider">Pending</span>
          <span className="font-playfair text-[20px] font-bold text-stone-900 ml-3">{data.pendingCount}</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm px-4 py-2">
          <span className="font-lato text-[11px] text-stone-400 uppercase tracking-wider">Total</span>
          <span className="font-playfair text-[20px] font-bold text-stone-900 ml-3">{data.total}</span>
        </div>
      </div>

      {/* ── Ask Collins Questions section ── */}
      <div className="mb-10 border-b border-stone-200/80 pb-10">
        <h2 className="font-playfair text-[20px] font-bold text-stone-800 mb-4">Submitted Questions</h2>
        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
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
            <h3 className="font-playfair text-[18px] font-bold text-stone-900 mb-5">Answer Question</h3>
            
            <div className="bg-stone-50 rounded-sm px-4 py-3 mb-5 grid grid-cols-2 gap-4">
              <div>
                <p className="font-lato text-[11px] text-stone-700 font-bold mb-1">{editing.name} asks (English):</p>
                <p className="font-lato text-[13px] text-stone-600">{editing.question}</p>
              </div>
              <div>
                <p className="font-lato text-[11px] text-stone-700 font-bold mb-1">asks (Tamil):</p>
                <p className="font-lato text-[13px] text-stone-600">{editing.questionTa || "(No Tamil Question)"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <Field label="Original Question Tamil Translation Refinement">
                <Input value={editing.questionTa ?? ""}
                  onChange={e => setEditing(v => v ? { ...v, questionTa: e.target.value } : v)} placeholder="Refine Tamil question translation..." />
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
                setEditing(v => v ? { ...v, status: "PUBLISHED" } : v);
                setTimeout(saveEdit, 0);
              }} />
              <SaveButton loading={saving} label="Save Draft" onClick={saveEdit} />
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
