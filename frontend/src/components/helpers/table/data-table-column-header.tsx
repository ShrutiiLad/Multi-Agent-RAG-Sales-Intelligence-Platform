import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { Column } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";
import { tooltip } from "@/components/constants/tooltip-headers";

interface tooltipContent {
  heading: string;
  description: string;
}
interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  tooltipRequired?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  tooltipRequired = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className, "text-xs")}>{title}</div>;
  }
  let content;
  if (tooltipRequired)
    content = tooltip[title as keyof typeof tooltip] as tooltipContent;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <TooltipProvider>
        <Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accen text-xs focus-visible:outline-none"
                >
                  <span>{title}</span>
                  <ChevronDownIcon className=" ml-2 size-4" />
                  {/* {column.getIsSorted() === "desc" ? (
                                <ArrowDownIcon className="ml-2 h-4 w-4 text-xs" />
                            ) : column.getIsSorted() === "asc" ? (
                                <ArrowUpIcon className="ml-2 h-4 w-4 text-xs" />
                            ) : (
                                <CaretSortIcon className="ml-2 h-4 w-4 text-xs" />
                            )} */}
                </Button>
              </TooltipTrigger>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70 text-xs" />
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70 text-xs" />
                Desc
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent
            className={`${
              tooltipRequired ? "" : "hidden"
            } p-4 flex-col space-y-1 w-60 h-[114px] font-selected text-[13px]`}
          >
            <p className="font-medium leading-[14px]">{content?.heading}</p>
            <p className="font-normal leading-tight">{content?.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
