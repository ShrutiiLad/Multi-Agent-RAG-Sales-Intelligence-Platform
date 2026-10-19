import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import editPen from "@/assets/editPen.svg";
import { LucideTrash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { renameChatThunk } from "@/redux/slices/conversationSlice";
import { Thread } from "@/config/models";
import { Spinner } from "@/components/ui/spinner";

interface ChatRenameProps {
  threadId: string;
  title: string;
  confirmRenameOpen?: boolean;
  setConfirmRenameOpen: (display: boolean) => void;
}

const ChatRename: React.FC<ChatRenameProps> = ({
  threadId,
  title,
  confirmRenameOpen,
  setConfirmRenameOpen,
}: ChatRenameProps) => {
  const [newTitle, setNewTitle] = useState(title);
  const handleClose = () => setConfirmRenameOpen(false);
  const token = useSelector((state: RootState) => state.auth.token) || "";
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    if (isLoading) return;
    setIsLoading(true);
    dispatch(
      renameChatThunk({
        token: token,
        threadId: threadId,
        newTitle: newTitle,
      }) as any
    )
      .then(() => {
        toast({
          title: "Chat Renamed",
          description: `Chat has been renamed to "${newTitle}"`,
        });
        handleClose(); // Close the dialog after saving
      })
      .catch((error: string) => {
        console.error("Failed to rename chat:", error);
        handleClose(); // Close the dialog after saving
      })
      .finally(() => setIsLoading(false));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleSave();
    }
  };

  useEffect(() => {
    setNewTitle(title); // Update newTitle whenever title changes
  }, [title]);

  return (
    <Dialog open={confirmRenameOpen} onOpenChange={setConfirmRenameOpen}>
      <DialogContent
        className="w-[320px] h-[172px]"
        onInteractOutside={e => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="border-b pl-4 py-[17px]">
          <DialogTitle className="text-lg font-medium leading-[18px]">
            Rename this chat
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center mb-0">
          <Input
            id="name"
            value={newTitle}
            defaultValue={title}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-[288px] h-9 border-1 border-navbarHoverBg rounded-[10px]"
          />
        </div>
        <DialogFooter className="py-3 px-4 -mt-2 items-center h-[60px]">
          <DialogClose asChild>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={handleClose}
              className="rounded-[10px] h-9"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={isLoading}
            className="rounded-[10px] h-9"
          >
            {isLoading && <Spinner className="text-white h-4 w-4 mr-1" />}
            <span>Save</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ChatOptionsListProps {
  setConfirmRenameOpen: (display: boolean) => void;
  setConfirmDialogOpen: (display: boolean) => void;
  setSelectedConversation: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTitle: React.Dispatch<React.SetStateAction<string>>;
  conv: Thread | any;
}

export const ChatOptionsList: React.FC<ChatOptionsListProps> = ({
  setConfirmRenameOpen,
  setConfirmDialogOpen,
  setSelectedConversation,
  setSelectedTitle,
  conv,
}) => {
  console.log("conv", conv);

  return (
    <>
      <DropdownMenuItem
        onClick={() => {
          setSelectedConversation(conv.id);
          setSelectedTitle(conv.title);
          setConfirmRenameOpen(true);
        }}
        className="h-9 rounded-md cursor-pointer"
      >
        <div className="flex flex-row items-center text-selected font-normal space-x-2">
          <img src={editPen} alt="Edit" className="w-4 h-4" />
          <span>Rename</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => {
          setSelectedConversation(conv.id);
          setSelectedTitle(conv.title);
          setConfirmDialogOpen(true);
        }}
        className="h-9 rounded-md cursor-pointer"
      >
        <div className="flex flex-row items-center text-delete font-normal space-x-2">
          <LucideTrash2 className="text-delete w-4 h-4" />
          <span>Delete Chat</span>
        </div>
      </DropdownMenuItem>
    </>
  );
};

export default ChatRename;
