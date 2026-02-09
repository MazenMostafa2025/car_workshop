'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, User } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import { EMPLOYEE_ROLE } from '@/lib/constants';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  const { changePassword, isChangingPassword } = useAuth();
  const user = useAuthStore((state) => state.user);

  const form = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleChangePassword = (data: ChangePasswordData) => {
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => form.reset() },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account settings" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Role</p>
                  <Badge variant="outline">
                    {EMPLOYEE_ROLE[user.role as keyof typeof EMPLOYEE_ROLE]?.label ?? user.role}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Loading user info...</p>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleChangePassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" {...form.register('currentPassword')} />
                {form.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">{form.formState.errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...form.register('newPassword')} />
                {form.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{form.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isChangingPassword} className="w-full">
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
