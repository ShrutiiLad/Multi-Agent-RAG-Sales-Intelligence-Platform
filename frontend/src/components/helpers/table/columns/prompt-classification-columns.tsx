import { QueryCategoryStat } from "@/config/models";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/helpers/table/data-table-column-header";
import React from "react";

export const columnsPrompt: ColumnDef<QueryCategoryStat>[] = [
  {
    accessorKey: "classification_name",
    enableResizing: true, //disable resizing for just this column
    size: 1000,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" tooltipRequired={true} />
    ),
    cell: ({ row }) =>
      <div className="w-[560px] truncate">{row.original.classification_name || "N/A"}</div>
  },

  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chats" tooltipRequired={true} />
    ),
    cell: ({ row }) =>
      <div className="w-[120px] truncate">{row.original.total || "27"}</div>
  },
  {
    accessorKey: "monthly_increase",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Evolution" tooltipRequired={true} />
    ),
    cell: ({ row }) =>
      <div className="w-[120px] truncate">{row.original.monthly_increase || "2.3%"}</div>
  },
  {
    accessorKey: "general_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NFR" tooltipRequired={true} />
    ),
    cell: ({ row }) =>
      <div className="w-[120px] truncate">{row.original.general_count || "0%"}</div>
  },
  {
    accessorKey: "role_ratio",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CAUR" tooltipRequired={true} />
    ),
    cell: ({ row }) =>
      <div className="w-[120px] truncate">{row.original.role_ratio || "0.0%"}</div>
  },
];
