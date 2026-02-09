'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Car, Wrench, ClipboardList, Package,
  CalendarDays, ShoppingCart, Factory, FileText, Receipt,
  BarChart3, HardHat, Search, Settings, CreditCard,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Users, Car, Wrench, ClipboardList, Package,
  CalendarDays, ShoppingCart, Factory, FileText, Receipt,
  BarChart3, HardHat, Settings, CreditCard, Search,
};

interface CommandItem {
  label: string;
  href: string;
  icon: LucideIcon;
  keywords: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Build items from NAV_ITEMS filtered by role
  const items: CommandItem[] = useMemo(() => {
    return NAV_ITEMS
      .filter((item) => {
        if (!item.roles) return true;
        return user?.role && item.roles.includes(user.role);
      })
      .map((item) => ({
        label: item.label,
        href: item.href,
        icon: iconMap[item.icon] || LayoutDashboard,
        keywords: [item.label.toLowerCase()],
      }));
  }, [user]);

  // Add Settings as an extra item
  const allItems = useMemo(() => [
    ...items,
    { label: 'Settings', href: '/settings', icon: Settings, keywords: ['settings', 'preferences', 'account', 'password'] },
  ], [items]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q)),
    );
  }, [allItems, search]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length, search]);

  // Navigate to item
  const navigate = useCallback(
    (item: CommandItem) => {
      setOpen(false);
      setSearch('');
      router.push(item.href);
    },
    [router],
  );

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Arrow / Enter navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      navigate(filtered[selectedIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
      <DialogContent className="max-w-lg gap-0 p-0 overflow-hidden" aria-describedby={undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>Navigate to page</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            className="border-0 focus-visible:ring-0 shadow-none h-12 text-sm"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No results found.</p>
          ) : (
            <ul role="listbox">
              {filtered.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.href}
                    role="option"
                    aria-selected={idx === selectedIndex}
                    onClick={() => navigate(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      idx === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground/70 hover:bg-accent/50',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1">↑</kbd>
            <kbd className="rounded border bg-muted px-1">↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1">Enter</kbd>
            Open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1">Esc</kbd>
            Close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
