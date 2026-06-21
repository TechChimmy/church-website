// components/admin/AdminUI.tsx
// Shared UI primitives for all admin pages

"use client";

export function AdminPageHeader({
  title, description,
}: { title: string; description?: string }) {
  return (
    <div className="mb-7">
      <h1 className="font-playfair text-[22px] font-bold text-stone-900">{title}</h1>
      {description && (
        <p className="font-lato text-[13px] text-stone-400 mt-1">{description}</p>
      )}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-stone-200 rounded-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7 last:mb-0">
      <h3 className="font-lato text-[11px] font-bold uppercase tracking-widest
                     text-stone-400 mb-4 pb-2 border-b border-stone-100">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <label className="block font-lato text-[12px] font-bold uppercase tracking-widest
                        text-stone-500 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="font-lato text-[11px] text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 font-lato text-[13px] border border-stone-300
                 text-stone-800 outline-none focus:border-[var(--burgundy)] transition-colors
                 bg-white ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2.5 font-lato text-[13px] border border-stone-300
                 text-stone-800 outline-none focus:border-[var(--burgundy)] transition-colors
                 bg-white resize-y ${props.className ?? ""}`}
    />
  );
}

export function SaveButton({
  loading, label = "Save Changes", onClick,
}: { loading?: boolean; label?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="font-lato text-white text-[11px] font-bold
                 uppercase tracking-widest px-6 py-2.5 rounded-sm
                 transition-colors disabled:opacity-50"
      style={{ backgroundColor: "var(--burgundy)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy-dark)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)"; }}
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

export function DangerButton({
  label = "Delete", onClick, loading,
}: { label?: string; onClick?: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="font-lato bg-red-600 text-white text-[11px] font-bold
                 uppercase tracking-widest px-4 py-2 rounded-sm
                 hover:bg-red-700 transition-colors disabled:opacity-50"
    >
      {loading ? "…" : label}
    </button>
  );
}

export function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING:   "bg-yellow-100 text-yellow-700",
    APPROVED:  "bg-blue-100 text-blue-700",
    REJECTED:  "bg-red-100 text-red-600",
    PUBLISHED: "bg-green-100 text-green-700",
  };
  return (
    <span className={`font-lato text-[10px] font-bold uppercase tracking-wider
                      px-2 py-0.5 rounded-sm ${colors[status] ?? "bg-stone-100 text-stone-600"}`}>
      {status}
    </span>
  );
}

export function Toast({
  message, type = "success",
}: { message: string; type?: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-sm shadow-lg
                     font-lato text-[13px] font-bold
                     ${type === "success"
                       ? "bg-green-600 text-white"
                       : "bg-red-600 text-white"}`}>
      {message}
    </div>
  );
}
