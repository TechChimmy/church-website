"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useState } from "react";

const AdminSidebar = dynamic(() => import("@/components/admin/AdminSidebar"), { ssr: false });
const AdminTopBar  = dynamic(() => import("@/components/admin/AdminTopBar"),  { ssr: false });

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const { data: session, status } = useSession();
  const isLogin    = pathname === "/admin/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLogin) return <>{children}</>;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center font-lato text-stone-400 text-xs tracking-wider uppercase">
        Loading...
      </div>
    );
  }

  if (!session) return <>{children}</>;

  return (
    <div className="flex h-screen font-lato overflow-hidden" style={{ backgroundColor: "#F4F1F3" }}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AdminTopBar
          user={session.user || {}}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
