import React from 'react';
import { Input } from '@/components/ui/input';
import { strengths } from '@/config/site';
import { Table } from '@tanstack/react-table';
import { DataTableFacetedFilter } from '@/components/helpers/table/data-table-faceted-filter';
// import { DataTableViewOptions } from "./data-table-view-options";
// import { ContentLibraryForm } from "../form/content-library-form";
import ImportDocumentModal from '@/components/layout/library/import-document-modal';
import { Search } from 'lucide-react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="relative flex items-center space-x-2">
        <Search className="absolute top-0 bottom-0 w-4 h-4 my-auto ml-5 text-inactive" />
        <Input
          placeholder="Search"
          value={(table.getColumn('project')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('project')?.setFilterValue(event.target.value)
          }
          className="pl-[34px] pr-4 h-10 w-[150px] text-xs lg:w-[240px] bg-selectedBg"
        />
        {table.getColumn('strength') && (
          <DataTableFacetedFilter
            column={table.getColumn('strength')}
            title="Filter"
            options={strengths}
          />
        )}
      </div>
      <ImportDocumentModal />
    </div>
  );
}
