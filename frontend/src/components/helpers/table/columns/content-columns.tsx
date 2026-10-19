// import { strengths } from "@/config/site"
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/helpers/table/data-table-column-header";
import React from "react";
import { Document } from "@/config/models";

export const columns: ColumnDef<Document>[] = [
  // {
  //     id: "select",
  //     accessorKey: "select",
  //     header: ({ table }) => (
  //         <Checkbox
  //             checked={
  //                 table.getIsAllPageRowsSelected() ||
  //                 (table.getIsSomePageRowsSelected() && "indeterminate")
  //             }
  //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //             aria-label="Select all"
  //             className="translate-y-[2px]"
  //         />
  //     ),
  //     cell: ({ row }) => (
  //         <Checkbox
  //             checked={row.getIsSelected()}
  //             onCheckedChange={(value) => row.toggleSelected(!!value)}
  //             aria-label="Select row"
  //             className="translate-y-[2px]"
  //         />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  // },
  {
    accessorKey: "title",
    enableResizing: true, //disable resizing for just this column
    size: 700,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Filename" />
    ),
    cell: ({ row }) => (
      <div className="w-[420px] truncate">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "project",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ row }) => (
      <div className="w-26 truncate">
        {row.getValue("project") || "Unknown"}
      </div>
    ),
  },
  // {
  //     accessorKey: "category",
  //     header: ({ column }) => (
  //         <DataTableColumnHeader column={column} title="Role" />
  //     ),
  //     cell: ({ row }) => <div className="w-[90px] truncate">{row.getValue("category")}</div>,
  // },
  // {
  //     accessorKey: "author",
  //     header: ({ column }) => (
  //         <DataTableColumnHeader column={column} title="Imported by" />
  //     ),
  //     cell: ({ row }) => <div className="w-[90px] truncate">{row.getValue("author") || "NAN"}</div>,
  // },
  // {
  //     accessorKey: "bots",
  //     header: ({ column }) => (
  //         <DataTableColumnHeader column={column} title="AI Agents" />
  //     ),
  //     cell: ({ row }) => <div className="w-[69px] text-right">{row.getValue("bots")}</div>,
  // },
  {
    accessorKey: "published_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const producedAtValue = row.getValue("published_at") || '';
      const createdAtValue = row.original.created_at;
      const dateValue = producedAtValue || createdAtValue;
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
      return <div className="w-26">{dateString}</div>;
    },
  },
  // {
  //     accessorKey: "strength", //TODO: Change the strength Very Low to Very High
  //     header: ({ column }) => (
  //         <DataTableColumnHeader column={column} title="Strength" />
  //     ),
  //     cell: ({ row }) => {
  //         const strength = row.getValue("strength")
  //         if (!strength) {
  //             return null
  //         }

  //         return (
  //             <div className="flex w-[7vw] items-center">
  //                 <p className="flex items-center gap-2">
  //                     {strength === '4' && <Zap className="fill-supportCol text-supportCol h-3 w-3" />}
  //                     {strength === '3' && <Zap className="h-3 w-3 text-supportCol" />}
  //                     {strength === '2' && <Square className="fill-supportCol text-supportCol h-3 w-3" />}
  //                     {strength !== '2' && strength !== '3' && strength !== '4' && <Square className="text-supportCol h-3 w-3" />}
  //                     {strength === '4' ? 'Very High' : strength === '3' ? 'High' : strength === '2' ? 'Low' : 'Very low'}
  //                 </p>
  //             </div>
  //         )
  //     },
  //     filterFn: (row, id, value) => {
  //         return value.includes(row.getValue(id))
  //     },
  // },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => (
      <div className="w-26">{row.getValue("location") || "Unknown"}</div>
    ),
    // filterFn: (row, id, value) => {
    //     return value.includes(row.getValue(id))
    // },
  },
];

// TRY TO SEND THE MESSAGE TO THE NEXT LINE
// WHAT IS THE BEST STRATEGY TO SELL ABSOLUT
