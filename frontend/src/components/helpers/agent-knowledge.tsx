import * as React from "react";
import { useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Search from "@/assets/Search.svg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Document } from "@/config/models";
import { AgentFormData } from "@/components/layout/ai-agent/create/new-agent";
import ImportDocumentModal from "@/components/layout/library/import-document-modal";
import SyncLoader from "react-spinners/SyncLoader";

export interface AgentKnowledgeProps {
  formData: AgentFormData;
  setSelectedRows: (rows: number) => void;
  columns: ColumnDef<Document, any>[];
  documents: Document[];
  isLoading?: boolean;
  isDetail: boolean;
}

export const AgentKnowledge: React.FC<AgentKnowledgeProps> = ({
  formData,
  setSelectedRows,
  columns,
  documents,
  isLoading,
  isDetail,
}) => {
  const data: Document[] = documents;
  console.log({ data });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  });

  useEffect(() => {
    setSelectedRows(
      formData.documents.length +
      table.getFilteredSelectedRowModel().rows.length
    );
  });
  console.log(table.getRowModel().rows);

  return (
    <div className="w-full">
      <div className="flex items-center  justify-between pb-3">
        <div className="flex gap-3">
          <div className="relative flex justify-center items-center h-9 py-2 px-3 rounded-lg bg-lightBackground w-[244px] font-Inter text-supportCol">
            <img src={Search} alt="Search Icon" />
            <Input
              placeholder="Search"
              value={
                (table.getColumn("title")?.getFilterValue() as string) ?? ""
              }
              onChange={event =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="max-w-sm bg-transparent h-9 rounded-lg text-[13px] placeholder:text-supportCol font-[450] pt-[7px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="h-9">
              <Button variant="outline" className="ml-auto rounded-[10px]">
                View all <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={value =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {!isDetail && <ImportDocumentModal Trigger={false} />}
      </div>
      <div className="rounded-md border h-[276px] overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-10"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-0">
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
                  className="h-60 text-center"
                >
                  {isLoading ? (<SyncLoader
                    color="rgba(82 82 91)"
                    className="absolute left-1/2 top-[55%]"
                    size={8}
                    speedMultiplier={0.8}
                  />) : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
