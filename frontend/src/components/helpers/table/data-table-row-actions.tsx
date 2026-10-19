import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LucideTrash2 } from "lucide-react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import React from "react";
// import { DeleteConfirmationDialog } from "@/components/constants/delete-confirmation-dialog";

interface HasId {
  id: string;
}
interface DataTableRowActionsProps<TData extends HasId> {
  row: Row<TData>;
  selectedRowId: React.Dispatch<React.SetStateAction<string>>;
  setConfirmDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DataTableRowActions<TData extends HasId>({
  row,
  selectedRowId,
  setConfirmDialogOpen,
}: DataTableRowActionsProps<TData>) {
  const rowId = row.original.id;

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
            onClick={() => {
              selectedRowId(rowId);
              setConfirmDialogOpen(true);
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
