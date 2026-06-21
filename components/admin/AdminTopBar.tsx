"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

interface Props {
  user: { name?: string | null; email?: string | null };
}

export default function AdminTopBar({ user }: Props) {
  return (
    <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-end px-4 sm:px-8 shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="font-lato text-[12px] sm:text-[13px] text-stone-500 hidden sm:block truncate max-w-[200px]">
          {user.name ?? user.email}
        </span>
        <Link
          href="/"
          className="font-lato text-[10px] sm:text-[11px] font-bold uppercase tracking-widest
                     bg-stone-100 text-stone-700 px-3 sm:px-4 py-1.5 rounded-sm
                     hover:bg-stone-200 transition-colors whitespace-nowrap no-underline"
        >
          Home
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="font-lato text-[10px] sm:text-[11px] font-bold uppercase tracking-widest
                     bg-stone-900 text-white px-3 sm:px-4 py-1.5 rounded-sm
                     transition-colors whitespace-nowrap"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
