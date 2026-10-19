import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import AttachmentLink from "@/assets/AttachmentLink.svg";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Attachment from "@/components/layout/chat/components/attachments";
import { Img } from "@/config/models";
import { Separator } from "@/components/ui/separator";
import { useCreateImageURLMutation } from "@/redux/store";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { CORE_URL } from "@/services/global_config";

interface AttachmentInputProps {
  agentName: string;
  selectedFile: Img[] | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<Img[]>>;
}

const AttachmentInput: React.FC<AttachmentInputProps> = ({
  agentName,
  setSelectedFile,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [allImages, setAllImages] = useState<Img[]>([]);

  const [createImage, { isLoading: isCreateImageLoading, data: imageData }] =
    useCreateImageURLMutation();

  const uploadImage = (imageFile: File) => {
    if (allImages.length >= 5) {
      toast({
        variant: "destructive",
        title: "Maximum Image Limit Reached",
        description: "You can only add up to 5 images.",
      });
      return;
    }
    createImage(imageFile);
  };

  useEffect(() => {
    if (imageData?.file) {
      const newImage: Img = {
        id: Math.random().toString(),
        link: CORE_URL + imageData.file,
        file: "",
        created_at: "",
        category: "",
        caption: "",
        message: "",
      };
      setAllImages(prevImages => [...prevImages, newImage]);
    }
  }, [imageData?.file]);

  const allowedExtensions = ["jpg", "jpeg", "png"];

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files as FileList;
    const extension = files[0].name.split(".").pop()?.toLowerCase() ?? "";
    if (allowedExtensions.includes(extension)) {
      uploadImage(files[0]);
    }
  };

  const clearDialog = () => {
    setIsDialogOpen(!isDialogOpen);
    setAllImages([]);
    setCurrentImage("");
  };

  /*
Drawbacks
  1. It overcomes the CORS issue but it first downloads the image.
  2. It is not efficient and fast due to downloading of image.
*/

  // async function isImgUrl(url: string): Promise<boolean> {
  //   return new Promise(resolve => {
  //     const img = new Image();
  //     img.src = url;
  //     img.onload = () => resolve(true);
  //     img.onerror = () => resolve(false);
  //   });
  // }

  /* 
  Drawbacks
    1. it doesn't work when the request is rejected by CORS 
    2. it doesn't work with images formats that are not supported by browsers.
  */

  async function isImgUrl(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: "HEAD" });
      const contentType = res.headers.get("Content-Type");
      return contentType ? contentType.startsWith("image") : false;
    } catch (error) {
      console.error("Error fetching URL:", error);
      return false;
    }
  }

  const { toast } = useToast();

  const submitLinks = async () => {
    setSelectedFile(prevSelectedFiles => [...prevSelectedFiles, ...allImages]);
    clearDialog();
  };

  const handleEnterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleMessage();
    }
  };

  const handleMessage = async () => {
    console.log("Function called with image URL:", currentImage);
    if (currentImage === "") return;

    const isValidImage = await isImgUrl(currentImage);

    if (!isValidImage) {
      toast({
        variant: "destructive",
        title: "Invalid Image URL",
        description: "The provided URL is not a valid image.",
      });
      return;
    }

    if (allImages.some(image => image.link === currentImage)) {
      toast({
        variant: "destructive",
        title: "Duplicate Image",
        description: "The image you're trying to add already exists.",
      });
      return;
    }

    if (allImages.length >= 5) {
      toast({
        variant: "destructive",
        title: "Maximum Image Limit Reached",
        description: "You can only add up to 5 images.",
      });
      return;
    }

    const newImage: Img = {
      id: Math.random().toString(),
      link: currentImage,
      file: "",
      created_at: "",
      category: "",
      caption: "",
      message: "",
    };

    setAllImages(prevImages => [...prevImages, newImage]);
    setCurrentImage("");
    console.log("All Images: ", allImages, currentImage);
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-2 transition">
      {agentName?.trim().replace(/\s/g, "") === "GPT4-T" && (
        <Dialog open={isDialogOpen} onOpenChange={clearDialog}>
          <DialogTrigger asChild>
            <button
              className="h-6 w-6 flex items-center justify-center cursor-pointer hover:bg-selectedBg rounded-[10px]"
              onClick={() => setIsDialogOpen(true)}
            >
              <Label htmlFor="attachment " className=" relative">
                <img
                  src={AttachmentLink}
                  alt="Attachment"
                  className="cursor-pointer"
                />
              </Label>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="text-selected text-lg font-medium leading-[18px] flex justify-center h-[52px] py-[17px] px-4 border-b">
              Attachments
            </DialogHeader>
            <div
              className={cn(
                "relative flex flex-col bg-selectedBg rounded-lg py-10 px-3 mx-3 justify-center items-center",
                { "opacity-50 cursor-none": isCreateImageLoading }
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex gap-3">
                <Attachment
                  attachments={allImages}
                  setAttachments={setAllImages}
                />
                {isCreateImageLoading && (
                  <div className="ring-1 ring-gray-300 rounded-[10px] h-12 w-12 mb-3 flex items-center justify-center ">
                    <Spinner />
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm">
                <Label>Drag an image here or </Label>
                {"\u00A0"}
                <Label
                  htmlFor="upload-file-input"
                  className="cursor-pointer underline"
                >
                  upload an image
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
                  accept="image/png, image/jpeg"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      uploadImage(e.target.files[0]);
                    }
                  }}
                />
              </div>
              <div className="flex flex-row items-center justify-center text-supportCol py-6">
                <Separator className="w-full mr-4 text-sm" />
                <p className="text-[10px]">OR</p>
                <Separator className="w-full ml-4" />
              </div>
              <div className="flex self-stretch">
                <Input
                  type="text"
                  value={currentImage}
                  onChange={e => setCurrentImage(e.target.value)}
                  onKeyDown={handleEnterKeyPress}
                  placeholder="Enter Image link"
                  className="border-1 placeholder:text-lightText text-selected rounded-r-none h-9"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="rounded-l-none border-1 border-l-0 h-9 hover:bg-[#65c49a]"
                  onClick={() => handleMessage()}
                >
                  <Check
                    style={{
                      height: "16px",
                      width: "16px",
                      color: "rgba(34, 34, 68, 0.5)",
                    }}
                  />
                </Button>
              </div>
            </div>
            <DialogFooter className="px-4 py-3">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm rounded-[10px]"
                  onClick={clearDialog}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                className="text-sm rounded-[10px] bg-selected"
                onClick={submitLinks}
                disabled={isCreateImageLoading}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AttachmentInput;
