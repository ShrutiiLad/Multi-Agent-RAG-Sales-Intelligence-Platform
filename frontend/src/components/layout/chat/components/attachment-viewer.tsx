import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React from "react";
import EchoAvatar from "@/components/layout/dashboard/components/avatar";
import { Cross1Icon } from "@radix-ui/react-icons";

interface AttachmentViewerProps {
  attachment: string;
  customSize?: string;
}

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({ attachment, customSize }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <EchoAvatar
          fallbackImage={attachment}
          size={customSize as any || "large"}
          alt="Attachment"
          radius="medium"
          className="ring-1 ring-gray-300 object-contain"
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="relative">
          <div className="flex ring-1 ring-gray-300 rounded-[10px]">
            <EchoAvatar
              fallbackImage={attachment}
              size="extra-extra-large"
              alt="Image Popup"
              radius="medium"
              className="w-full h-auto object-contain"
            />
            <div className="absolute right-2 top-2">
              <AlertDialogCancel className="border-none p-3 text-white hover:bg-black hover:bg-opacity-50 bg-gray-600 opacity-60">
                <Cross1Icon />
              </AlertDialogCancel>
            </div>
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AttachmentViewer;
