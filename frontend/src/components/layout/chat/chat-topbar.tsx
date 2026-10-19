import React, { useState } from "react";
import defUser from "@/assets/avatar/defUser.png";
import defAvatar from "@/assets/avatar/avatar-48/1.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import EchoAvatar from "@/components/layout/dashboard/components/avatar";
import ChatRename, { ChatOptionsList } from "@/components/layout/chat-options";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/constants/delete-confirmation-dialog";
import { ChevronDownIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { deleteChatThunk } from "@/redux/slices/conversationSlice";
import { useNavigate } from "react-router-dom";

const ChatTopBar = ({
  token,
  threadId,
  title,
  agent,
}: {
  token: string;
  threadId?: string;
  title?: string;
  agent: any;
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmRenameOpen, setConfirmRenameOpen] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Delete the Chat
  const handleDelete = (threadId: string) => {
    dispatch(
      deleteChatThunk({
        token: token || "",
        threadId: threadId,
      }) as any
    )
      .then(() => {
        toast({
          title: "Chat Deleted",
          description: "Chat has been deleted successfully",
        });
        setConfirmDialogOpen(false);
        navigate("/chat");
      })
      .catch((error: string) => {
        console.error("Failed to delete chat:", error);
      });
  };

  return (
    <div className="selected-model flex items-center border-b-1 h-12 py-3 px-5 bg-gray-100">
      <div className="flex relative items-center">
        <div className="flex items-center justify-center h-5 w-5 shadow-inner">
          <EchoAvatar
            size="mini"
            mainImage={user?.profile?.avatar || ""}
            initialsFallback={user?.profile?.avatar ? "" : user?.username}
            fallbackImage={defUser}
            alt="User"
          />
        </div>
        <div className="absolute left-[15px] flex items-center justify-center h-5 w-5">
          <EchoAvatar
            size="mini"
            mainImage={`${agent?.avatar}`}
            fallbackImage={defAvatar}
            alt="Bot"
          />
        </div>
      </div>
      <div className="flex flex-col ml-6 whitespace-nowrap text-center space-x-2 cursor-pointer">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-center font-medium text-[13px] truncate text-center text-selected">
              {title
                ? title.charAt(0).toUpperCase() + title.slice(1)
                : "New Chat"}
              {title && (
                <ChevronDownIcon className="ml-1 h-3 w-3 text-supportCol" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={`w-40 h-20 rounded-md ${title ? "" : "hidden"}`}
          >
            <ChatOptionsList
              setConfirmDialogOpen={setConfirmDialogOpen}
              setConfirmRenameOpen={setConfirmRenameOpen}
              setSelectedConversation={() => 0}
              setSelectedTitle={() => 0}
              conv={{ id: threadId, title: title }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        <ChatRename
          threadId={threadId || ""}
          title={title || ""}
          confirmRenameOpen={confirmRenameOpen}
          setConfirmRenameOpen={setConfirmRenameOpen}
        />
        <DeleteConfirmationDialog
          confirmDialogOpen={confirmDialogOpen}
          setConfirmDialogOpen={setConfirmDialogOpen}
          onHandleDelete={() => handleDelete(threadId || "")}
          supportingText="the "
          boldText={title}
          endingText=" chat"
          textMsg=""
          isLoading={false}
        />
      </div>
    </div>
  );
};

export default ChatTopBar;
