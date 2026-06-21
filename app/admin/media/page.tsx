"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  AdminPageHeader, Card, DangerButton, Toast,
} from "@/components/admin/AdminUI";

type MI = {
  id: string; filename: string; url: string; publicId: string;
  width: number; height: number; size: number; folder: string; createdAt: string;
};

const FOLDERS = ["all","general","hero","about","events","testimonials"];

function formatBytes(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
}

export default function AdminMedia() {
  const [items, setItems]     = useState<MI[]>([]);
  const [folder, setFolder]   = useState("all");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [selected, setSelected]   = useState<MI | null>(null);
  const [toast, setToast]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const r = await fetch("/api/cms/media");
    const all: MI[] = await r.json();
    setItems(folder === "all" ? all : all.filter(i => i.folder === folder));
  }, [folder]);

  useEffect(() => { load(); }, [load]);

  async function upload(file: File) {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      try {
        await fetch("/api/cms/media", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUri, filename: file.name, folder: folder === "all" ? "general" : folder }),
        });
        load();
        showToast("Uploaded successfully");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function del(id: string) {
    if (!confirm("Permanently delete this image?")) return;
    setDeleting(id);
    await fetch("/api/cms/media", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    if (selected?.id === id) setSelected(null);
    load();
    showToast("Deleted");
  }

  return (
    <div>
      <AdminPageHeader title="Media Library"
        description="Upload, browse and manage all church images." />

      {/* Upload + filters bar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex gap-1">
          {FOLDERS.map(f => (
            <button key={f} onClick={() => setFolder(f)}
              className={`font-lato text-[11px] font-bold uppercase tracking-wider px-3 py-2
                         rounded-sm transition-colors
                         ${folder === f
                           ? "bg-stone-900 text-white"
                           : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"}`}>
              {f}
            </button>
          ))}
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if(f) upload(f); }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="font-lato bg-amber-500 text-stone-900 text-[11px] font-bold
                       uppercase tracking-widest px-5 py-2.5 rounded-sm
                       hover:bg-amber-400 transition-colors disabled:opacity-50">
            {uploading ? "Uploading…" : "+ Upload Image"}
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-stone-200 rounded-sm p-6 text-center mb-5
                   hover:border-amber-400 transition-colors cursor-pointer"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) upload(f); }}
        onClick={() => fileRef.current?.click()}
      >
        <p className="font-lato text-[13px] text-stone-400">
          {uploading ? "Uploading…" : "Drag & drop images here, or click to upload"}
        </p>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <Card><p className="font-lato text-[13px] text-stone-400">No images in this folder yet.</p></Card>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {items.map(item => (
            <div key={item.id}
              className={`border rounded-sm overflow-hidden cursor-pointer group
                         ${selected?.id === item.id ? "border-amber-400" : "border-stone-200"}`}
              onClick={() => setSelected(selected?.id === item.id ? null : item)}>
              <div className="relative w-full bg-stone-100" style={{ paddingTop: "60%" }}>
                <Image src={item.url} alt={item.filename} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="px-2 py-2">
                <p className="font-lato text-[10px] text-stone-600 truncate font-bold">{item.filename}</p>
                <p className="font-lato text-[10px] text-stone-400">{formatBytes(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <Card className="mt-5">
          <div className="flex gap-6 items-start">
            <div className="relative w-48 h-32 shrink-0 bg-stone-100 rounded-sm overflow-hidden">
              <Image src={selected.url} alt={selected.filename} fill className="object-contain" />
            </div>
            <div className="flex-1">
              <p className="font-lato font-bold text-[14px] text-stone-900 mb-2">{selected.filename}</p>
              <p className="font-lato text-[12px] text-stone-400 mb-1">Folder: {selected.folder}</p>
              <p className="font-lato text-[12px] text-stone-400 mb-1">
                Size: {formatBytes(selected.size)} · {selected.width}×{selected.height}
              </p>
              <p className="font-lato text-[12px] text-stone-400 mb-3">
                Uploaded: {new Date(selected.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-3 mb-3">
                <input
                  readOnly value={selected.url}
                  className="flex-1 px-3 py-2 font-lato text-[11px] bg-stone-50 border
                             border-stone-200 text-stone-600 outline-none"
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(selected.url); showToast("URL copied!"); }}
                  className="font-lato text-[11px] font-bold uppercase tracking-wider
                             bg-stone-100 text-stone-700 px-3 py-2 hover:bg-stone-200 transition-colors">
                  Copy URL
                </button>
              </div>
              <DangerButton
                loading={deleting === selected.id}
                onClick={() => del(selected.id)}
                label="Delete Image"
              />
            </div>
          </div>
        </Card>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
