'use client';

import { type ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAGE_SIZE_OPTIONS } from '@/lib/constants';
import { downloadCSV } from '@/lib/csv-export';

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T, index?: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  // Pagination
  page?: number;
  pageSize?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Empty state
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  // CSV export
  exportFilename?: string;
  exportData?: Record<string, unknown>[];
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  page = 1,
  pageSize = 20,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  emptyMessage = 'No records found.',
  exportFilename,
  exportData,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell(item, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Export */}
      {(onPageChange || exportFilename) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {onPageChange && (
              <span>
                Showing {Math.min((page - 1) * pageSize + 1, totalItems)}–{Math.min(page * pageSize, totalItems)} of{' '}
                {totalItems}
              </span>
            )}
            {onPageSizeChange && (
              <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-1">
            {exportFilename && data.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 mr-2"
                onClick={() => downloadCSV(exportFilename, (exportData ?? data) as Record<string, unknown>[])}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
            {onPageChange && (
              <>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(1)} disabled={page <= 1}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(totalPages)}
                  disabled={page >= totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
