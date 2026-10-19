import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AgentFormData } from "@/components/layout/ai-agent/create/new-agent";
import { AgentKnowledge } from "@/components/helpers/agent-knowledge";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import selectedSourcesLight from "@/assets/selectedSourcesLight.svg";
import { columns } from "@/components/helpers/table/columns/sources-content-columns";
import { Checkbox } from "@/components/ui/checkbox";
import { useFetchDocumentsQuery } from "@/redux/store";

export interface DocumentSelectionStepProps {
  updateFormData: (data: Partial<AgentFormData>) => void;
  formData: AgentFormData;
  previousStep: () => void;
  type: "edit" | "detail" | "create";
}

const DocumentSelectionStep: React.FC<DocumentSelectionStepProps> = ({
  updateFormData,
  formData,
  previousStep,
  type,
}) => {
  const { isLoading, data } = useFetchDocumentsQuery();

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(
    formData.documents || []
  );
  const [selectedRows, setSelectedRows] = useState<number>(
    formData.documents.length
  );

  const isDetail = type === "detail";

  const handleSave = () => {
    updateFormData({ documents: selectedDocuments });
    setTimeout(() => {
      previousStep();
    }, 0);
  };

  useEffect(() => {
    setSelectedRows(formData.documents.length);
  }, [formData]);

  const getColumnWithSelection = () => {
    const selectColumn = {
      id: "select",
      accessorKey: "select",
      header: ({ table }: { table: any }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          disabled={isDetail}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="flex items-center border-overlay justify-center"
        />
      ),
      cell: ({ row }: { row: any }) => (
        <Checkbox
          checked={
            selectedDocuments.includes(row["original"]["id"]) ||
            row.getIsSelected()
          }
          onCheckedChange={value => {
            console.log(row["original"]["id"]);
            row.toggleSelected(!!value);
            if (selectedDocuments.includes(row["original"]["id"])) {
              setSelectedDocuments(
                selectedDocuments.filter(doc => doc !== row["original"]["id"])
              );
            } else {
              setSelectedDocuments([
                ...selectedDocuments,
                row["original"]["id"],
              ]);
            }
          }}
          disabled={isDetail}
          aria-label="Select row"
          className="flex items-center border-overlay justify-center"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };
    return [selectColumn, ...columns];
  };

  return (
    <>
      <DialogHeader className="text-selected text-lg font-medium leading-[18px] h-[52px] px-4 py-[17px] border-b">
        Agent Knowledge
      </DialogHeader>
      <div className="px-4 pt-4 justify-center w-[800px]">
        <AgentKnowledge
          formData={formData}
          setSelectedRows={setSelectedRows}
          columns={getColumnWithSelection()}
          isLoading={isLoading}
          documents={data || []}
          isDetail={isDetail}
        />
      </div>
      <DialogFooter className="flex items-center justify-end space-x-2 px-4 py-3">
        {selectedRows > 0 && (
          <div className="flex-1 text-sm text-muted-foreground">
            <div className="flex gap-2 items-center text-sm text-supportCol font-normal">
              <img src={selectedSourcesLight} alt="" className="" />
              {selectedRows} {" source"}
              {selectedRows > 1 ? "s" : ""} selected
            </div>
          </div>
        )}
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className="text-sm rounded-[10px]"
            onClick={previousStep}
          >
            {isDetail ? "Back" : "Cancel"}
          </Button>
        </DialogClose>
        {!isDetail && (
          <Button
            type="submit"
            className="text-sm rounded-[10px] bg-selected"
            onClick={handleSave}
          >
            Save
          </Button>
        )}
      </DialogFooter>
    </>
  );
};

export default DocumentSelectionStep;

// STAR-VOICE - BAR OWNER - CUSTOMER SIMULATION
//
