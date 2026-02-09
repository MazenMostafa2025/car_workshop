'use client';

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Pencil, Phone, Mail, MapPin, Car, Wrench, FileText, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { CustomerForm } from '@/components/features/customer-form';
import { ConfirmDialog } from '@/components/forms';
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from '@/queries/use-customers';
import { useCustomerVehicles } from '@/queries/use-vehicles';
import { formatDate } from '@/lib/utils';
import type { CustomerFormData } from '@/lib/validations/customer';

function CustomerDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: customer, isLoading } = useCustomer(id);
  const { data: vehicles } = useCustomerVehicles(id);
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleUpdate = (data: CustomerFormData) => {
    updateMutation.mutate({ id, data }, { onSuccess: () => setEditOpen(false) });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, { onSuccess: () => router.push('/customers') });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        description={`Customer since ${formatDate(customer.dateRegistered)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/customers')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
            )}
            {(customer.address || customer.city) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  {customer.address && <p>{customer.address}</p>}
                  {customer.city && (
                    <p>
                      {customer.city}
                      {customer.postalCode ? `, ${customer.postalCode}` : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
            {customer.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{customer.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="vehicles">
            <TabsList>
              <TabsTrigger value="vehicles" className="gap-2">
                <Car className="h-4 w-4" /> Vehicles ({vehicles?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="workorders" className="gap-2">
                <Wrench className="h-4 w-4" /> Work Orders ({customer._count?.workOrders ?? 0})
              </TabsTrigger>
              <TabsTrigger value="invoices" className="gap-2">
                <FileText className="h-4 w-4" /> Invoices
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles" className="mt-4 space-y-3">
              {vehicles && vehicles.length > 0 ? (
                vehicles.map((v) => (
                  <Card
                    key={v.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/vehicles/${v.id}`)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">
                          {v.year} {v.make} {v.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {v.licensePlate || 'No plate'} · {v.color || 'N/A'}
                        </p>
                      </div>
                      <Badge variant={v.isActive ? 'default' : 'secondary'}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No vehicles registered.</p>
              )}
            </TabsContent>

            <TabsContent value="workorders" className="mt-4">
              <p className="text-sm text-muted-foreground py-8 text-center">
                Work orders will be available in the next phase.
              </p>
            </TabsContent>

            <TabsContent value="invoices" className="mt-4">
              <p className="text-sm text-muted-foreground py-8 text-center">
                Invoices will be available in the next phase.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog */}
      <CustomerForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        defaultValues={customer}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customer.firstName} ${customer.lastName}? This will also remove all associated data.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <Suspense>
      <CustomerDetailContent />
    </Suspense>
  );
}
