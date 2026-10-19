import React, { useEffect, useRef, useState } from "react";
import { getFilteredConversations } from "@/components/helpers/chat-conversations-list-functions";
import { Label } from "@/components/ui/label";
import ChatSearch from "@/components/layout/dashboard/components/chat-search";
import { useDebounce } from "@/components/helpers/common-hooks";
import { getAllUserThreads } from "@/services/chat/threads";
import { Thread } from "@/config/models";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setConversations } from "@/redux/slices/conversationSlice";
import { RootState } from "@/redux/store";
import defAvatar from "@/assets/avatar/avatar-48/1.svg";
import EchoAvatar from "@/components/layout/dashboard/components/avatar";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import ChatRename, { ChatOptionsList } from "@/components/layout/chat-options";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { DeleteConfirmationDialog } from "@/components/constants/delete-confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { setChatInfo } from "@/redux/slices/chatInfo";
import { deleteChatThunk } from "@/redux/slices/conversationSlice";

interface ConversationListPerDayProps {
  label: string;
  data: Thread[];
  token: string | null;
}

interface ConversationListProps {
  token: string | null;
  setScrolled: (arg0: boolean) => void;
}

// TODO: SEND THREAD INFORMATION TO CHAT SCREEN
const ConversationList: React.FC<ConversationListProps> = ({
  token,
  setScrolled,
}) => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 500);

  // Get the current location pathname
  const location = useLocation();
  const currentPathname = location.pathname;
  const parts = currentPathname.split("/");

  const [selectedConversation, setSelectedConversation] =
    React.useState<string>(() => {
      if (parts[parts.length - 1] === "chat") {
        console.log("Current Location is /chat");
        return "";
      }
      return localStorage.getItem("selectedConversation") || "";
    });
  const [selectedTitle, setSelectedTitle] = React.useState<string>("");
  const threadsListRedux = useSelector(
    (state: RootState) => state.conversations.conversationsList
  );
  const [threadsList, setThreadsList] = React.useState<Thread[]>();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmRenameOpen, setConfirmRenameOpen] = useState(false);
  const dispatch = useDispatch();
  const [emptyConversationList, setEmptyConversationList] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getUserThreads();
  }, []);

  const sortThreadsByUpdatedAt = (threads: Thread[]) => {
    return threads.sort((a, b) => {
      const updatedAtA = a.updated_at || a.created_at;
      const updatedAtB = b.updated_at || b.created_at;
      return new Date(updatedAtB).getTime() - new Date(updatedAtA).getTime();
    });
  };

  const handleDelete = (threadId: string) => {
    setIsDeleting(true);
    dispatch(
      deleteChatThunk({
        token: token || "",
        threadId: threadId,
      }) as any
    )
      .then(() => {
        setIsDeleting(false);
        toast({
          title: "Chat Deleted",
          description: "Chat has been deleted successfully",
        });
        setConfirmDialogOpen(false);
        navigate("/chat");
      })
      .catch((error: string) => {
        setIsDeleting(false);
        console.error("Failed to delete chat:", error);
      })
      .finally(() => setIsDeleting(false));
  };

  useEffect(() => {
    if (!location.pathname.includes("chat/c/")) {
      console.log("location.pathname");
      if (selectedConversation) {
        setSelectedConversation("");
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const storedConversation = localStorage.getItem("selectedConversation");
    if (storedConversation !== selectedConversation) {
      console.log("Selected Conversation changed");
      localStorage.setItem("selectedConversation", selectedConversation);
    }
  }, [selectedConversation]);

  const handleConversationClick = (id: string, title: string, agent: any) => {
    if (selectedConversation !== id) {
      console.log("Clicked on conversation with id: ", id);
      setSelectedConversation(id);
      dispatch(
        setChatInfo({
          chatInfo: { isNewChat: false, chatMessage: "", threadId: id },
        })
      );
      navigate(`/chat/c/${id}`, {
        state: { threadId: id, title: title, agent: agent },
      });
    }
  };

  useEffect(() => {
    console.log("ThreasList Redux Changed because");
    if (threadsListRedux?.length > 0) {
      const sortedThreads = sortThreadsByUpdatedAt([...threadsListRedux]);
      setThreadsList(sortedThreads);
    } else {
      setThreadsList([]);
    }
  }, [threadsListRedux]);

  const FilteredConversations = React.useMemo<Thread[]>(() => {
    if (!debouncedSearchTerm) {
      return threadsList
        ? threadsList.map(conv => ({
            ...conv,
            date: conv.created_at || new Date(), // Provide a default date if it's undefined
          }))
        : [];
    }
    return threadsList
      ? threadsList
          .filter(conv =>
            conv.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          )
          .filter(conv => conv.created_at !== undefined)
      : []; // Fallback to an empty array if threadsList is undefined
  }, [debouncedSearchTerm, threadsList]);

  const organizedConversationsData = getFilteredConversations(
    FilteredConversations
  );

  const getUserThreads = async () => {
    try {
      const response = await getAllUserThreads(token ? token : "");
      if (response.success) {
        const threads =
          typeof response.threads === "string"
            ? JSON.parse(response.threads)
            : response.threads;
        dispatch(setConversations([...threads]));
      } else {
        console.error("Failed to get threads list:", response.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const ConversationListPerDay: React.FC<ConversationListPerDayProps> = ({
    label,
    data,
  }) => {
    useEffect(() => {
      if (parts[parts.length - 1] === "chat") {
        setSelectedConversation("");
        return;
      }
      if (parts[parts.length - 1] != "chat")
        return setSelectedConversation(parts[parts.length - 1]);
      else
        setSelectedConversation(
          localStorage.getItem("selectedConversation") || ""
        );
    }, []);

    if (!data || data?.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        <Label className="capitalize text-xs pt-3 pb-2 px-2 text-inactive font-medium">
          {label}
        </Label>
        <ul className="overflow-hidden">
          {data.map((conv: Thread) => (
            <li
              className={`group flex items-center gap-2 cursor-pointer h-9 py-2 px-3 w-[248px] text-inactive hover:text-selected rounded-[10px] text-sm ${
                selectedConversation === conv.id
                  ? "bg-selectedBg"
                  : "hover:bg-hover"
              }`}
              key={conv.id}
              onClick={() =>
                handleConversationClick(conv.id, conv.title, conv.agent)
              }
            >
              <div className="flex items-center justify-center h-5 aspect-square rounded-sm">
                <EchoAvatar
                  size="mini"
                  mainImage={`${conv.agent?.avatar}`}
                  fallbackImage={defAvatar}
                  alt="BM"
                />
              </div>
              <div className="flex items-center w-[200px] justify-between">
                <p
                  className={`${
                    selectedConversation === conv.id ? "text-selected" : ""
                  } truncate`}
                >
                  {conv.title.charAt(0).toUpperCase()}
                  {conv.title && conv.title.length > 22
                    ? `${conv.title.slice(1, 22)}...`
                    : conv.title.slice(1)}
                </p>
                <div
                  className={`flex group-hover:opacity-100 opacity-0  ${
                    selectedConversation === conv.id && "opacity-100"
                  }`}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        className="flex h-5 w-5 p-0 data-[state=open]:bg-muted"
                      >
                        <DotsHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="absolute w-40 h-20 rounded-md -left-5"
                    >
                      <ChatOptionsList
                        setConfirmDialogOpen={setConfirmDialogOpen}
                        setConfirmRenameOpen={setConfirmRenameOpen}
                        setSelectedConversation={setSelectedConversation}
                        setSelectedTitle={setSelectedTitle}
                        conv={conv}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollableRef.current) return;

      const { scrollTop } = scrollableRef.current;
      setScrolled(scrollTop > 0);
    };

    const scrollRef = scrollableRef.current;

    scrollableRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      scrollRef?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (
      organizedConversationsData.today.length == 0 &&
      organizedConversationsData.restOfDays.length == 0 &&
      organizedConversationsData.yesterday.length == 0
    )
      setEmptyConversationList(true);
    else if (emptyConversationList) setEmptyConversationList(false);
  }, [organizedConversationsData]);

  return (
    <div className={`space-y-8`}>
      <ScrollArea
        className="overflow-auto p-4 pt-5 pr-3 small-scrollbar"
        ref={scrollableRef}
        style={{ maxHeight: "calc(100vh - 80px)" }}
      >
        <ChatSearch onChangeValue={e => setSearchTerm(e.target.value)} />

        <div className="w-[full] -mr-1 mt-8">
          {emptyConversationList ? (
            <div className=" text-sm ">
              Start a new chat to create conversations
            </div>
          ) : (
            <div className="space-y-5">
              <ConversationListPerDay
                label="Today"
                data={organizedConversationsData?.today}
                token={token}
              />
              <ConversationListPerDay
                label="Yesterday"
                data={organizedConversationsData?.yesterday}
                token={token}
              />
              <ConversationListPerDay
                label="Before yesterday"
                data={organizedConversationsData?.restOfDays}
                token={token}
              />
            </div>
          )}
        </div>
        <div className="h-20"></div>
      </ScrollArea>
      {confirmDialogOpen && selectedConversation && (
        <DeleteConfirmationDialog
          confirmDialogOpen={confirmDialogOpen}
          setConfirmDialogOpen={setConfirmDialogOpen}
          onHandleDelete={() => handleDelete(selectedConversation)}
          supportingText="the "
          boldText={selectedTitle}
          endingText=" chat"
          textMsg=""
          isLoading={isDeleting} // TODO
        />
      )}
      {confirmRenameOpen && selectedConversation && (
        <ChatRename
          threadId={selectedConversation}
          title={selectedTitle}
          confirmRenameOpen={confirmRenameOpen}
          setConfirmRenameOpen={setConfirmRenameOpen}
        />
      )}
    </div>
  );
};
export default ConversationList;
