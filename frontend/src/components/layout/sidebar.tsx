'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  ClipboardList,
  Package,
  Truck,
  FileText,
  Calendar,
  CalendarDays,
  DollarSign,
  ShoppingCart,
  History,
  FolderOpen,
  Settings,
  HardHat,
  Factory,
  CreditCard,
  Receipt,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  ClipboardList,
  Package,
  Truck,
  FileText,
  Calendar,
  CalendarDays,
  DollarSign,
  ShoppingCart,
  History,
  FolderOpen,
  Settings,
  HardHat,
  Factory,
  CreditCard,
  Receipt,
  BarChart3,
};

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-sidebar-primary" />
          {!collapsed && <span className="text-lg font-bold text-sidebar-primary">AutoShop</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            const link = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-2',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            return (
              <li key={item.href}>
                {collapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <Separator className="mb-3 bg-sidebar-border" />
        {!collapsed && user && (
          <div className="text-xs text-sidebar-foreground/60">
            <p className="font-medium text-sidebar-foreground/80">{user.firstName} {user.lastName}</p>
            <p className="capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
