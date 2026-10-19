"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTableToolbar } from "@/components/helpers/table/data-table-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/helpers/table/data-table-pagination";
import SyncLoader from "react-spinners/SyncLoader";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isMini?: boolean;
  onHandleShowForm?: (id: number | string) => void;
  header?: string;
  tableType?: string;
  filterFrom?: string;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isMini = false,
  onHandleShowForm,
  header,
  tableType,
  filterFrom,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  return (
    <>
      {!isMini && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-indigo-950 text-lg font-medium font-['Test Söhne'] leading-none">
            {header ? header : "Content Library"}
          </div>
          <DataTableToolbar
            table={table}
            tabletype={tableType}
            filterFrom={filterFrom}
          />
        </div>
      )}
      <div className="rounded-md mb-2">
        <Table>
          <TableHeader className="border-b border-inactive hover:bg-none">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="pl-3"
                    >
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
            {isLoading && (data?.length === 0 ? (
              <div className="h-20">
                <SyncLoader
                  color="rgba(82 82 91)"
                  className="absolute left-1/2 top-[55%]"
                  size={8}
                  speedMultiplier={0.8}
                />
              </div>
            ) : <SyncLoader
              color="rgba(82 82 91)"
              className="fixed left-[45%] top-[55vh]"
              size={8}
              speedMultiplier={0.8}
            />)}
            {!isLoading && table.getRowModel().rows?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-10 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
            {Boolean(table.getRowModel().rows?.length) &&
              table.getRowModel().rows.map(row => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-selectedBg"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        className="py-1 pl-3 pr-0 cursor-pointer text-sm h-10"
                        key={cell.id}
                        onClick={() => {
                          if (!isMini) {
                            if (cell.column.id === "title") {
                              if (onHandleShowForm) {
                                onHandleShowForm(parseInt(cell.id, 10));
                              }
                            }
                            if (cell.column.id === "name") {
                              if (onHandleShowForm) {
                                onHandleShowForm(
                                  (cell.row.original as any)?.id
                                );
                              }
                            }
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
      {!isMini && <DataTablePagination table={table} />}
    </>
  );
}

// ADD Documents to Bot
