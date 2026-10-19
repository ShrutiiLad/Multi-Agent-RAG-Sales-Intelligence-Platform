import { Bot, BotStats } from "@/config/models";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/helpers/table/data-table-column-header";
import React from "react";
import {
  dataTableDateValue,
  dataTableValue,
  dataTableValueWithAvatar,
} from "@/components/helpers/table/global-column-components";

export const getColumns = (isAdmin: boolean) => {
  return isAdmin ? columnsAdminAgents : columnsAgents;
};

export const columnsAgents: ColumnDef<Bot>[] = [
  {
    accessorKey: "name",
    enableResizing: true, //disable resizing for just this column
    size: 700,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) =>
      dataTableValueWithAvatar(
        row.original.name,
        row.original.avatar || "",
        "agent"
      ),
  },
  {
    accessorKey: "visibility",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visibility" />
    ),
    cell: ({ row }) => dataTableValue(row.getValue("visibility") || "Everyone"),
  },
  {
    accessorKey: "thread_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chats" />
    ),
    cell: ({ row }) => dataTableValue(row.getValue("thread_count")),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created at" />
    ),
    cell: ({ row }) => {
      return dataTableValue(dataTableDateValue(row.original.created_at));
    },
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
    cell: ({ row }) => (
      <div className="w-[90px] truncate">{row.original.author || "admin"}</div>
    ),
  },
];

// BOT ADMIN

export const columnsAdminAgents: ColumnDef<BotStats>[] = [
  {
    accessorKey: "classification_name",
    enableResizing: true, //disable resizing for just this column
    size: 1000,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Name"
        tooltipRequired={true}
      />
    ),
    cell: ({ row }) => (
      <div className="w-[560px] truncate">
        {dataTableValueWithAvatar(
          row.original.name || "Deleted",
          row.original.avatar || "",
          "agent"
        )}
      </div>
    ),
  },
  {
    accessorKey: "thread_count",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Chats"
        tooltipRequired={true}
      />
    ),
    cell: ({ row }) => (
      <div className="w-[120px] truncate">{row.getValue("thread_count")}</div>
    ),
  },
  {
    accessorKey: "evolution",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Evolution"
        tooltipRequired={true}
      />
    ),
    cell: ({ row }) => (
      <div className="w-[120px] truncate">
        {row.getValue("evolution") != null ? row.getValue("evolution") : "-"}
      </div>
    ),
  },
  {
    accessorKey: "error_rate",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Error Rate"
        tooltipRequired={true}
      />
    ),
    cell: ({ row }) => (
      <div className="w-[120px] truncate">
        {row.original.error_rate || "0.0%"}
      </div>
    ),
  },
  {
    accessorKey: "nfr",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="NFR"
        tooltipRequired={true}
      />
    ),
    cell: ({ row }) => (
      <div className="w-[120px] truncate">
        {row.original.negative_positive_ratio
          ? row.original.negative_positive_ratio + "%"
          : "0.0%"}
      </div>
    ),
  },
];
