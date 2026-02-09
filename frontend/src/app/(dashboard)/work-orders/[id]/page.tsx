'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, User, Car, Wrench, Package, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useWorkOrder,
  useUpdateWorkOrderStatus,
  useAddWorkOrderService,
  useRemoveWorkOrderService,
  useAddWorkOrderPart,
  useRemoveWorkOrderPart,
} from '@/queries/use-work-orders';
import { useServices } from '@/queries/use-services';
import { useParts } from '@/queries/use-inventory';
import { formatCurrency, formatDate, formatStatus } from '@/lib/utils';
import { WORK_ORDER_STATUS } from '@/lib/constants';
import type { WorkOrderServiceFormData, WorkOrderPartFormData } from '@/lib/validations/work-order';

export default function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const workOrderId = parseInt(id);
  const { data: workOrder, isLoading } = useWorkOrder(workOrderId);
  const statusMutation = useUpdateWorkOrderStatus();
  const addServiceMutation = useAddWorkOrderService();
  const removeServiceMutation = useRemoveWorkOrderService();
  const addPartMutation = useAddWorkOrderPart();
  const removePartMutation = useRemoveWorkOrderPart();

  const { data: servicesData } = useServices();
  const { data: partsData } = useParts({ limit: 200 });

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedPartId, setSelectedPartId] = useState<string>('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Work order not found</h2>
        <Button asChild className="mt-4">
          <Link href="/work-orders">Back to Work Orders</Link>
        </Button>
      </div>
    );
  }

  const handleStatusChange = (status: string) => {
    statusMutation.mutate({ id: workOrderId, status });
  };

  const handleAddService = () => {
    if (!selectedServiceId) return;
    const service = servicesData?.data?.find((s) => s.id === Number(selectedServiceId));
    if (!service) return;
    const data: WorkOrderServiceFormData = {
      serviceId: service.id,
      mechanicId: null,
      quantity: 1,
      unitPrice: service.basePrice,
      notes: '',
    };
    addServiceMutation.mutate(
      { workOrderId, data },
      { onSuccess: () => setSelectedServiceId('') }
    );
  };

  const handleAddPart = () => {
    if (!selectedPartId) return;
    const part = partsData?.data?.find((p) => p.id === Number(selectedPartId));
    if (!part) return;
    const data: WorkOrderPartFormData = {
      partId: part.id,
      quantity: 1,
      unitPrice: part.sellingPrice,
    };
    addPartMutation.mutate(
      { workOrderId, data },
      { onSuccess: () => setSelectedPartId('') }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Work Order #${workOrder.id}`}
        description={workOrder.description || 'No description'}
        actions={
          <Button variant="outline" asChild>
            <Link href="/work-orders">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        }
      />

      {/* Status & Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {workOrder.customer ? (
              <>
                <p className="font-medium">
                  <Link href={`/customers/${workOrder.customer.id}`} className="text-primary hover:underline">
                    {workOrder.customer.firstName} {workOrder.customer.lastName}
                  </Link>
                </p>
                <p className="text-muted-foreground">{workOrder.customer.phone}</p>
              </>
            ) : (
              <p className="text-muted-foreground">No customer assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" /> Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {workOrder.vehicle ? (
              <>
                <p className="font-medium">
                  <Link href={`/vehicles/${workOrder.vehicle.id}`} className="text-primary hover:underline">
                    {workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}
                  </Link>
                </p>
                {workOrder.vehicle.licensePlate && (
                  <p className="text-muted-foreground">{workOrder.vehicle.licensePlate}</p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No vehicle assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Select value={workOrder.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px] h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WORK_ORDER_STATUS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority</span>
              <Badge variant="outline">{formatStatus(workOrder.priority)}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Labor</span>
              <span>{formatCurrency(workOrder.totalLaborCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Parts</span>
              <span>{formatCurrency(workOrder.totalPartsCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(workOrder.totalCost)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diagnosis & Notes */}
      {(workOrder.diagnosis || workOrder.notes) && (
        <div className="grid gap-6 md:grid-cols-2">
          {workOrder.diagnosis && (
            <Card>
              <CardHeader><CardTitle>Diagnosis</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{workOrder.diagnosis}</p></CardContent>
            </Card>
          )}
          {workOrder.notes && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{workOrder.notes}</p></CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Services & Parts Tabs */}
      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">
            <Wrench className="mr-2 h-4 w-4" /> Services ({workOrder.services?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="parts">
            <Package className="mr-2 h-4 w-4" /> Parts ({workOrder.parts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a service to add" />
              </SelectTrigger>
              <SelectContent>
                {servicesData?.data?.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} — {formatCurrency(s.basePrice)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddService} disabled={!selectedServiceId || addServiceMutation.isPending}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          {workOrder.services && workOrder.services.length > 0 ? (
            <div className="border rounded-lg divide-y">
              {workOrder.services.map((ws) => (
                <div key={ws.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium">{ws.service?.name || `Service #${ws.serviceId}`}</p>
                    {ws.mechanic && (
                      <p className="text-sm text-muted-foreground">
                        Mechanic: {ws.mechanic.firstName} {ws.mechanic.lastName}
                      </p>
                    )}
                    {ws.notes && <p className="text-sm text-muted-foreground">{ws.notes}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      {ws.quantity} × {formatCurrency(ws.unitPrice)} = {formatCurrency(ws.totalPrice)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeServiceMutation.mutate({ workOrderId, serviceId: ws.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No services added yet</p>
          )}
        </TabsContent>

        <TabsContent value="parts" className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={selectedPartId} onValueChange={setSelectedPartId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a part to add" />
              </SelectTrigger>
              <SelectContent>
                {partsData?.data?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} {p.partNumber ? `(${p.partNumber})` : ''} — {formatCurrency(p.sellingPrice)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddPart} disabled={!selectedPartId || addPartMutation.isPending}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          {workOrder.parts && workOrder.parts.length > 0 ? (
            <div className="border rounded-lg divide-y">
              {workOrder.parts.map((wp) => (
                <div key={wp.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium">
                      {wp.part?.name || `Part #${wp.partId}`}
                      {wp.part?.partNumber && <span className="text-muted-foreground ml-1">({wp.part.partNumber})</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      {wp.quantity} × {formatCurrency(wp.unitPrice)} = {formatCurrency(wp.totalPrice)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removePartMutation.mutate({ workOrderId, partId: wp.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No parts added yet</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Dates */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(workOrder.createdAt)}</p>
            </div>
            {workOrder.startDate && (
              <div>
                <p className="text-muted-foreground">Started</p>
                <p className="font-medium">{formatDate(workOrder.startDate)}</p>
              </div>
            )}
            {workOrder.estimatedCompletionDate && (
              <div>
                <p className="text-muted-foreground">Est. Completion</p>
                <p className="font-medium">{formatDate(workOrder.estimatedCompletionDate)}</p>
              </div>
            )}
            {workOrder.completionDate && (
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="font-medium">{formatDate(workOrder.completionDate)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
