// components/admin/AdminUI.tsx
// Shared UI primitives for all admin pages — enhanced design system

"use client";

import { useEffect } from "react";

// ─── Page Header ────────────────────────────────────────────────────────────

export function AdminPageHeader({
  title, description,
}: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1
        className="font-playfair text-[26px] font-bold leading-tight"
        style={{ color: "var(--text-dark)" }}
      >
        {title}
      </h1>
      {description && (
        <p className="font-lato text-[13px] mt-1.5" style={{ color: "#9B8A90" }}>
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({
  children, className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-sm p-6 ${className}`}
      style={{ border: "1px solid rgba(140,58,99,0.1)", boxShadow: "0 2px 12px rgba(140,58,99,0.05)" }}
    >
      {children}
    </div>
  );
}

// ─── Card Section ────────────────────────────────────────────────────────────

export function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7 last:mb-0">
      <h3
        className="font-lato text-[10px] font-bold uppercase tracking-widest mb-4 pb-2"
        style={{ color: "#9B8A90", borderBottom: "1px solid rgba(140,58,99,0.1)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Field ───────────────────────────────────────────────────────────────────

export function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-5">
      <label
        className="block font-lato text-[11px] font-bold uppercase tracking-widest mb-2"
        style={{ color: "#7A6570" }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="font-lato text-[11px] mt-1.5" style={{ color: "#9B8A90" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 font-lato text-[13px] rounded-sm
                 outline-none transition-colors duration-150
                 placeholder:text-stone-300 bg-white ${props.className ?? ""}`}
      style={{
        border: "1px solid rgba(140,58,99,0.2)",
        color: "var(--text-dark)",
        ...(props.style ?? {}),
      }}
      onFocus={e => {
        (e.target as HTMLElement).style.borderColor = "var(--burgundy)";
        props.onFocus?.(e);
      }}
      onBlur={e => {
        (e.target as HTMLElement).style.borderColor = "rgba(140,58,99,0.2)";
        props.onBlur?.(e);
      }}
    />
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 font-lato text-[13px] rounded-sm
                 outline-none transition-colors duration-150 resize-y
                 placeholder:text-stone-300 bg-white ${props.className ?? ""}`}
      style={{
        border: "1px solid rgba(140,58,99,0.2)",
        color: "var(--text-dark)",
        ...(props.style ?? {}),
      }}
      onFocus={e => {
        (e.target as HTMLElement).style.borderColor = "var(--burgundy)";
        props.onFocus?.(e);
      }}
      onBlur={e => {
        (e.target as HTMLElement).style.borderColor = "rgba(140,58,99,0.2)";
        props.onBlur?.(e);
      }}
    />
  );
}

// ─── Save Button ─────────────────────────────────────────────────────────────

export function SaveButton({
  loading, label = "Save Changes", onClick,
}: { loading?: boolean; label?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="font-lato text-white text-[11px] font-bold uppercase tracking-widest
                 px-6 py-2.5 rounded-sm transition-all duration-150 disabled:opacity-50
                 hover:shadow-md"
      style={{ backgroundColor: "var(--burgundy)" }}
      onMouseEnter={e => {
        if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy-dark)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)";
      }}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
          </svg>
          Saving…
        </span>
      ) : label}
    </button>
  );
}

// ─── Danger Button ───────────────────────────────────────────────────────────

export function DangerButton({
  label = "Delete", onClick, loading,
}: { label?: string; onClick?: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="font-lato text-white text-[11px] font-bold uppercase tracking-widest
                 px-4 py-2 rounded-sm transition-all duration-150 disabled:opacity-50
                 hover:shadow-md"
      style={{ backgroundColor: "#DC2626" }}
      onMouseEnter={e => {
        if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "#B91C1C";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "#DC2626";
      }}
    >
      {loading ? "Deleting…" : label}
    </button>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

export function Badge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    PENDING:   { bg: "rgba(234,179,8,0.12)",  color: "#92400E" },
    APPROVED:  { bg: "rgba(59,130,246,0.12)", color: "#1D4ED8" },
    REJECTED:  { bg: "rgba(220,38,38,0.1)",   color: "#B91C1C" },
    PUBLISHED: { bg: "rgba(22,163,74,0.1)",   color: "#15803D" },
  };
  const s = styles[status] ?? { bg: "rgba(140,58,99,0.08)", color: "var(--burgundy)" };
  return (
    <span
      className="font-lato text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

export function Toast({
  message, type = "success",
}: { message: string; type?: "success" | "error" }) {
  const isSuccess = type === "success";
  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3
                 px-5 py-3.5 rounded-sm shadow-xl font-lato text-[13px] font-bold
                 animate-in slide-in-from-bottom-2 duration-300"
      style={{
        backgroundColor: isSuccess ? "var(--burgundy)" : "#DC2626",
        color: "white",
        boxShadow: isSuccess
          ? "0 8px 32px rgba(140,58,99,0.35)"
          : "0 8px 32px rgba(220,38,38,0.35)",
      }}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
        {isSuccess
          ? <polyline points="20 6 9 17 4 12" />
          : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
        }
      </svg>
      {message}
    </div>
  );
}

// ─── Confirm Modal ───────────────────────────────────────────────────────────

export function ConfirmModal({
  open,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      {/* Modal */}
      <div
        className="relative w-full max-w-[400px] bg-white rounded-sm shadow-2xl"
        style={{ border: "1px solid rgba(140,58,99,0.15)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(140,58,99,0.08)" }}
        >
          <div className="flex items-center gap-3">
            {danger && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(220,38,38,0.1)" }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#DC2626" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            )}
            <h3 className="font-playfair text-[17px] font-bold" style={{ color: "var(--text-dark)" }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="font-lato text-[14px]" style={{ color: "#6B5A60" }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: "1px solid rgba(140,58,99,0.08)" }}
        >
          <button
            onClick={onCancel}
            disabled={loading}
            className="font-lato text-[11px] font-bold uppercase tracking-widest
                       px-5 py-2.5 rounded-sm transition-colors disabled:opacity-50"
            style={{
              border: "1px solid rgba(140,58,99,0.2)",
              color: "var(--burgundy)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.05)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
            }}
          >
            Cancel
          </button>
          {danger ? (
            <DangerButton
              label={loading ? "Deleting…" : confirmLabel}
              loading={loading}
              onClick={onConfirm}
            />
          ) : (
            <SaveButton
              label={loading ? "Processing…" : confirmLabel}
              loading={loading}
              onClick={onConfirm}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="var(--burgundy)"
        strokeWidth="3"
        strokeDasharray="32"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

export function EmptyState({
  icon = "📭",
  title,
  description,
}: { icon?: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4 opacity-40">{icon}</span>
      <h3 className="font-playfair text-[18px] font-bold mb-1" style={{ color: "var(--text-dark)" }}>
        {title}
      </h3>
      {description && (
        <p className="font-lato text-[13px]" style={{ color: "#9B8A90" }}>
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Table ───────────────────────────────────────────────────────────────────

export function Table({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: React.ReactNode;
  empty?: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-sm" style={{ border: "1px solid rgba(140,58,99,0.1)" }}>
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: "rgba(140,58,99,0.04)" }}>
            {headers.map(h => (
              <th
                key={h}
                className="font-lato text-[10px] font-bold uppercase tracking-widest
                           text-left px-4 py-3"
                style={{ color: "#7A6570", borderBottom: "1px solid rgba(140,58,99,0.1)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children ?? empty}</tbody>
      </table>
    </div>
  );
}

export function TableRow({
  children, onClick,
}: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr
      className={`transition-colors ${onClick ? "cursor-pointer" : ""}`}
      style={{ borderBottom: "1px solid rgba(140,58,99,0.06)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.03)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={`font-lato text-[13px] px-4 py-3 ${className}`} style={{ color: "var(--text-dark)" }}>
      {children}
    </td>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

export function StatCard({
  label, value, accent = false,
}: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div
      className="rounded-sm px-5 py-5"
      style={{
        backgroundColor: accent ? "var(--burgundy)" : "white",
        border: accent ? "none" : "1px solid rgba(140,58,99,0.1)",
        boxShadow: accent
          ? "0 4px 20px rgba(140,58,99,0.3)"
          : "0 2px 8px rgba(140,58,99,0.04)",
      }}
    >
      <p
        className="font-lato text-[10px] font-bold uppercase tracking-widest mb-2"
        style={{ color: accent ? "rgba(255,255,255,0.65)" : "#9B8A90" }}
      >
        {label}
      </p>
      <p
        className="font-playfair text-[30px] font-bold leading-none"
        style={{ color: accent ? "white" : "var(--text-dark)" }}
      >
        {value}
      </p>
    </div>
  );
}
