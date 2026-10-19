import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import fileIconImg from "@/assets/fileIcon.svg";
import { Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useDeleteDocumentMutation } from "@/redux/store";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

export default function ContentLibraryModalLoading({
  displayModalLoading = false,
  setDisplayModalLoading,
  documentData,
}: {
  displayModalLoading?: boolean;
  setDisplayModalLoading: (display: boolean) => void;
  documentData?: { id: string; title: string };
}) {
  const [progress, setProgress] = useState(0);
  const [fileTitle, setFileTitle] = useState<string>("");
  const { toast } = useToast();

  const [deleteDocument, { isLoading, isError, data }] =
    useDeleteDocumentMutation();

  useEffect(() => {
    documentData && setFileTitle(documentData.title);
  }, [documentData]);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 4000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (data) {
      setFileTitle("");
      setDisplayModalLoading(false);
      toast({
        description: "Uploaded Document deleted successfully.",
      });
    }
  }, [JSON.stringify(data)]);

  useEffect(() => {
    if (isError) {
      toast({
        description: "Error while deleting document",
        variant: "destructive",
      });
    }
  }, [isError]);

  const handleDelete = () => {
    const id = documentData?.id;
    deleteDocument(id || "");
  };

  return (
    <Dialog open={displayModalLoading} onOpenChange={setDisplayModalLoading}>
      <DialogContent
        className="w-full md:w-[480px] lg:w-[560px] max-w-full h-[214px] overflow-hidden gap-0"
        onInteractOutside={e => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="pt-4 px-5 text-[13px] text-selected font-medium">
          Import a document
        </DialogHeader>
        <div className="flex bg-selectedBg w-[536px] h-[102px] justify-center items-center rounded-lg flex-col mx-auto p-4">
          {isLoading && <Spinner />}
          <div className="relative flex w-full justify-between items-center">
            <div className="flex items-center -ml-3 -mt-2">
              <img src={fileIconImg} alt="file" />

              <div>
                <p className="text-sm text-selected font-medium">{fileTitle}</p>
                <span className="text-xs text-supportCol">1,8Mb</span>
              </div>
            </div>
            <Button
              className=" absolute p-0 w-4 h-4 pointer fill-delete bg-transparent top-2 right-0"
              onClick={handleDelete}
              variant="ghost"
            >
              <Trash2 style={{ color: "supportCol" }} />
            </Button>
          </div>
          <div className="flex items-center justify-center w-[504px]">
            <Progress
              value={progress}
              className="w-[456px] h-[8px] bgPrimary"
            />
            <p className="pl-3 text-xs text-right">{`${progress} %`}</p>
          </div>
        </div>

        <DialogFooter className="p-3 items-center">
          <DialogClose asChild>
            <Button
              type="button"
              className="h-9"
              onClick={() => setDisplayModalLoading(false)}
            >
              Next
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
