"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { SolintAssistant } from "@/components/ui/solint-assistant";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { PwaRegister } from "@/components/ui/pwa-register";
import { PwaInstallCard } from "@/components/ui/pwa-install-card";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("solint_user");

    if (!raw) {
      window.location.href = "/login";
      return;
    }

    setCheckingSession(false);
  }, []);

  function handleToggleSidebar() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileSidebarOpen((value) => !value);
      return;
    }

    setCollapsed((value) => !value);
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] p-4">
        <PwaRegister />
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
            SOLINT SEGUROS
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Validando sesión...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-[#f4f7fb]">
      <PwaRegister />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onToggleSidebar={handleToggleSidebar} />

        <div className="solint-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6 xl:p-8">
          <div className="mx-auto w-full max-w-[1920px]">{children}</div>
        </div>

        <Footer />
      </section>

      <PwaInstallCard />
      <SolintAssistant />
      <ToastViewport />
    </main>
  );
}
