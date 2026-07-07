"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { MatheitoAssistant } from "@/components/assistant/matheito-assistant";
import { SolintSplashScreen } from "@/components/ui/solint-splash-screen";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <SolintSplashScreen />
      <div className="flex min-h-dvh bg-slate-100">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onToggleSidebar={() => setMobileOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
            {children}
          </main>
          <Footer />
        </div>
        <ToastViewport />
        <MatheitoAssistant />
      </div>
    </>
  );
}
