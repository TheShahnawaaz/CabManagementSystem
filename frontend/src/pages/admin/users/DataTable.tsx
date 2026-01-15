"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableViewOptions } from "./DataTableViewOptions";
import type { UserRoleFilter } from "./types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  role: UserRoleFilter;
  onRoleChange: (value: UserRoleFilter) => void;
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  search,
  onSearchChange,
  role,
  onRoleChange,
  pageIndex,
  pageSize,
  total,
  onPageIndexChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      payment_count: false, // Hidden by default
    });

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    pageCount,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      if (next.pageIndex !== pageIndex) onPageIndexChange(next.pageIndex);
      if (next.pageSize !== pageSize) onPageSizeChange(next.pageSize);
    },
    state: {
      sorting,
      columnVisibility,
      pagination: { pageIndex, pageSize },
    },
  });

  // Calculate visible range for "Showing X-Y of Z"
  const startRow = total === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="w-full space-y-4">
      {/* Always visible controls */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="max-w-sm"
        />
        <Select
          value={role}
          onValueChange={(v) => onRoleChange(v as UserRoleFilter)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="admin">Admins Only</SelectItem>
            <SelectItem value="user">Users Only</SelectItem>
          </SelectContent>
        </Select>
        <DataTableViewOptions table={table} />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton rows when loading
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((_, j) => (
                    <TableCell key={`skeleton-cell-${i}-${j}`}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination with "Showing X-Y of Z" */}
      <DataTablePagination
        table={table}
        startRow={startRow}
        endRow={endRow}
        total={total}
      />
    </div>
  );
}
