'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Trash2, MoreHorizontal, PackageCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog, SearchInput } from '@/components/forms';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePurchaseOrders, useCreatePurchaseOrder, useDeletePurchaseOrder, useReceivePurchaseOrder } from '@/queries/use-purchase-orders';
import { useSuppliers } from '@/queries/use-suppliers';
import { usePagination } from '@/hooks/use-pagination';
import { useConfirmation } from '@/hooks/use-confirmation';
import { formatCurrency, formatDate, formatStatus } from '@/lib/utils';
import { PO_STATUS } from '@/lib/constants';
import type { PurchaseOrder } from '@/types/purchase-order';
import type { PurchaseOrderFormData } from '@/lib/validations/purchase-order';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'RECEIVED': return 'default';
    case 'ORDERED':
    case 'SHIPPED': return 'secondary';
    case 'CANCELLED': return 'destructive';
    default: return 'outline';
  }
}

function PurchaseOrdersContent() {
  const { page, pageSize, search, setSearch, setPage, getParams } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const params = {
    ...getParams(),
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const { data, isLoading } = usePurchaseOrders(params);
  const { data: suppliersData } = useSuppliers({ limit: 200 });
  const suppliers = suppliersData?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const deletion = useConfirmation<PurchaseOrder>();

  const createMutation = useCreatePurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();
  const receiveMutation = useReceivePurchaseOrder();

  const [newPO, setNewPO] = useState<PurchaseOrderFormData>({
    supplierId: 0,
    expectedDeliveryDate: '',
    notes: '',
  });

  const handleCreate = () => {
    if (!newPO.supplierId) return;
    createMutation.mutate(newPO, {
      onSuccess: () => {
        setFormOpen(false);
        setNewPO({ supplierId: 0, expectedDeliveryDate: '', notes: '' });
      },
    });
  };

  const handleDelete = () => {
    deletion.handleConfirm((po) => deleteMutation.mutate(po.id));
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'id',
      header: 'PO #',
      cell: (po) => (
        <Link href={`/purchase-orders/${po.id}`} className="font-medium text-primary hover:underline">
          #{po.id}
        </Link>
      ),
    },
    { key: 'supplier', header: 'Supplier', cell: (po) => po.supplier?.name || '—' },
    {
      key: 'status',
      header: 'Status',
      cell: (po) => (
        <Badge variant={statusVariant(po.status)}>
          {formatStatus(po.status)}
        </Badge>
      ),
    },
    { key: 'orderDate', header: 'Order Date', cell: (po) => formatDate(po.orderDate) },
    {
      key: 'expectedDeliveryDate',
      header: 'Expected',
      cell: (po) => po.expectedDeliveryDate ? formatDate(po.expectedDeliveryDate) : '—',
    },
    {
      key: 'totalAmount',
      header: 'Total',
      cell: (po) => formatCurrency(po.totalAmount),
    },
    {
      key: 'items',
      header: 'Items',
      cell: (po) => po.items?.length ?? 0,
    },
    {
      key: 'actions',
      header: '',
      cell: (po) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/purchase-orders/${po.id}`}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </Link>
            </DropdownMenuItem>
            {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' && (
              <DropdownMenuItem onClick={() => receiveMutation.mutate(po.id)}>
                <PackageCheck className="mr-2 h-4 w-4" /> Mark Received
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive" onClick={() => deletion.confirm(po)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage supplier orders"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Purchase Order
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search POs..." />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(PO_STATUS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={data?.meta?.totalPages ?? 1}
        totalItems={data?.meta?.total ?? 0}
        onPageChange={setPage}
        emptyMessage="No purchase orders found"
      />

      {/* Simple create PO dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={newPO.supplierId ? String(newPO.supplierId) : ''} onValueChange={(val) => setNewPO({ ...newPO, supplierId: Number(val) })}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedDate">Expected Delivery</Label>
              <Input id="expectedDate" type="date" value={newPO.expectedDeliveryDate} onChange={(e) => setNewPO({ ...newPO, expectedDeliveryDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poNotes">Notes</Label>
              <Textarea id="poNotes" rows={2} value={newPO.notes} onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newPO.supplierId || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deletion.open}
        onOpenChange={deletion.setOpen}
        title="Delete Purchase Order"
        description={`Are you sure you want to delete PO #${deletion.item?.id}?`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function PurchaseOrdersPage() {
  return (
    <Suspense>
      <PurchaseOrdersContent />
    </Suspense>
  );
}
