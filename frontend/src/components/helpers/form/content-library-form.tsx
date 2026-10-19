import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  // PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
import React, { useEffect, useRef, useState } from "react";
import { CalendarIcon, Square, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import ComboboxPopoverAddItem from "@/components/helpers/form/content-library-add-item";
import {
  locationList,
  projectsList,
  roleStatuses,
  strengthStatuses,
} from "@/components/constants/content-library-form";
import ComboboxPopoverAddSingleItem from "@/components/helpers/form/content-library-add-single-item";
import { Label } from "@/components/ui/label";
import {
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
} from "@/redux/store";
import { Document } from "@/config/models";
// import ContentLibraryModalLoading from "@/components/helpers/form/content-library-modal-loading";
import { useToast } from "@/components/ui/use-toast";
import { useAutosizeTextArea } from "@/hooks/useAutosizeTextArea";
import ClipLoader from "react-spinners/ClipLoader";
import { Calendar } from "@/components/ui/calendar";

export function ContentLibraryForm({
  canEdit = true,
  displayLibraryForm = false,
  setDisplayLibraryForm,
  closeBothDialogs,
  documentLoadedData,
  documentFile,
  isOldDocument = false,
  isLoading,
}: {
  canEdit?: boolean;
  displayLibraryForm?: boolean;
  setDisplayLibraryForm: (display: boolean) => void;
  closeBothDialogs: () => void;
  documentLoadedData: Document;
  documentFile?: File | null;
  isOldDocument?: boolean;
  isLoading?: boolean;
}) {
  const resetData: Document = {
    id: "",
    title: "",
    created_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    description: "",
    source: "",
    summary: "test",
    url: "",
    author: "",
    category: "",
    type: "",
    strength: "",
  };
  const [documentData, setDocumentData] = React.useState<Document>(resetData);
  // const [documentDate, setDocumentDate] = React.useState<Date | undefined>(new Date(documentData.published_at));
  const [
    createDocument,
    {
      isLoading: isCreateDocumentLoading,
      error: isCreateDocumentError,
      data: createDocumentData,
    },
  ] = useCreateDocumentMutation();
  const [
    updateDocument,
    {
      isLoading: isUpdateDocumentLoading,
      error: isUpdateDocumentError,
      data: updateDocumentData,
    },
  ] = useUpdateDocumentMutation();

  const { toast } = useToast();
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  useEffect(() => {
    const filteredData = Object.fromEntries(
      Object.entries(documentLoadedData).filter(([_, value]) => Boolean(value))
    );
    setDocumentData(prev => ({ ...prev, ...filteredData }));
  }, [documentLoadedData]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setDocumentData(prevState => ({ ...prevState, [name]: value }));
    name === "description" &&
      setDocumentData(prevState => ({ ...prevState, summary: value }));
  };
  const handleChangeDate = (selectedDate: Date | undefined) => {
    setDocumentData(prevState => ({
      ...prevState,
      published_at: selectedDate?.toISOString() || new Date().toISOString(),
    }));
    // setDocumentDate(selectedDate);
  };
  const handleChangeAddedItem = (itemName: string, itemValue: string) => {
    setDocumentData(prevState => ({ ...prevState, [itemName]: itemValue }));
  };

  const handleSubmit = () => {
    setDisabledForm(true);
    if (isOldDocument) {
      handleUpdateDocument();
    } else {
      handleSaveDocument();
    }
  };

  useEffect(() => {
    if (createDocumentData) {
      closeBothDialogs();
      setDisabledForm(false);
      setDisplayLibraryForm(false);
      toast({
        description: "Document saved successfully.",
      });
    }
  }, [JSON.stringify(createDocumentData)]);

  useEffect(() => {
    if (isCreateDocumentError) {
      setDisabledForm(false);
      toast({
        description: "Error occured while saving document.",
      });
    }
  }, [isCreateDocumentError]);

  useEffect(() => {
    if (updateDocumentData) {
      setDisabledForm(false);
      closeBothDialogs();
      setDisplayLibraryForm(false);
      toast({
        description: "Document updated successfully.",
      });
    }
  }, [updateDocumentData]);

  useEffect(() => {
    if (isUpdateDocumentError) {
      setDisabledForm(false);
      toast({
        description: "Error occured while updating document.",
      });
    }
  }, [isUpdateDocumentError]);

  const handleSaveDocument = () => {
    const payload = { ...documentData, file: documentFile };
    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => Boolean(value))
    );
    createDocument(filteredPayload as any);
  };

  const handleUpdateDocument = async () => {
    const filteredDocumentData = Object.fromEntries(
      Object.entries(documentData).filter(([_, value]) => Boolean(value))
    );
    updateDocument({
      document: filteredDocumentData as any,
      id: documentData?.id,
    });
  };

  // Function to check if Save button should be disabled
  const isSaveDisabled = () => {
    return !documentData.title || !documentData.category;
  };

  const titleTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const descTextAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(
    "title",
    titleTextAreaRef.current,
    documentData?.title || ""
  );
  useAutosizeTextArea(
    "description",
    descTextAreaRef.current,
    documentData?.description || ""
  );

  const isPDF = documentFile?.type === "application/pdf";
  const isCSVorExcal =
    documentFile?.type === "text/csv" ||
    documentFile?.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  useEffect(() => {
    if (isCSVorExcal) {
      setDocumentData(prev => ({
        ...prev,
        type: "interview",
      }));
    } else if (isPDF) {
      setDocumentData(prev => ({
        ...prev,
        type: "general",
      }));
    }
  }, [isPDF, isCSVorExcal]);

  useEffect(() => {
    if (!displayLibraryForm) {
      setDocumentData(resetData);
    }
  }, [displayLibraryForm]);

  const fileSplitted =
    typeof documentLoadedData?.file === "string"
      ? documentLoadedData?.file?.split("/")
      : "";
  const fileName = (documentLoadedData?.file as File)?.name || "";
  const fileLink = fileSplitted[fileSplitted.length - 1];

  const downloadFile = () => {
    const url = window.URL.createObjectURL(documentLoadedData?.file as File);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", fileName);
    link.click();
  };

  const downloadFileFromURL = async () => {
    const response = await fetch(documentLoadedData?.file as string);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", fileLink);
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000); // Revoke the object URL after a second (adjust as needed)
  };

  return (
    <>
      <Dialog open={displayLibraryForm} onOpenChange={setDisplayLibraryForm}>
        <DialogContent
          className="md:w-3/4 lg:w-[1024px] max-w-[1024px] h-[640px] overflow-hidden gap-0"
          onInteractOutside={e => {
            e.preventDefault();
          }}
        >
          <DialogHeader className="font-medium text-[13px] text-selected h-[52px] font-Inter  flex justify-center mx-5">
            {documentLoadedData?.title || "New document"}
          </DialogHeader>
          <div className="flex border-t border-gray-200 border-solid">
            {(isLoading ||
              isCreateDocumentLoading ||
              isUpdateDocumentLoading) && (
              // <Spinner className="absolute left-1/2 top-1/2" />
              <ClipLoader
                color={"rgba(82 82 91)"}
                size={40}
                className="absolute left-1/2 top-1/2"
                aria-label="Loading Spinner"
              />
            )}
            <div className=" w-[664px] bg-selectedBg py-5 px-10 h-[588px] overflow-y-auto">
              <div className="bg-white rounded-md p-10">
                <Textarea
                  id="title"
                  // type="text"
                  name="title"
                  className="text-[22px]  p-0 pb-2 min-h-[38px] font-medium font-Inter leading-snug text-selected resize-none"
                  placeholder="Untitled"
                  ref={titleTextAreaRef}
                  disabled={!canEdit || disabledForm}
                  value={documentData?.title}
                  onChange={handleChange}
                />
                <Textarea
                  className="bg-white p-0 text-sm font-Inter leading-normal resize-none"
                  style={{ minHeight: "500px", scrollbarWidth: "none" }}
                  placeholder="Write something to describe your document"
                  name="description"
                  id="description"
                  ref={descTextAreaRef}
                  disabled={!canEdit || disabledForm}
                  value={documentData?.description || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className=" w-[360px] p-5 space-y-3 h-[70vh] overflow-auto">
              <div className="flex items-center justify-between">
                <p className="text-supportCol font-medium font-Inter text-[13px]">
                  Date *
                </p>
                <Popover>
                  <PopoverTrigger asChild className="border-supportCol h-8">
                    <Button
                      variant={"ghost"}
                      disabled={disabledForm}
                      className={cn(
                        "w-[200px] cursor-default pl-2 justify-start text-left border-1 border-gray font-normal font-Inter text-[13px]",
                        !documentData.published_at && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {documentData.published_at || documentData.created_at
                        ? format(
                            new Date(
                              documentData.published_at ||
                                documentData.created_at
                            ),
                            "PPP"
                          )
                        : format(new Date(), "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        documentData.published_at
                          ? new Date(documentData.published_at)
                          : new Date(documentData.created_at)
                      }
                      onSelect={handleChangeDate}
                      initialFocus
                      disabled={date =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-row items-center">
                <Label className="w-1/3 text-supportCol font-medium font-Inter text-[13px]">
                  Source
                </Label>
                <Input
                  type="text"
                  id="source"
                  name="source"
                  className="w-2/3 ml-5 h-8 border-1 focus-visible:outline font-Inter text-[13px]"
                  placeholder="+ Add source"
                  disabled={!canEdit || disabledForm}
                  value={documentData?.source || ""}
                  onChange={e =>
                    handleChangeAddedItem("source", e.target.value)
                  }
                />
              </div>
              <div className="flex flex-row items-center">
                <Label className="w-1/3 text-supportCol font-medium font-Inter text-[13px]">
                  Author
                </Label>
                <Input
                  type="text"
                  id="author"
                  name="author"
                  className="w-2/3 ml-5 h-8 border-1 focus-visible:outline font-Inter text-[13px]"
                  placeholder="+ Add author"
                  disabled={!canEdit || disabledForm}
                  value={documentData?.author || ""}
                  onChange={e =>
                    handleChangeAddedItem("author", e.target.value)
                  }
                />
              </div>
              <div className="space-y-3">
                {/* Todo : Use Buttons for adding multiple values */}
                <ComboboxPopoverAddItem
                  name="Project *"
                  initialText="Add project"
                  updateState={data =>
                    data &&
                    handleChangeAddedItem(
                      "project",
                      data[0].value.toUpperCase()
                    )
                  }
                  preSelectedStatus={
                    documentLoadedData && documentLoadedData.project
                      ? [
                          {
                            value: documentLoadedData?.project || "",
                            label: documentLoadedData?.project || "",
                            icon: Square,
                          },
                        ]
                      : null
                  }
                  statuses={projectsList}
                  statusesPlaceholder="Search project..."
                  comboboxStyle="space-x-[64px] h-8"
                  isDisabled={disabledForm}
                />
                <ComboboxPopoverAddItem
                  name="location *"
                  initialText="Add location"
                  updateState={data =>
                    data && handleChangeAddedItem("location", data[0].label)
                  }
                  preSelectedStatus={
                    documentLoadedData && documentLoadedData.location
                      ? [
                          {
                            value: documentLoadedData?.location || "",
                            label: documentLoadedData?.location || "",
                            icon: Square,
                          },
                        ]
                      : null
                  }
                  statuses={locationList}
                  statusesPlaceholder="Search location..."
                  comboboxStyle="space-x-[54px] h-8"
                  isDisabled={disabledForm}
                />
                <ComboboxPopoverAddSingleItem
                  name="Role *"
                  initialText="Add roles"
                  preSelectedStatus={
                    documentData && documentData.category
                      ? {
                          value: documentData?.category,
                          label:
                            documentData?.category
                              .substring(0, 1)
                              .toUpperCase() + documentData?.category.slice(1),
                          icon: Square,
                        }
                      : null
                  }
                  updateState={data => {
                    /* Integrate with file size */
                    data && handleChangeAddedItem("category", data.value);
                  }}
                  statuses={roleStatuses}
                  statusesPlaceholder="Search role..."
                  comboboxStyle="space-x-[31px] h-8"
                  isDisabled={disabledForm}
                />
                <ComboboxPopoverAddSingleItem
                  name="Strength"
                  initialText="Add strength"
                  updateState={data =>
                    data && handleChangeAddedItem("strength", data.value)
                  }
                  statuses={strengthStatuses}
                  isDisabled={disabledForm}
                  preSelectedStatus={
                    documentLoadedData && documentLoadedData.strength
                      ? {
                          value: documentLoadedData?.strength,
                          label:
                            (documentLoadedData?.strength &&
                              strengthStatuses.find(
                                item =>
                                  item.value === documentLoadedData?.strength
                              )?.label) ||
                            "",
                          icon:
                            strengthStatuses.find(
                              item => item.value === documentLoadedData.strength
                            )?.icon === Zap
                              ? Zap
                              : Square,
                        }
                      : null
                  }
                  comboboxStyle="space-x-[31px] h-8"
                />
                <div className="flex flex-row items-center">
                  <Label className="w-1/3 text-supportCol font-medium font-Inter text-[13px]">
                    Original link
                  </Label>
                  <Input
                    type="text"
                    id="url"
                    name="url"
                    disabled={!canEdit || disabledForm}
                    value={documentData?.url || ""}
                    className="w-2/3 h-8 ml-5 border-1 focus-visible:outline font-Inter text-[13px]"
                    placeholder="+ Add link"
                    onChange={handleChange}
                  />
                </div>
                {(fileLink || fileName) && (
                  <div className="flex flex-row items-center">
                    <Label className="w-1/3 text-supportCol font-medium font-Inter text-[13px]">
                      Attached File
                    </Label>
                    <Textarea
                      id="file"
                      name="file"
                      value={fileLink || fileName || ""}
                      className="w-2/3 h-8 ml-5 border-1 focus-visible:outline font-Inter text-[13px] cursor-pointer caret-transparent outline-none"
                      onChange={handleChange}
                      onClick={fileLink ? downloadFileFromURL : downloadFile}
                      {...{ readonly: true }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 flex justify-end pr-3 pb-3">
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-[36px] w-[75px] text-[13px] font-medium"
                  disabled={disabledForm}
                  // onClick={() => setDisplayLibraryForm(false)}
                  onClick={() => {
                    closeBothDialogs;
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="h-[36px] w-[63px] text-[13px] font-medium"
                disabled={isSaveDisabled() || !canEdit || disabledForm}
                onClick={handleSubmit}
              >
                Save
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
