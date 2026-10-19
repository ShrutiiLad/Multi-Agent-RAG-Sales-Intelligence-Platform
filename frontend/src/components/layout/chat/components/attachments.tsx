import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import React from "react";
import CloseIcon from "@/assets/CloseIcon.svg";
import AttachmentViewer from "@/components/layout/chat/components/attachment-viewer";
import { Img } from "@/config/models";

interface AttachmentProps {
  attachments: Img[] | null;
  setAttachments: React.Dispatch<React.SetStateAction<Img[]>>;
}

const Attachment: React.FC<AttachmentProps> = ({
  attachments,
  setAttachments,
}) => {
  console.log("Attachments: ", attachments);
  // const createImageURLs = (attachments: File[]) => {
  //   const imageUrls: string[] = [];

  //   attachments.forEach(file => {
  //     const url = URL.createObjectURL(file);
  //     imageUrls.push(url);
  //   });

  //   return imageUrls;
  // };

  // const imageURLs = createImageURLs(attachments);

  const handleDelete = (index: number) => {
    const updatedAttachments = [...(attachments || [])];
    // Remove the attachment at the specified index
    updatedAttachments.splice(index, 1);
    // Update the state with the new attachments array
    setAttachments(updatedAttachments);
  };

  return (
    <div className="flex gap-3 mb-2 flex-wrap">
      {attachments &&
        attachments.map((messageFile, index) => (
          <TooltipProvider key={messageFile.id}>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex flex-row">
                  <div className="relative group">
                    <img
                      src={CloseIcon}
                      alt="Close"
                      className="absolute -top-1 -right-1 bg-gray-100 rounded-full hidden group-hover:block"
                      onClick={() => handleDelete(index)}
                    />
                    <AttachmentViewer attachment={messageFile.link} />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <a target="_blank" href={messageFile.link}>
                  <p className="w-[250px] truncate">{messageFile.link}</p>
                </a>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
    </div>
  );
};

export default Attachment;
