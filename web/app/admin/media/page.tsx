"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  AdminPageHeader, Card, DangerButton, Toast, ConfirmModal, EmptyState, Spinner,
} from "@/components/admin/AdminUI";

type MI = {
  id: string; filename: string; url: string; path: string;
  width?: number | null; height?: number | null; size?: number | null; folder: string; createdAt: string;
};

const FOLDERS = ["all","general","hero","about","doctrine","activity","events","testimonials"];

function formatBytes(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
}

export default function AdminMedia() {
  const [items, setItems]         = useState<MI[]>([]);
  const [loading, setLoading]     = useState(true);
  const [folder, setFolder]       = useState("all");
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected]   = useState<MI | null>(null);
  const [toast, setToast]         = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);  // id of image pending deletion
  const [deleting, setDeleting]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/cms/media");
      const all: MI[] = await r.json();
      setItems(folder === "all" ? all : all.filter(i => i.folder === folder));
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function upload(file: File) {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      try {
        const res = await fetch("/api/cms/media", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUri, filename: file.name, folder: folder === "all" ? "general" : folder }),
        });
        if (!res.ok) throw new Error("Upload failed");
        await load();
        showToast("Image uploaded successfully");
      } catch {
        showToast("Failed to upload image", "error");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  }

  async function confirmDelete() {
    if (!confirmId) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/cms/media", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmId }),
      });
      if (!res.ok) throw new Error("Delete failed");
      if (selected?.id === confirmId) setSelected(null);
      await load();
      showToast("Image deleted");
    } catch {
      showToast("Failed to delete image", "error");
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  }

  const pendingItem = items.find(i => i.id === confirmId) ?? (selected?.id === confirmId ? selected : null);

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Upload, browse and manage all church images."
      />

      {/* Upload + filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {FOLDERS.map(f => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className="font-lato text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all"
              style={
                folder === f
                  ? { backgroundColor: "var(--burgundy)", color: "white" }
                  : { backgroundColor: "white", color: "#7A6570", border: "1px solid rgba(140,58,99,0.2)" }
              }
            >
              {f}
            </button>
          ))}
        </div>
        <div>
          <input
            ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="font-lato text-[11px] font-bold uppercase tracking-widest
                       px-5 py-2.5 rounded-sm transition-all disabled:opacity-50
                       flex items-center gap-2"
            style={{ backgroundColor: "var(--burgundy)", color: "white" }}
            onMouseEnter={e => {
              if (!uploading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy-dark)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)";
            }}
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
                </svg>
                Uploading…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Image
              </>
            )}
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="rounded-sm p-8 text-center mb-6 cursor-pointer transition-all"
        style={{ border: "2px dashed rgba(140,58,99,0.2)" }}
        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = "var(--burgundy)"; }}
        onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,58,99,0.2)"; }}
        onDrop={e => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,58,99,0.2)";
          const f = e.dataTransfer.files[0];
          if (f) upload(f);
        }}
        onClick={() => fileRef.current?.click()}
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p className="font-lato text-[13px]" style={{ color: "#9B8A90" }}>
          {uploading ? "Uploading…" : "Drag & drop images here, or click to browse"}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size={28} />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState icon="🖼" title="No images yet" description="Upload your first image using the button above." />
        </Card>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {items.map(item => (
            <div
              key={item.id}
              className="rounded-sm overflow-hidden cursor-pointer group transition-all"
              style={{
                border: selected?.id === item.id
                  ? "2px solid var(--burgundy)"
                  : "1px solid rgba(140,58,99,0.12)",
                boxShadow: selected?.id === item.id
                  ? "0 0 0 3px rgba(140,58,99,0.12)"
                  : "0 2px 8px rgba(140,58,99,0.04)",
              }}
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
            >
              <div className="relative w-full bg-stone-100" style={{ paddingTop: "60%" }}>
                <Image src={item.url} alt={item.filename} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {/* Quick-delete on hover */}
                <button
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white
                             flex items-center justify-center opacity-0 group-hover:opacity-100
                             transition-opacity z-10 hover:bg-red-700"
                  onClick={e => { e.stopPropagation(); setConfirmId(item.id); }}
                  title="Delete image"
                >
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="px-2 py-2">
                <p className="font-lato text-[10px] font-bold truncate" style={{ color: "var(--text-dark)" }}>
                  {item.filename}
                </p>
                <p className="font-lato text-[10px]" style={{ color: "#9B8A90" }}>
                  {formatBytes(item.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <Card className="mt-5">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative w-full sm:w-48 h-36 shrink-0 bg-stone-50 rounded-sm overflow-hidden"
              style={{ border: "1px solid rgba(140,58,99,0.1)" }}>
              <Image src={selected.url} alt={selected.filename} fill className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-playfair text-[16px] font-bold mb-3 truncate" style={{ color: "var(--text-dark)" }}>
                {selected.filename}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-4">
                <p className="font-lato text-[11px]" style={{ color: "#9B8A90" }}>
                  <span className="font-bold uppercase tracking-wider">Folder</span><br />
                  {selected.folder}
                </p>
                <p className="font-lato text-[11px]" style={{ color: "#9B8A90" }}>
                  <span className="font-bold uppercase tracking-wider">Size</span><br />
                  {formatBytes(selected.size)}
                  {selected.width && selected.height ? ` · ${selected.width}×${selected.height}` : ""}
                </p>
                <p className="font-lato text-[11px]" style={{ color: "#9B8A90" }}>
                  <span className="font-bold uppercase tracking-wider">Uploaded</span><br />
                  {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  readOnly value={selected.url}
                  className="flex-1 px-3 py-2 font-lato text-[11px] rounded-sm outline-none truncate"
                  style={{ border: "1px solid rgba(140,58,99,0.15)", color: "#7A6570", backgroundColor: "rgba(140,58,99,0.03)" }}
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(selected.url); showToast("URL copied!"); }}
                  className="font-lato text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-sm
                             transition-colors whitespace-nowrap"
                  style={{ border: "1px solid rgba(140,58,99,0.2)", color: "var(--burgundy)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.05)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                >
                  Copy URL
                </button>
              </div>
              <DangerButton
                label="Delete Image"
                onClick={() => setConfirmId(selected.id)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={confirmId !== null}
        title="Delete Image"
        message={
          pendingItem
            ? `Are you sure you want to permanently delete "${pendingItem.filename}"? This cannot be undone.`
            : "Are you sure you want to permanently delete this image? This cannot be undone."
        }
        confirmLabel="Delete Image"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => { if (!deleting) setConfirmId(null); }}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
