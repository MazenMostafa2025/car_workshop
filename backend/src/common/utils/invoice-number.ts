import { prisma } from '@common/database/prisma';
import { format } from 'date-fns';

/**
 * Generates sequential invoice numbers in the format: INV-YYYY-NNNNN
 *
 * Example: INV-2026-00001, INV-2026-00002, ...
 *
 * Uses the database to determine the next sequence number for the current year.
 */
export async function generateInvoiceNumber(): Promise<string> {
  const currentYear = format(new Date(), 'yyyy');
  const prefix = `INV-${currentYear}-`;

  // Find the last invoice of this year
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoiceNumber: 'desc',
    },
    select: {
      invoiceNumber: true,
    },
  });

  let nextSequence = 1;

  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.replace(prefix, ''), 10);
    if (!isNaN(lastSequence)) {
      nextSequence = lastSequence + 1;
    }
  }

  const paddedSequence = String(nextSequence).padStart(5, '0');
  return `${prefix}${paddedSequence}`;
}
