"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AdminPageHeader, Card, Field, Input, Textarea,
  SaveButton, DangerButton, Badge, Toast,
} from "@/components/admin/AdminUI";

type Q = {
  id: string; name: string; email: string | null; question: string;
  answer: string | null; answerTitle: string | null; status: string;
  consent: boolean; read: boolean; archived: boolean; createdAt: string;
};

type APIResponse = {
  items: Q[]; total: number; page: number; limit: number;
  unreadCount: number; pendingCount: number;
};

const STATUSES = ["ALL","PENDING","APPROVED","REJECTED","PUBLISHED"] as const;

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

  useEffect(() => { setPage(1); }, [filter, search, unreadOnly, archived]);
  useEffect(() => { load(); }, [load]);

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
        id: editing.id, answer: editing.answer,
        answerTitle: editing.answerTitle, status: editing.status,
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

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div>
      <AdminPageHeader title="Ask Collins" description="Review submitted questions and publish answers." />

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

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-sm">
          <span className="font-lato text-[12px] text-stone-600 mr-2">{selected.size} selected</span>
          {[
            { label: "Mark Read",     action: "read"      },
            { label: "Mark Unread",   action: "unread"    },
            { label: "Approve",       action: "approve"   },
            { label: "Reject",        action: "reject"    },
            { label: "Archive",       action: "archive"   },
            { label: "Unarchive",     action: "unarchive" },
          ].map(b => (
            <button key={b.action} onClick={() => bulkAction(b.action)}
              className="font-lato text-[10px] font-bold uppercase tracking-wider px-3 py-1.5
                         bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors">
              {b.label}
            </button>
          ))}
          <button onClick={() => setSelected(new Set())}
            className="font-lato text-[10px] text-stone-400 hover:text-stone-700 ml-auto">
            Clear
          </button>
        </div>
      )}

      {/* Question list */}
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
                      {q.consent && <span className="font-lato text-[10px] text-stone-400">Name consent ✓</span>}
                      {q.archived && <span className="font-lato text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-sm">Archived</span>}
                    </div>
                    <p className="font-lato text-[12px] text-stone-400">
                      {q.email ?? "Anonymous"} · {new Date(q.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {!q.read && (
                      <button onClick={() => patch(q.id, { read: true })}
                        className="font-lato text-[10px] font-bold uppercase tracking-wider
                                   bg-stone-100 text-stone-600 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                        Mark Read
                      </button>
                    )}
                    {q.status === "PENDING" && (
                      <>
                        <button onClick={() => patch(q.id, { status: "APPROVED" })}
                          className="font-lato text-[10px] font-bold uppercase tracking-wider
                                     bg-blue-100 text-blue-700 px-3 py-1.5 hover:bg-blue-200 transition-colors">
                          Approve
                        </button>
                        <button onClick={() => patch(q.id, { status: "REJECTED" })}
                          className="font-lato text-[10px] font-bold uppercase tracking-wider
                                     bg-red-100 text-red-600 px-3 py-1.5 hover:bg-red-200 transition-colors">
                          Reject
                        </button>
                      </>
                    )}
                    {(q.status === "APPROVED" || q.status === "PUBLISHED") && (
                      <button onClick={() => setEditing(q)}
                        className="font-lato text-[10px] font-bold uppercase tracking-wider
                                   bg-green-100 text-green-700 px-3 py-1.5 hover:bg-green-200 transition-colors">
                        {q.status === "PUBLISHED" ? "Edit Answer" : "Add Answer & Publish"}
                      </button>
                    )}
                    <button onClick={() => patch(q.id, { archived: !q.archived })}
                      className="font-lato text-[10px] font-bold uppercase tracking-wider
                                 bg-stone-100 text-stone-600 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                      {q.archived ? "Unarchive" : "Archive"}
                    </button>
                    <DangerButton onClick={() => del(q.id)} />
                  </div>
                </div>

                <div className="bg-stone-50 rounded-sm px-4 py-3 mb-3">
                  <p className="font-lato text-[13px] text-stone-700">{q.question}</p>
                </div>

                {q.answer && (
                  <div className="border-l-2 border-amber-400 pl-4">
                    <p className="font-lato text-[12px] font-bold text-stone-700 mb-1">
                      {q.answerTitle || "Answer"}
                    </p>
                    <p className="font-lato text-[12.5px] text-stone-500">{q.answer}</p>
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

      {/* Edit answer modal */}
      {editing && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setEditing(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                          bg-white w-full max-w-[560px] p-8 shadow-2xl">
            <h3 className="font-playfair text-[18px] font-bold text-stone-900 mb-5">Answer Question</h3>
            <div className="bg-stone-50 rounded-sm px-4 py-3 mb-5">
              <p className="font-lato text-[13px] text-stone-700 font-bold mb-1">{editing.name} asks:</p>
              <p className="font-lato text-[13px] text-stone-600">{editing.question}</p>
            </div>
            <Field label="Answer Title">
              <Input value={editing.answerTitle ?? ""}
                onChange={e => setEditing(v => v ? { ...v, answerTitle: e.target.value } : v)} />
            </Field>
            <Field label="Answer">
              <Textarea rows={6} value={editing.answer ?? ""}
                onChange={e => setEditing(v => v ? { ...v, answer: e.target.value } : v)} />
            </Field>
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
