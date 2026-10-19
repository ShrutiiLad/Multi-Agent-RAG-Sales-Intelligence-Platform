import React, { useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/constants/delete-confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  AppDispatch,
  RootState,
  useDeleteAgentMutation,
  useLazyFetchAgentByIdQuery,
} from "@/redux/store";
import { MultiStepForm } from "@/components/layout/ai-agent/create/new-agent";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useDispatch, useSelector } from "react-redux";
import { Bot } from "@/config/models";
import { setSelectedBot } from "@/redux/slices/modelSlice";

interface DataTableRowActionsProps {
  selectedRow: { id: string; name: string; type: string };
  setSelectedRow: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      type: string;
    }>
  >;
  bots: Bot[] | undefined;
}
export function DataTableRowActionsAgentsEditDelete({
  selectedRow,
  setSelectedRow,
  bots,
}: DataTableRowActionsProps) {
  const rowId = selectedRow.id;
  const dispatch: AppDispatch = useDispatch();
  const [dialogClasses, setDialogClasses] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const selectedBot = useSelector(
    (state: RootState) => state.model.selectedBot
  );
  const [
    deleteAgent,
    { data: deleteData, isError: isDeleteError, isLoading: isDeleteLoading },
  ] = useDeleteAgentMutation();
  const [getAgent, { data: agentData, isLoading, isFetching }] =
    useLazyFetchAgentByIdQuery();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteAgent(selectedRow.id);
  };

  useEffect(() => {
    if (rowId) {
      getAgent(rowId);
    }
  }, [rowId]);

  useEffect(() => {
    if (deleteData) {
      toast({
        description: "Bot deleted successfully.",
      });
      reset();

      if (!bots || selectedRow?.id !== selectedBot?.id) return;

      const gptFour = bots.find(
        bot => bot.name.trim().replace(/\s/g, "") === "GPT4-T" && !bot.disabled
      );

      const gptThreeFive = bots.find(
        bot =>
          bot.name.trim().replace(/\s/g, "") === "GPT3.5-Turbo" && !bot.disabled
      );

      const nextBotAfterDelete =
        gptFour || gptThreeFive || bots.find(bot => !bot.disabled);

      if (nextBotAfterDelete) dispatch(setSelectedBot(nextBotAfterDelete));
    } else if (isDeleteError) {
      toast({
        variant: "destructive",
        description: "Something went wrong",
      });
    }
  }, [JSON.stringify(deleteData), isDeleteError]);

  const reset = () => {
    setSelectedRow({ type: "", name: "", id: "" });
  };

  return (
    <>
      <DeleteConfirmationDialog
        confirmDialogOpen={Boolean(
          selectedRow.id && selectedRow.type === "delete"
        )}
        setConfirmDialogOpen={reset}
        onHandleDelete={handleDelete}
        textMsg={""}
        supportingText=" the "
        boldText={selectedRow.name}
        endingText=" bot"
        isLoading={isDeleteLoading}
      />
      <Dialog open={Boolean(rowId && selectedRow.type === "edit")}>
        <DialogContent
          className={dialogClasses}
          closeDialog={() => {
            if (currentStep == 1) setCurrentStep(0); else reset(), setCurrentStep(0);
          }}
          onInteractOutside={e => {
            e.preventDefault();
          }}
        >
          {isLoading || isFetching || !rowId ? (
            <Spinner className="absolute left-1/2 top-1/2 z-50" />
          ) : (
            <MultiStepForm
              closeDialog={() => {
                reset(), setCurrentStep(0);
              }}
              agent={agentData}
              setDialogClasses={setDialogClasses}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              type="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
