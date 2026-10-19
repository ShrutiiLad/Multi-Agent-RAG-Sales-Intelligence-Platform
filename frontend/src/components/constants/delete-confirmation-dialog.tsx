import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button"
import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export function DeleteConfirmationDialog({
  confirmDialogOpen = false,
  setConfirmDialogOpen,
  onHandleDelete,
  textMsg = "your account and remove your data from our servers.",
  isLoading,
  supportingText,
  boldText,
  endingText,
}: {
  confirmDialogOpen?: boolean;
  setConfirmDialogOpen: (display: boolean) => void;
  onHandleDelete: () => void;
  textMsg?: string;
  supportingText?: string;
  boldText?: string;
  endingText?: string;
  isLoading: boolean;
}) {
  const [cancelFocused, setCancelFocused] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    setConfirmDialogOpen(false);
  };

  const handleDelete = () => {
    if (isDeleting) return;
    setIsDeleting(true);
    onHandleDelete();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDeleting) return;
    if (e.key === "Escape") {
      handleClose();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      cancelFocused ? handleClose() : handleDelete();
    }
  };

  return (
    <AlertDialog open={confirmDialogOpen}>
      <AlertDialogContent onKeyDown={handleKeyDown}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete {textMsg}
            {supportingText}
            <strong>{boldText}</strong>
            {endingText}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            onClick={() => {
              handleClose();
            }}
            onFocus={() => setCancelFocused(true)}
            onBlur={() => setCancelFocused(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
            {isLoading && <Spinner className="text-white h-4 w-4 mr-2" />}{" "}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
