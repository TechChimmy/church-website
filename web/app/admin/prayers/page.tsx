"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminPageHeader, Card, Toast } from "@/components/admin/AdminUI";

type PR = {
  id: string; name: string | null; email: string | null;
  prayerRequest: string; anonymous: boolean;
  read: boolean; archived: boolean; approved: boolean; createdAt: string;
};
type APIResp = { items: PR[]; total: number; page: number; limit: number; unreadCount: number };

export default function AdminPrayers() {
  const [data, setData]         = useState<APIResp>({ items: [], total: 0, page: 1, limit: 20, unreadCount: 0 });
  const [filter, setFilter]     = useState<"ALL"|"ANONYMOUS"|"NAMED">("ALL");
  const [search, setSearch]     = useState("");
  const [unreadOnly, setUnread] = useState(false);
  const [archived, setArchived] = useState(false);
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast]       = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page), limit: "20", filter,
      ...(search     ? { search }           : {}),
      ...(unreadOnly ? { unread: "true" }   : {}),
      ...(archived   ? { archived: "true" } : {}),
    });
    try {
      const r = await fetch(`/api/admin/prayers?${params}`);
      if (r.ok) setData(await r.json());
      else console.error("[AdminPrayers] API error:", r.status, await r.text().catch(() => ""));
    } catch (err) {
      console.error("[AdminPrayers] fetch error:", err);
    }
  }, [filter, search, unreadOnly, archived, page]);

  useEffect(() => { setPage(1); }, [filter, search, unreadOnly, archived]);
  useEffect(() => { load(); }, [load]);

  async function patch(id: string, upd: Record<string, unknown>) {
    await fetch("/api/admin/prayers", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...upd }),
    });
    load(); showToast("Updated");
  }

  async function bulkAction(action: string) {
    if (selected.size === 0) return;
    await fetch("/api/admin/prayers", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], action }),
    });
    setSelected(new Set()); load(); showToast(`Done: ${action}`);
  }

  async function del(id: string) {
    if (!confirm("Delete this prayer request?")) return;
    await fetch("/api/admin/prayers", {
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
      <AdminPageHeader title="Prayer Requests" description="All prayer requests submitted through the website." />

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
        {(["ALL","NAMED","ANONYMOUS"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`font-lato text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-sm transition-colors
                       ${filter === f ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"}`}>
            {f}
          </button>
        ))}
        <input type="text" placeholder="Search..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 font-lato text-[12px] border border-stone-200 rounded-sm
                     outline-none focus:border-stone-400 bg-white text-stone-800 placeholder:text-stone-300 w-44" />
        <label className="flex items-center gap-1.5 font-lato text-[12px] text-stone-600 cursor-pointer">
          <input type="checkbox" checked={unreadOnly} onChange={e => setUnread(e.target.checked)} />
          Unread only
        </label>
        <label className="flex items-center gap-1.5 font-lato text-[12px] text-stone-600 cursor-pointer">
          <input type="checkbox" checked={archived} onChange={e => setArchived(e.target.checked)} />
          Archived
        </label>
      </div>

      {/* Bulk */}
      {selected.size > 0 && (
        <div className="flex gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-sm flex-wrap">
          <span className="font-lato text-[12px] text-stone-600 mr-2">{selected.size} selected</span>
          {[
            { label: "Mark Read",   action: "read"      },
            { label: "Mark Unread", action: "unread"    },
            { label: "Approve/Publish", action: "approve" },
            { label: "Unapprove",   action: "unapprove" },
            { label: "Archive",     action: "archive"   },
            { label: "Unarchive",   action: "unarchive" },
          ].map(b => (
            <button key={b.action} onClick={() => bulkAction(b.action)}
              className="font-lato text-[10px] font-bold uppercase tracking-wider px-3 py-1.5
                         bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors">
              {b.label}
            </button>
          ))}
          <button onClick={async () => {
            if (!confirm(`Delete ${selected.size} requests?`)) return;
            await fetch("/api/admin/prayers", {
              method: "DELETE", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: [...selected] }),
            });
            setSelected(new Set()); load(); showToast("Deleted");
          }} className="font-lato text-[10px] font-bold uppercase tracking-wider px-3 py-1.5
                        bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
            Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())}
            className="font-lato text-[10px] text-stone-400 hover:text-stone-700 ml-auto">Clear</button>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-4">
        {data.items.length === 0 && (
          <Card><p className="font-lato text-[13px] text-stone-400">No prayer requests found.</p></Card>
        )}
        {data.items.map(p => (
          <Card key={p.id}>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 shrink-0"
                checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {p.anonymous
                        ? <span className="font-lato text-[12px] font-bold text-stone-500 italic">Anonymous</span>
                        : <span className={`font-lato font-bold text-[14px] ${!p.read ? "text-stone-900" : "text-stone-500"}`}>
                            {p.name}
                            {!p.read && <span className="ml-2 inline-block w-2 h-2 bg-[#8c3a63] rounded-full" />}
                          </span>}
                      {p.anonymous && <span className="font-lato text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 px-2 py-0.5 rounded-sm">Anonymous</span>}
                      {p.approved && <span className="font-lato text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-sm">Approved</span>}
                      {p.archived && <span className="font-lato text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-sm">Archived</span>}
                    </div>
                    {!p.anonymous && p.email && (
                      <p className="font-lato text-[12px] text-stone-400 mb-2">{p.email}</p>
                    )}
                    <div className="bg-stone-50 rounded-sm px-4 py-3">
                      <p className="font-lato text-[13px] text-stone-700">{p.prayerRequest}</p>
                    </div>
                    <p className="font-lato text-[11px] text-stone-400 mt-2">
                      {new Date(p.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => patch(p.id, { approved: !p.approved })}
                      className={`font-lato text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 transition-colors
                                 ${p.approved ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
                      {p.approved ? "Unpublish" : "Approve / Publish"}
                    </button>
                    {!p.read && (
                      <button onClick={() => patch(p.id, { read: true })}
                        className="font-lato text-[10px] font-bold uppercase tracking-wider
                                   bg-stone-100 text-stone-600 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                        Mark Read
                      </button>
                    )}
                    <button onClick={() => patch(p.id, { archived: !p.archived })}
                      className="font-lato text-[10px] font-bold uppercase tracking-wider
                                 bg-stone-100 text-stone-600 px-3 py-1.5 hover:bg-stone-200 transition-colors">
                      {p.archived ? "Unarchive" : "Archive"}
                    </button>
                    <button onClick={() => del(p.id)}
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
