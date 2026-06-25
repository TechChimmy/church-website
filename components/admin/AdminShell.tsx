"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const AdminSidebar = dynamic(() => import("@/components/admin/AdminSidebar"), { ssr: false });
const AdminTopBar = dynamic(() => import("@/components/admin/AdminTopBar"), { ssr: false });

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    // Login page: completely standalone, no sidebar or topbar
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-stone-100 font-lato overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* On mobile, AdminSidebar renders its own top bar (fixed), so add top padding */}
        <div className="lg:hidden h-14 shrink-0" />
        <AdminTopBar user={{}} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
