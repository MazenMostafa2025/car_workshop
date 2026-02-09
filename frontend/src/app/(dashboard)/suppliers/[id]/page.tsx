'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Phone, Mail, MapPin, Package } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { SupplierForm } from '@/components/features/supplier-form';
import { ConfirmDialog } from '@/components/forms';
import { useSupplier, useUpdateSupplier, useDeleteSupplier } from '@/queries/use-suppliers';
import { formatDate } from '@/lib/utils';
import type { SupplierFormData } from '@/lib/validations/supplier';

function SupplierDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: supplier, isLoading } = useSupplier(id);
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleUpdate = (data: SupplierFormData) => {
    updateMutation.mutate({ id, data }, { onSuccess: () => setEditOpen(false) });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, { onSuccess: () => router.push('/suppliers') });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Supplier not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/suppliers')}>
          Back to Suppliers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.name}
        description={`Added ${formatDate(supplier.createdAt)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/suppliers')}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.contactPerson && (
              <div>
                <p className="text-xs text-muted-foreground">Contact Person</p>
                <p className="text-sm font-medium">{supplier.contactPerson}</p>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{supplier.phone}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{supplier.email}</span>
              </div>
            )}
            {(supplier.address || supplier.city) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  {supplier.address && <p>{supplier.address}</p>}
                  {supplier.city && <p>{supplier.city}{supplier.postalCode ? `, ${supplier.postalCode}` : ''}</p>}
                </div>
              </div>
            )}
            {supplier.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{supplier.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" /> Parts Supplied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {supplier._count?.parts ?? 0}
              </Badge>
              <span className="text-sm text-muted-foreground">parts in inventory</span>
            </div>
            <p className="text-sm text-muted-foreground py-4 text-center">
              Detailed parts list will be available in the Inventory module.
            </p>
          </CardContent>
        </Card>
      </div>

      <SupplierForm open={editOpen} onOpenChange={setEditOpen} onSubmit={handleUpdate} defaultValues={supplier} isLoading={updateMutation.isPending} />
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Supplier" description={`Delete "${supplier.name}"? This action cannot be undone.`} onConfirm={handleDelete} isLoading={deleteMutation.isPending} variant="destructive" />
    </div>
  );
}

export default function SupplierDetailPage() {
  return (
    <Suspense>
      <SupplierDetailContent />
    </Suspense>
  );
}
