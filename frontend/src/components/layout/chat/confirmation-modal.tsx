import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";
import { Label } from "@/components/ui/label";

const ConfirmationModal = ({
  textContent,
  onCloseModal,
  displayConfirmationModal,
  onSubmit,
}: {
  displayConfirmationModal: boolean;
  onCloseModal: () => void;
  textContent: string;
  onSubmit: () => void;
}) => {
  return (
    <>
      <Dialog open={displayConfirmationModal} onOpenChange={onCloseModal}>
        <DialogTrigger asChild>Provide Additional Feedback</DialogTrigger>
        <DialogContent
          className="w-full md:w-2/4 lg:w-[560px] max-w-full"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader className="mt-3 ml-5 text-sm font-semibold relative">
            Alert
          </DialogHeader>
          <div className="flex flex-col rounded-lg py-10 px-6 mx-3 justify-center items-center ">
            <div className="flex flex-col w-full">
              <Label className="mr-2">{textContent}</Label>
            </div>
          </div>
          <DialogFooter className="p-3">
            <Button type="button" variant="outline" onClick={onCloseModal}>
              Cancel
            </Button>
            <Button type="button" variant={"default"} onClick={onSubmit}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ConfirmationModal;
