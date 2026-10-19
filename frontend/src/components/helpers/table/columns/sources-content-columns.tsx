import * as React from "react"
import {
    ColumnDef,
} from "@tanstack/react-table"
import { Document } from "@/config/models"
import { DataTableColumnHeader } from "@/components/helpers/table/data-table-column-header"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export const columns: ColumnDef<Document>[] = [
    {
        accessorKey: 'title',
        enableResizing: true, //disable resizing for just this column
        size: 60,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Filename" />
        ),
        cell: ({ row }) => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-[280px] truncate">{row.getValue('title')}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{row.original.title}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
    },
    // {
    //     accessorKey: 'project',
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Project" />
    //     ),
    //     cell: ({ row }) => (
    //         <div className="w-26 truncate">{row.getValue('project')}</div>
    //     ),
    // },
    {
        accessorKey: 'created_at',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => {
            const dateValue = row.getValue('created_at');
            let dateString = '';
            if (dateValue instanceof Date) {
                // Format the date in a more readable format
                const year = dateValue.getFullYear();
                const month = String(dateValue.getMonth() + 1).padStart(2, '0'); // Months are  0-indexed in JavaScript
                const day = String(dateValue.getDate()).padStart(2, '0');
                dateString = `${year}-${month}-${day}`;
            } else if (typeof dateValue === 'string') {
                // Assuming the string is in a format that can be directly displayed
                // TODO: Fix this to use a proper date formatting library
                const date = new Date(dateValue);
                const options: Intl.DateTimeFormatOptions = {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                };
                dateString = date.toLocaleDateString('en-US', options);
            }
            return <div className="w-26">{dateString}</div>;
        },
    },
    // {
    //     accessorKey: 'location',
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Location" />
    //     ),
    //     cell: ({ row }) => (
    //         <div className="w-26">{row.getValue('location') || 'NAN'}</div>
    //     ),
    //     // filterFn: (row, id, value) => {
    //     //     return value.includes(row.getValue(id))
    //     // },
    // },
]