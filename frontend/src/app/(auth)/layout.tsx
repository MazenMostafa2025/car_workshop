import { type ReactNode } from 'react';
import { Wrench } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side – branding */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-primary p-12 text-primary-foreground lg:flex">
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
            <Wrench className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AutoShop</h1>
            <p className="mt-2 text-lg text-primary-foreground/80">Car Workshop Management System</p>
          </div>
          <p className="mx-auto max-w-md text-sm text-primary-foreground/60">
            Manage your workshop operations, track work orders, handle inventory, schedule appointments, and streamline
            your billing — all in one place.
          </p>
        </div>
      </div>

      {/* Right side – auth forms */}
      <div className="flex flex-1 items-center justify-center p-8">{children}</div>
    </div>
  );
}
