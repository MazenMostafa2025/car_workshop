'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="relative h-full">
          <button
            onClick={onClose}
            className="absolute right-2 top-4 z-10 rounded-md p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar />
        </div>
      </div>
    </>
  );
}
