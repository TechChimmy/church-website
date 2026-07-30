"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminPageHeader, Card, Toast } from "@/components/admin/AdminUI";

type CM = {
  id: string; name: string; email: string; message: string;
  read: boolean; archived: boolean; replied: boolean; createdAt: string;
};
type APIResp = { items: CM[]; total: number; page: number; limit: number; unreadCount: number };

export default function AdminMessages() {
  const [data, setData]         = useState<APIResp>({ items: [], total: 0, page: 1, limit: 20, unreadCount: 0 });
  const [search, setSearch]     = useState("");
  const [unreadOnly, setUnread] = useState(false);
  const [archived, setArchived] = useState(false);
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast]       = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page), limit: "20",
      ...(search     ? { search }           : {}),
      ...(unreadOnly ? { unread: "true" }   : {}),
      ...(archived   ? { archived: "true" } : {}),
    });
    const r = await fetch(`/api/admin/messages?${params}`);
    if (r.ok) setData(await r.json());
  }, [search, unreadOnly, archived, page]);

  useEffect(() => { setPage(1); }, [search, unreadOnly, archived]);
  useEffect(() => { load(); }, [load]);

  async function patch(id: string, upd: Record<string, unknown>) {
    await fetch("/api/admin/messages", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...upd }),
    });
    load(); showToast("Updated");
  }

  async function bulkAction(action: string) {
    if (selected.size === 0) return;
    await fetch("/api/admin/messages", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], action }),
    });
    setSelected(new Set()); load(); showToast(`Done: ${action}`);
  }

  async function del(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch("/api/admin/messages", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load(); showToast("Deleted");
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div>
      <AdminPageHeader title="Contact Messages" description="Messages submitted via the Write To Us form." />

      {/* Stats */}
      <div className="flex gap-4 mb-5">
        <div className="bg-white border border-stone-200 rounded-sm px-4 py-2">
          <span className="font-lato text-[11px] text-stone-400 uppercase tracking-wider">Unread</span>
          <span className="font-playfair text-[20px] font-bold text-stone-900 ml-3">{data.unreadCount}</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm px-4 py-2">
          <span className="font-lato text-[11px] text-stone-400 uppercase tracking-wider">Total</span>
          <span className="font-playfair text-[20px] font-bold text-stone-900 ml-3">{data.total}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" placeholder="Search..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 font-lato text-[12px] border border-stone-200 rounded-sm
                     outline-none focus:border-stone-400 bg-white text-stone-800 placeholder:text-stone-300 w-48" />
        <label className="flex items-center gap-1.5 font-lato text-[12px] text-stone-600 cursor-pointer">
          <input type="checkbox" checked={unreadOnly} onChange={e => setUnread(e.target.checked)} />
          Unread only
        </label>
        <label className="flex items-center gap-1.5 font-lato text-[12px] text-stone-600 cursor-pointer">
          <input type="checkbox" checked={archived} onChange={e => setArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      {/* Bulk */}
      {selected.size > 0 && (
        <div className="flex gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-sm flex-wrap">
          <span className="font-lato text-[12px] text-stone-600 mr-2">{selected.size} selected</span>
          {[
            { label: "Mark Read",   action: "read"      },
            { label: "Mark Unread", action: "unread"    },
            { label: "Archive",     action: "archive"   },
            { label: "Unarchive",   action: "unarchive" },
            { label: "Replied",     action: "replied"   },
          ].map(b => (
            <button key={b.action} onClick={() => bulkAction(b.action)}
              className="font-lato text-[10px] font-bold uppercase tracking-wider px-3 py-1.5
                         bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors">
              {b.label}
            </button>
          ))}
          <button onClick={async () => {
            if (!confirm(`Delete ${selected.size} messages?`)) return;
            await fetch("/api/admin/messages", {
              method: "DELETE", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: [...selected] }),
            });
            setSelected(new Set()); load(); showToast("Deleted");
          }} className="font-lato text-[10px] font-bold uppercase tracking-wider px-3 py-1.5
                        bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
            Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())}
            className="font-lato text-[10px] text-stone-400 hover:text-stone-700 ml-auto">
            Clear
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-4">
        {data.items.length === 0 && (
          <Card><p className="font-lato text-[13px] text-stone-400">No messages found.</p></Card>
        )}
        {data.items.map(m => (
          <Card key={m.id}>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 shrink-0"
                checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`font-lato font-bold text-[14px] ${!m.read ? "text-stone-900" : "text-stone-500"}`}>
                        {m.name}
                        {!m.read && <span className="ml-2 inline-block w-2 h-2 bg-[#8c3a63] rounded-full" />}
                      </p>
                      {m.replied && <span className="font-lato text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-sm">Replied</span>}
                      {m.archived && <span className="font-lato text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-sm">Archived</span>}
                    </div>
                    <a href={`mailto:${m.email}`} className="font-lato text-[12px] text-amber-600 hover:underline">
                      {m.email}
                    </a>
                    <div className="bg-stone-50 rounded-sm px-4 py-3 mt-3">
                      <p className="font-lato text-[13px] text-stone-700">{m.message}</p>
                    </div>
                    <p className="font-lato text-[11px] text-stone-400 mt-2">
                      {new Date(m.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <a href={`mailto:${m.email}?subject=Re: Your message to CFT Church`}
                      onClick={() => patch(m.id, { replied: true, read: true })}
                      className="font-lato text-[10px] font-bold uppercase tracking-wider
                                 bg-blue-50 text-blue-600 px-3 py-1.5 hover:bg-blue-100 transition-colors text-center">
                      Reply
                    </a>
                    {!m.read
                      ? <button onClick={() => patch(m.id, { read: true })}
                          className="font-lato text-[10px] font-bold uppercase tracking-wider
                                     bg-stone-100 text-stone-600 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                          Mark Read
                        </button>
                      : null}
                    <button onClick={() => patch(m.id, { archived: !m.archived })}
                      className="font-lato text-[10px] font-bold uppercase tracking-wider
                                 bg-stone-100 text-stone-600 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                      {m.archived ? "Unarchive" : "Archive"}
                    </button>
                    <button onClick={() => del(m.id)}
                      className="font-lato text-[10px] font-bold uppercase tracking-wider
                                 bg-red-50 text-red-500 px-3 py-1.5 hover:bg-red-100 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 mt-6 justify-center">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="font-lato text-[12px] px-4 py-2 border border-stone-200 rounded-sm disabled:opacity-40">
            ← Prev
          </button>
          <span className="font-lato text-[12px] text-stone-500">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="font-lato text-[12px] px-4 py-2 border border-stone-200 rounded-sm disabled:opacity-40">
            Next →
          </button>
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
