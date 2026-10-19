import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/helpers/table/data-table-column-header";
import React from "react";
import { User } from "@/config/models";
import { dataTableValueWithAvatar } from "@/components/helpers/table/global-column-components";

export const columnsUser: ColumnDef<User>[] = [
  {
    accessorKey: "userName",
    enableResizing: true, //disable resizing for just this column
    size: 700,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Name" />
    ),
    cell: ({ row }) =>
      dataTableValueWithAvatar(
        row.original.userName,
        row.original.profile.avatar || ""
      ),
      // <div className="w-[106px] truncate">{row.getValue("userName")}</div>
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="w-[90px] truncate">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "is_superuser",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => (
      <div className="w-[90px] truncate">
        {row.getValue("is_superuser") ? "Admin" : "Viewer"}
      </div>
      // <div className="w-[90px] truncate">Placeholder</div>
    ),
  },
  {
    accessorKey: "date_joined",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Joined" />
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("date_joined");
      let dateString = "";
      if (dateValue instanceof Date) {
        // Format the date in a more readable format
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, "0"); // Months are  0-indexed in JavaScript
        const day = String(dateValue.getDate()).padStart(2, "0");
        dateString = `${year}-${month}-${day}`;
      } else if (typeof dateValue === "string") {
        // Assuming the string is in a format that can be directly displayed
        // TODO: Fix this to use a proper date formatting library
        const date = new Date(dateValue);
        const options: Intl.DateTimeFormatOptions = {
          month: "short",
          day: "2-digit",
          year: "numeric",
        };
        dateString = date.toLocaleDateString("en-US", options);
      }
      return <div>{dateString}</div>;
    },
  },
];
