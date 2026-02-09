'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CommandPalette } from '@/components/features/command-palette';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount so Zustand can rehydrate from localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing until hydrated (avoids flash / wrong redirect)
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile nav */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuToggle={() => setMobileNavOpen(!mobileNavOpen)}
        />
        <main
          className={cn(
            'flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
