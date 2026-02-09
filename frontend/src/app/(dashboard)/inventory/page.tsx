'use client';

import { Suspense, useState } from 'react';
import { Plus, Pencil, Trash2, Package, AlertTriangle, MoreHorizontal, PackagePlus } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog, SearchInput } from '@/components/forms';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PartForm } from '@/components/features/part-form';
import { StockAdjustmentForm } from '@/components/features/stock-adjustment-form';
import { useParts, useCreatePart, useUpdatePart, useDeletePart, useAdjustStock, useLowStockParts, useInventoryValue } from '@/queries/use-inventory';
import { useSuppliers } from '@/queries/use-suppliers';
import { usePagination } from '@/hooks/use-pagination';
import { useConfirmation } from '@/hooks/use-confirmation';
import { formatCurrency } from '@/lib/utils';
import type { Part } from '@/types/inventory';
import type { PartFormData, StockAdjustmentFormData } from '@/lib/validations/inventory';

function InventoryContent() {
  const { page, pageSize, search, setSearch, setPage, getParams } = usePagination();
  const { data, isLoading } = useParts(getParams());
  const { data: lowStockData } = useLowStockParts();
  const { data: valueData } = useInventoryValue();
  const { data: suppliersData } = useSuppliers({ limit: 200 });
  const suppliers = suppliersData?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [adjustPart, setAdjustPart] = useState<Part | null>(null);
  const deletion = useConfirmation<Part>();

  const createMutation = useCreatePart();
  const updateMutation = useUpdatePart();
  const deleteMutation = useDeletePart();
  const adjustMutation = useAdjustStock();

  const handleCreate = (data: PartFormData) => {
    createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
  };
  const handleUpdate = (data: PartFormData) => {
    if (editingPart) {
      updateMutation.mutate({ id: editingPart.id, data }, { onSuccess: () => setEditingPart(null) });
    }
  };
  const handleDelete = () => {
    deletion.handleConfirm((part) => {
      deleteMutation.mutate(part.id);
    });
  };
  const handleAdjust = (data: StockAdjustmentFormData) => {
    if (adjustPart) {
      adjustMutation.mutate({ id: adjustPart.id, data }, { onSuccess: () => setAdjustPart(null) });
    }
  };

  const columns: Column<Part>[] = [
    {
      key: 'name',
      header: 'Part',
      cell: (part) => (
        <div>
          <p className="font-medium">{part.name}</p>
          {part.partNumber && <p className="text-sm text-muted-foreground">{part.partNumber}</p>}
        </div>
      ),
    },
    { key: 'category', header: 'Category', cell: (p) => p.category || '—' },
    { key: 'supplier', header: 'Supplier', cell: (p) => p.supplier?.name || '—' },
    {
      key: 'unitCost',
      header: 'Cost',
      cell: (p) => formatCurrency(p.unitCost),
    },
    {
      key: 'sellingPrice',
      header: 'Price',
      cell: (p) => formatCurrency(p.sellingPrice),
    },
    {
      key: 'quantityInStock',
      header: 'Stock',
      cell: (p) => (
        <div className="flex items-center gap-2">
          <span className={p.quantityInStock <= p.reorderLevel ? 'text-destructive font-semibold' : ''}>
            {p.quantityInStock}
          </span>
          {p.quantityInStock <= p.reorderLevel && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
        </div>
      ),
    },
    { key: 'location', header: 'Location', cell: (p) => p.location || '—' },
    {
      key: 'isActive',
      header: 'Status',
      cell: (p) => (
        <Badge variant={p.isActive ? 'default' : 'secondary'}>
          {p.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (part) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setAdjustPart(part)}>
              <PackagePlus className="mr-2 h-4 w-4" /> Adjust Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingPart(part)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => deletion.confirm(part)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const lowStockCount = lowStockData?.length ?? 0;
  const totalValue = valueData?.totalRetail ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage parts and stock levels"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Part
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Parts</p>
                <p className="text-2xl font-bold">{data?.meta.total ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-destructive">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search parts..." />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={data?.meta?.totalPages ?? 1}
        totalItems={data?.meta?.total ?? 0}
        onPageChange={setPage}
        emptyMessage="No parts found"
      />

      <PartForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        suppliers={suppliers}
        isLoading={createMutation.isPending}
      />
      {editingPart && (
        <PartForm
          open={!!editingPart}
          onOpenChange={(open) => !open && setEditingPart(null)}
          onSubmit={handleUpdate}
          defaultValues={editingPart}
          suppliers={suppliers}
          isLoading={updateMutation.isPending}
        />
      )}
      {adjustPart && (
        <StockAdjustmentForm
          open={!!adjustPart}
          onOpenChange={(open) => !open && setAdjustPart(null)}
          onSubmit={handleAdjust}
          partName={adjustPart.name}
          currentStock={adjustPart.quantityInStock}
          isLoading={adjustMutation.isPending}
        />
      )}
      <ConfirmDialog
        open={deletion.open}
        onOpenChange={deletion.setOpen}
        title="Delete Part"
        description={`Are you sure you want to delete "${deletion.item?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense>
      <InventoryContent />
    </Suspense>
  );
}
