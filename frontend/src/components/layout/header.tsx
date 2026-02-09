'use client';

import { Menu, LogOut, User, ChevronDown, PanelLeftClose, PanelLeft, Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export function Header({ onToggleSidebar, sidebarCollapsed, onMobileMenuToggle }: HeaderProps) {
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileMenuToggle}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop collapse button */}
        <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={onToggleSidebar}>
          {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search / Command Palette trigger */}
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2 text-muted-foreground h-9 w-56 justify-start px-3"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
          }}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            Ctrl+K
          </kbd>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user ? getInitials(user.firstName, user.lastName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">{user ? `${user.firstName} ${user.lastName}` : 'User'}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user ? `${user.firstName} ${user.lastName}` : ''}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
