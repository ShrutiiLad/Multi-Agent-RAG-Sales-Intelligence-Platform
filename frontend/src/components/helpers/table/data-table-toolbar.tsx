/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";
import ImportDocumentModal from "@/components/layout/library/import-document-modal";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiStepForm } from "@/components/layout/ai-agent/create/new-agent";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export const _contents = "content-library";
export const _agents = "agent";
export const _users = "users";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  tabletype?: string;
  filterFrom?: string;
}

export function DataTableToolbar<TData>({
  table,
  tabletype,
  filterFrom,
}: DataTableToolbarProps<TData>) {
  let state = tabletype;

  const currentUrl = window.location.href;

  const [showNewAIAgentForm, setShowNewAIAgentForm] = useState(false);
  const [dialogClasses, setDialogClasses] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentUrl.includes(_contents)) {
      state = _contents;
    } else if (currentUrl.includes(_agents)) {
      state = _agents;
    } else if (currentUrl.includes(_users)) {
      state = _users;
    }
  }, [currentUrl]);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="relative flex items-center space-x-2">
        <Search className="absolute top-0 bottom-0 w-4 h-4 my-auto ml-5 text-inactive" />
        <Input
          placeholder="Search"
          value={
            (table
              .getColumn(filterFrom || "title")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={event =>
            table
              .getColumn(filterFrom || "title")
              ?.setFilterValue(event.target.value)
          }
          className="pl-[34px] pr-4 h-10 w-[150px] text-xs lg:w-[240px] bg-selectedBg rounded-[10px]"
        />
        {/* {table.getColumn("created_at") && (
          <DataTableFacetedFilter
            column={table.getColumn("created_at")}
            title="Filter"
            options={strengths}
          />
        )} */}
      </div>
      {/* <DataTableViewOptions table={table} /> */}
      {state === _contents && <ImportDocumentModal />}
      {state === _agents && (
        <Dialog open={showNewAIAgentForm}>
          <DialogTrigger asChild>
            <Button
              className="rounded-[10px]"
              onClick={() => setShowNewAIAgentForm(true)}
            >
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent
            className={dialogClasses}
            closeDialog={() => { if (currentStep == 1) setCurrentStep(0); else setShowNewAIAgentForm(false), setCurrentStep(0); }}
            onInteractOutside={e => {
              e.preventDefault();
            }}
          >
            <MultiStepForm
              closeDialog={() => { setShowNewAIAgentForm(false), setCurrentStep(0); }}
              setDialogClasses={setDialogClasses}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              type="create"
            />
          </DialogContent>
        </Dialog>
      )}
      {state === _users && (
        <Button className="rounded-[10px]" onClick={() => 0}>
          Add User
        </Button>
      )}
    </div>
  );
}
