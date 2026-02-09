'use client';

import { Suspense, useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, Wrench, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog } from '@/components/forms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryForm } from '@/components/features/category-form';
import { ServiceForm } from '@/components/features/service-form';
import {
  useServiceCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/queries/use-services';
import { useConfirmation } from '@/hooks/use-confirmation';
import { formatCurrency } from '@/lib/utils';
import type { ServiceCategory, Service } from '@/types/service-catalog';
import type { ServiceCategoryFormData, ServiceFormData } from '@/lib/validations/service';

function ServiceCatalogContent() {
  const { data: categoriesData, isLoading: catLoading } = useServiceCategories({ limit: 100 });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const { data: servicesData, isLoading: svcLoading } = useServices(
    selectedCategoryId ? { categoryId: selectedCategoryId, limit: 100 } : { limit: 100 },
  );

  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  const createSvc = useCreateService();
  const updateSvc = useUpdateService();
  const deleteSvc = useDeleteService();

  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const catDeleteConfirm = useConfirmation<ServiceCategory>();

  const [svcFormOpen, setSvcFormOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState<Service | null>(null);
  const svcDeleteConfirm = useConfirmation<Service>();

  const handleCreateCat = (data: ServiceCategoryFormData) => {
    createCat.mutate(data, { onSuccess: () => setCatFormOpen(false) });
  };
  const handleUpdateCat = (data: ServiceCategoryFormData) => {
    if (!editingCat) return;
    updateCat.mutate({ id: editingCat.id, data }, { onSuccess: () => setEditingCat(null) });
  };
  const handleDeleteCat = () => {
    catDeleteConfirm.handleConfirm((cat) => deleteCat.mutate(cat.id));
  };

  const handleCreateSvc = (data: ServiceFormData) => {
    createSvc.mutate(data, { onSuccess: () => setSvcFormOpen(false) });
  };
  const handleUpdateSvc = (data: ServiceFormData) => {
    if (!editingSvc) return;
    updateSvc.mutate({ id: editingSvc.id, data }, { onSuccess: () => setEditingSvc(null) });
  };
  const handleDeleteSvc = () => {
    svcDeleteConfirm.handleConfirm((svc) => deleteSvc.mutate(svc.id));
  };

  const categories = categoriesData?.data ?? [];

  const serviceColumns: Column<Service>[] = [
    { key: 'name', header: 'Service', cell: (s) => <span className="font-medium">{s.name}</span> },
    {
      key: 'category',
      header: 'Category',
      cell: (s) => <Badge variant="outline">{s.category?.name ?? '—'}</Badge>,
    },
    {
      key: 'price',
      header: 'Base Price',
      cell: (s) => <span className="text-sm">{formatCurrency(s.basePrice)}</span>,
    },
    {
      key: 'duration',
      header: 'Duration',
      cell: (s) => <span className="text-sm">{s.estimatedDuration} min</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (s) => (
        <Badge variant={s.isActive ? 'default' : 'secondary'}>
          {s.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (s) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingSvc(s)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => svcDeleteConfirm.confirm(s)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'w-12',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Catalog"
        description="Manage service categories and individual services"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCatFormOpen(true)}>
              <FolderOpen className="mr-2 h-4 w-4" /> Add Category
            </Button>
            <Button onClick={() => setSvcFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>
          </div>
        }
      />

      {/* Categories Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Categories</h2>
        {catLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-20" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card
              className={`cursor-pointer transition-colors ${!selectedCategoryId ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
              onClick={() => setSelectedCategoryId(undefined)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">All Services</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {categories.reduce((sum, c) => sum + (c._count?.services ?? 0), 0)} total
                    </p>
                  </div>
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className={`cursor-pointer transition-colors ${selectedCategoryId === cat.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{cat.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cat._count?.services ?? 0} services
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingCat(cat); }}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); catDeleteConfirm.confirm(cat); }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Services Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Services {selectedCategoryId ? `— ${categories.find((c) => c.id === selectedCategoryId)?.name}` : ''}
        </h2>
        <DataTable
          columns={serviceColumns}
          data={servicesData?.data ?? []}
          isLoading={svcLoading}
          emptyMessage="No services found. Add your first service."
        />
      </div>

      {/* Category Dialogs */}
      <CategoryForm open={catFormOpen} onOpenChange={setCatFormOpen} onSubmit={handleCreateCat} isLoading={createCat.isPending} />
      <CategoryForm open={!!editingCat} onOpenChange={(open) => !open && setEditingCat(null)} onSubmit={handleUpdateCat} defaultValues={editingCat} isLoading={updateCat.isPending} />
      <ConfirmDialog open={catDeleteConfirm.open} onOpenChange={catDeleteConfirm.setOpen} title="Delete Category" description={`Delete "${catDeleteConfirm.item?.name}"? Services in this category will be uncategorized.`} onConfirm={handleDeleteCat} isLoading={deleteCat.isPending} variant="destructive" />

      {/* Service Dialogs */}
      <ServiceForm open={svcFormOpen} onOpenChange={setSvcFormOpen} onSubmit={handleCreateSvc} categories={categories} isLoading={createSvc.isPending} />
      <ServiceForm open={!!editingSvc} onOpenChange={(open) => !open && setEditingSvc(null)} onSubmit={handleUpdateSvc} defaultValues={editingSvc} categories={categories} isLoading={updateSvc.isPending} />
      <ConfirmDialog open={svcDeleteConfirm.open} onOpenChange={svcDeleteConfirm.setOpen} title="Delete Service" description={`Delete "${svcDeleteConfirm.item?.name}"?`} onConfirm={handleDeleteSvc} isLoading={deleteSvc.isPending} variant="destructive" />
    </div>
  );
}

export default function ServiceCatalogPage() {
  return (
    <Suspense>
      <ServiceCatalogContent />
    </Suspense>
  );
}
