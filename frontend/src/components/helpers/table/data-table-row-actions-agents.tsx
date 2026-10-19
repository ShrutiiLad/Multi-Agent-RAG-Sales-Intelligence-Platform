import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LucideTrash2, LucideEdit2 } from "lucide-react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import React from "react";

interface HasId {
  id: string;
  name: string;
}
interface DataTableRowActionsProps<TData extends HasId> {
  row: Row<TData>;
  onRowSelect: (id: string, name: string, type: string) => void;
}
export function DataTableRowActionsAgents<TData extends HasId>({
  row,
  onRowSelect,
}: DataTableRowActionsProps<TData>) {
  const rowId = row.original.id;
  const rowName = row.original.name;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              onRowSelect(rowId, rowName, "edit");
            }}
          >
            <div className="flex flex-row items-center font-medium space-x-2">
              <LucideEdit2 className="w-4 h-4" />
              <span>Edit</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              onRowSelect(rowId, rowName, "delete");
            }}
          >
            <div className="flex flex-row items-center text-delete font-medium space-x-2">
              <LucideTrash2 className="text-delete w-4 h-4" />
              <span>Delete</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
