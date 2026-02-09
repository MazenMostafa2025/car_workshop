'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, PackageCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePurchaseOrder, useReceivePurchaseOrder, useAddPOItem, useRemovePOItem } from '@/queries/use-purchase-orders';
import { useParts } from '@/queries/use-inventory';
import { formatCurrency, formatDate, formatStatus } from '@/lib/utils';

export default function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const poId = parseInt(id);
  const { data: po, isLoading } = usePurchaseOrder(poId);
  const receiveMutation = useReceivePurchaseOrder();
  const addItemMutation = useAddPOItem();
  const removeItemMutation = useRemovePOItem();
  const { data: partsData } = useParts({ limit: 200 });

  const [selectedPartId, setSelectedPartId] = useState<string>('');

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-48" /></div>;
  }

  if (!po) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Purchase order not found</h2>
        <Button asChild className="mt-4"><Link href="/purchase-orders">Back</Link></Button>
      </div>
    );
  }

  const handleAddItem = () => {
    if (!selectedPartId) return;
    const part = partsData?.data?.find((p) => p.id === Number(selectedPartId));
    if (!part) return;
    addItemMutation.mutate(
      { poId, data: { partId: part.id, quantity: 1, unitCost: part.unitCost } },
      { onSuccess: () => setSelectedPartId('') }
    );
  };

  const canReceive = po.status !== 'RECEIVED' && po.status !== 'CANCELLED';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Purchase Order #${po.id}`}
        description={`Supplier: ${po.supplier?.name || 'Unknown'}`}
        actions={
          <div className="flex gap-2">
            {canReceive && (
              <Button onClick={() => receiveMutation.mutate(poId)} disabled={receiveMutation.isPending}>
                <PackageCheck className="mr-2 h-4 w-4" />
                {receiveMutation.isPending ? 'Receiving...' : 'Mark Received'}
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/purchase-orders"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
            </Button>
          </div>
        }
      />

      {/* Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
              <Badge variant={po.status === 'RECEIVED' ? 'default' : 'outline'}>{formatStatus(po.status)}</Badge>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Order Date</span><span>{formatDate(po.orderDate)}</span></div>
            {po.expectedDeliveryDate && (
              <div className="flex justify-between"><span className="text-muted-foreground">Expected</span><span>{formatDate(po.expectedDeliveryDate)}</span></div>
            )}
            {po.receivedDate && (
              <div className="flex justify-between"><span className="text-muted-foreground">Received</span><span>{formatDate(po.receivedDate)}</span></div>
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent className="pt-6 space-y-2 text-sm">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span><span>{formatCurrency(po.totalAmount)}</span>
            </div>
            {po.notes && <><Separator /><p className="text-muted-foreground">{po.notes}</p></>}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items ({po.items?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canReceive && (
            <div className="flex items-center gap-2">
              <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                <SelectTrigger className="w-[300px]"><SelectValue placeholder="Add a part..." /></SelectTrigger>
                <SelectContent>
                  {partsData?.data?.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} {p.partNumber ? `(${p.partNumber})` : ''} — {formatCurrency(p.unitCost)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddItem} disabled={!selectedPartId || addItemMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          )}

          {po.items && po.items.length > 0 ? (
            <div className="border rounded-lg divide-y">
              {po.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium">{item.part?.name || `Part #${item.partId}`}</p>
                    {item.part?.partNumber && <p className="text-sm text-muted-foreground">{item.part.partNumber}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      {item.quantity} × {formatCurrency(item.unitCost)} = {formatCurrency(item.totalCost)}
                    </span>
                    {canReceive && (
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItemMutation.mutate({ poId, itemId: item.id })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No items yet. Add parts to this purchase order.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
