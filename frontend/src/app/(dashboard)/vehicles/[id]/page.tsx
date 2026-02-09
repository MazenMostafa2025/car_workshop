'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Car, User, History, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { VehicleForm } from '@/components/features/vehicle-form';
import { ConfirmDialog } from '@/components/forms';
import { useVehicle, useUpdateVehicle, useDeleteVehicle } from '@/queries/use-vehicles';
import { useVehicleServiceHistory } from '@/queries/use-service-history';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { VehicleFormData } from '@/lib/validations/vehicle';

function ServiceHistoryCard({ vehicleId }: { vehicleId: number }) {
  const router = useRouter();
  const { data, isLoading } = useVehicleServiceHistory(vehicleId);
  const records = data?.data ?? [];

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" /> Service History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No service history for this vehicle.
          </p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                <div className="rounded-full bg-primary/10 p-2">
                  <Wrench className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{record.description || 'Service performed'}</p>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {formatCurrency(record.totalCost)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{formatDate(record.serviceDate)}</span>
                    {record.mechanic && (
                      <span>by {record.mechanic.firstName} {record.mechanic.lastName}</span>
                    )}
                    {record.mileageAtService && (
                      <span>{record.mileageAtService.toLocaleString()} mi</span>
                    )}
                  </div>
                </div>
                {record.workOrder && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/work-orders/${record.workOrderId}`)}
                  >
                    WO #{record.workOrderId}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VehicleDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: vehicle, isLoading } = useVehicle(id);
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleUpdate = (data: VehicleFormData) => {
    updateMutation.mutate({ id, data }, { onSuccess: () => setEditOpen(false) });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, { onSuccess: () => router.push('/vehicles') });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Vehicle not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/vehicles')}>
          Back to Vehicles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        description={vehicle.licensePlate ? `Plate: ${vehicle.licensePlate}` : 'No plate registered'}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/vehicles')}>
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
        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5" /> Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Make</p>
                <p className="font-medium">{vehicle.make}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Model</p>
                <p className="font-medium">{vehicle.model}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Year</p>
                <p className="font-medium">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Color</p>
                <p className="font-medium">{vehicle.color || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">VIN</p>
                <p className="font-medium font-mono text-xs">{vehicle.vin || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">License Plate</p>
                <p className="font-medium">{vehicle.licensePlate || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mileage</p>
                <p className="font-medium">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Engine</p>
                <p className="font-medium">{vehicle.engineType || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Transmission</p>
                <p className="font-medium">{vehicle.transmissionType || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={vehicle.isActive ? 'default' : 'secondary'} className="mt-1">
                  {vehicle.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" /> Owner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle.customer ? (
              <div className="space-y-3">
                <button
                  className="font-medium text-primary hover:underline"
                  onClick={() => router.push(`/customers/${vehicle.customerId}`)}
                >
                  {vehicle.customer.firstName} {vehicle.customer.lastName}
                </button>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Registered {formatDate(vehicle.createdAt)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No owner information</p>
            )}
          </CardContent>
        </Card>

        {/* Service History */}
        <ServiceHistoryCard vehicleId={id} />
      </div>

      <VehicleForm open={editOpen} onOpenChange={setEditOpen} onSubmit={handleUpdate} defaultValues={vehicle} isLoading={updateMutation.isPending} />
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Vehicle" description={`Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?`} onConfirm={handleDelete} isLoading={deleteMutation.isPending} variant="destructive" />
    </div>
  );
}

export default function VehicleDetailPage() {
  return (
    <Suspense>
      <VehicleDetailContent />
    </Suspense>
  );
}
