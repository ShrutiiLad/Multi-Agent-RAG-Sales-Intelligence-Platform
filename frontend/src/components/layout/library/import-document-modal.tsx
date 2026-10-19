import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { UploadCloudIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ContentLibraryForm } from "@/components/helpers/form/content-library-form";

interface ImportDocumentModalProps {
  Trigger?: boolean; // Optional boolean type
}

const ImportDocumentModal: React.FC<ImportDocumentModalProps> = ({
  Trigger = true,
}) => {
  const [newFile, setNewFile] = React.useState<{ title: string } | null>(null);
  const [fileData, setFileData] = React.useState<File | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [url, setUrl] = React.useState<string>("");
  const allowedExtensions = ["pdf"];
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files as FileList;
    const extension = files[0].name.split(".").pop()?.toLowerCase() ?? "";
    if (allowedExtensions.includes(extension)) {
      setNewFile({ title: files[0].name });
      setFileData(files[0]);
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false); // Directly control the dialog's visibility

  const closeBothDialogs = () => {
    setDialogOpen(false); // Close the dialog
  };

  const openDialog = () => {
    setDialogOpen(true); // Open the dialog
  };

  useEffect(() => {
    if (!dialogOpen) {
      setNewFile(null);
      setFileData(null);
      setUrl("");
    }
  }, [dialogOpen]);

  async function getFileFromUrl(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault(); // Prevent the default button click behavior

    if (!url) return; // Handle empty URL

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const data = await response.blob();
      const path = (window.URL || window.webkitURL).createObjectURL(data);
      console.log(path); // This will log the object URL
      // Here you can handle the fetched file as needed
    } catch (error) {
      console.error("Error fetching file from URL:", error);
    }
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {Trigger ? (
          <DialogTrigger asChild>
            <Button onClick={openDialog} className="rounded-[10px]">
              Import a document
            </Button>
          </DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button
              onClick={openDialog}
              variant="outline"
              className="rounded-[10px] h-9"
            >
              New data Source
            </Button>
          </DialogTrigger>
        )}
        <DialogContent
          className="md:w-2/4 lg:w-[560px] max-w-[560px] gap-0"
          onInteractOutside={e => {
            e.preventDefault();
          }}
        >
          <DialogHeader className="h-[52px] flex justify-center mx-5 text-sm font-medium">
            Import a document
          </DialogHeader>
          <div
            className="flex flex-col bg-selectedBg rounded-lg py-10 px-6 mx-3 justify-center items-center "
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 mb-3 p-0 bg-white text-supportCol border-selectedBg"
            >
              <UploadCloudIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center text-sm">
              <Label>Drag a document here or </Label>
              {"\u00A0"}
              <Label
                htmlFor="upload-file-input"
                className="cursor-pointer underline"
              >
                upload a file
              </Label>
              <Input
                id="upload-file-input"
                placeholder="Upload a file"
                style={{
                  visibility: "hidden",
                  position: "absolute",
                  top: "-9999px",
                  left: "-9999px",
                }}
                type="file"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    setNewFile({ title: e.target.files[0].name });
                    setFileData(e.target.files[0]);
                  } else {
                    setNewFile(null);
                  }
                }}
                accept=".csv, application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />
            </div>
            {newFile && newFile.title && (
              <p className="flex w-full justify-center mt-2 text-sm text-supportCol">
                File Uploaded: {newFile?.title}
              </p>
            )}
            <p className="flex w-full justify-center mt-1 text-xs text-supportCol">
              Max size: XX Mb
            </p>
            <div className="flex flex-row items-center justify-center text-supportCol py-6">
              <Separator className="w-[220.5px] mr-4 text-sm" />
              <p className="text-[10px]">OR</p>
              <Separator className="w-[220.5px] ml-4" />
            </div>
            <Input
              type="text"
              placeholder="Paste a link"
              className="text-[13px] w-[472px] py-2 px-3"
              value={url}
              onChange={e => {
                setUrl(e.target.value);
              }}
            />
            <input type="file" ref={inputRef} style={{ display: "none" }} />
          </div>
          <DialogFooter className="p-3">
            <Button
              type="button"
              variant={newFile === null ? "outline" : "default"}
              onClick={() => {
                getFileFromUrl;
                setShowForm(true);
              }}
            >
              {newFile !== null ? "Next" : "Skip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showForm && (
        <ContentLibraryForm
          displayLibraryForm={showForm}
          setDisplayLibraryForm={setShowForm}
          closeBothDialogs={closeBothDialogs}
          documentLoadedData={{
            id: "",
            title: newFile?.title || "",
            summary: "",
            category: "",
            created_at: "",
            published_at: "",
            type: "",
            strength: "",
            file: fileData,
          }}
          documentFile={fileData}
        />)}
    </>
  );
};
export default ImportDocumentModal;
