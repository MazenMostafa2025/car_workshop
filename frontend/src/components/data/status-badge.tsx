import { Badge, type BadgeProps } from '@/components/ui/badge';
import {
  WORK_ORDER_STATUS,
  INVOICE_STATUS,
  APPOINTMENT_STATUS,
  PO_STATUS,
} from '@/lib/constants';

type StatusType = 'work-order' | 'invoice' | 'appointment' | 'purchase-order';

const statusMaps: Record<StatusType, Record<string, { label: string; color: string }>> = {
  'work-order': WORK_ORDER_STATUS,
  invoice: INVOICE_STATUS,
  appointment: APPOINTMENT_STATUS,
  'purchase-order': PO_STATUS,
};

const colorToVariant: Record<string, BadgeProps['variant']> = {
  blue: 'info',
  yellow: 'warning',
  green: 'success',
  red: 'destructive',
  gray: 'secondary',
  purple: 'default',
  orange: 'warning',
  slate: 'secondary',
};

interface StatusBadgeProps {
  type: StatusType;
  status: string;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const map = statusMaps[type];
  const config = map?.[status];

  if (!config) {
    return <Badge variant="outline" className={className}>{status}</Badge>;
  }

  const variant = colorToVariant[config.color] || 'outline';

  return (
    <Badge variant={variant} className={className}>
      {config.label}
    </Badge>
  );
}
