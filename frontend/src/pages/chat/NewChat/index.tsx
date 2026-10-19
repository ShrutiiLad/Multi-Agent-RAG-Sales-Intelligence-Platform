import { Message } from "@/config/models";
import ChatBottombar from "@/components/layout/chat/components/user-input";
import { createUserThread } from "@/services/chat/messages"; // Assuming you have an API service
import { useNavigate } from "react-router-dom";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
// import { Button } from "@/components/ui/button";
// import { Edit2Icon, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
// import TooltipHelper from "@/components/helpers/tooltip-helper";
import React, { useState } from "react";
import { setConversations } from "@/redux/slices/conversationSlice";
import ChatTopBar from "@/components/layout/chat/chat-topbar";
import defAvatar from "@/assets/avatar/avatar-48/1.svg";
import defUser from "@/assets/avatar/defUser.png";
import { setChatInfo } from "@/redux/slices/chatInfo";
import MessageModule from "@/components/layout/chat/components/message";
import EchoAvatar from "@/components/layout/dashboard/components/avatar";
import { useToast } from "@/components/ui/use-toast";

export default function NewChatScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedBot = useSelector(
    (state: RootState) => state.model.selectedBot
  );
  const threadsListRedux = useSelector(
    (state: RootState) => state.conversations.conversationsList
  );

  //const [setThreadsList] = React.useState<Thread[]>();
  const token = useSelector((state: RootState) => state.auth.token);
  const questions = selectedBot?.questions || [];
  const [initialMessage, setInitialMessage] = React.useState<Message>();
  const [showInitialMessage, setShowInitialMessage] =
    React.useState<boolean>(false);
  const [reloadMessages, setReloadMessages] = useState<boolean | null>(null);

  const [_, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.auth.user) || null;
  const { toast } = useToast();

  const handleSendMessage = async (newMessage: Message) => {
    setIsLoading(true);
    setInitialMessage(newMessage);
    setShowInitialMessage(true);
    dispatch(
      setChatInfo({
        chatInfo: { isNewChat: true, chatMessage: newMessage.content },
      })
    );
    try {
      if (selectedBot) {
        const response = await createUserThread(
          newMessage,
          selectedBot.id,
          token ? token : ""
        );
        console.log("RESPONSE FOR CREATING A NEW USER THREAD", response);
        if (response.success && response.thread) {
          localStorage.setItem("selectedConversation", response.thread?.id);
          navigate(`/chat/c/${response.thread?.id}`, {
            state: {
              initialMessage: newMessage,
              threadId: response.thread?.id,
              title: response.thread?.title,
              agent: response.thread?.agent,
            },
          });
          dispatch(setConversations([response.thread, ...threadsListRedux]));
          setShowInitialMessage(false);
          setInitialMessage(undefined);
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to send message",
          });
          console.error("Failed to send message:", response.error);
        }
      } else {
        console.error("selectedBot is null");
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessage(event.target.value);
  };

  return (
    <div className="flex flex-col justify-between w-full h-full overflow-hidden rounded-tl-[10px] bg-white">
      <ChatTopBar agent={selectedBot} token={token || ""} />
      <div className="w-full items-center overflow-auto h-full flex flex-col mx-auto">
        <div className="w-full items-center overflow-y-auto h-full flex flex-col pb-[28px]">
          <div className="items-center w-[766px]">
            {showInitialMessage && initialMessage && (
              <MessageModule
                key={initialMessage?.id}
                message={initialMessage}
                setReloadMessages={setReloadMessages}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 w-[766px] flex flex-col mx-auto">
        {/* {selectedBotCard()} */}
        {questionsModule(selectedBot)}
        <ChatBottombar
          isLoading={isLoading}
          sendMessage={handleSendMessage}
          isMobile={false}
          disabled={false}
          agent={selectedBot}
          handleMessageInputChange={handleMessageInputChange}
        />
      </div>
    </div>
  );

  function questionsModule(agent: any | null) {
    return (
      <div className="mb-4 py-3">
        <div className="flex flex-col gap-1">
          {questions
            ?.slice(0, 4)
            .map((question, index) =>
              questionCard(index, question.question, agent)
            )}
        </div>
      </div>
    );
  }

  function questionCard(index: number, question: string, agent: any | null) {
    return (
      <div
        key={index}
        onClick={() => {
          console.log("question", question);
          if (question)
            handleSendMessage({
              by: "user",
              content: question.trim(),
              id: "",
              created_at: new Date().toISOString(),
              purpose: "",
              tokens: 0,
              sources: [],
              files: [],
              thread: "",
              classification: "",
              feedback: null,
              error: null,
            });
        }}
      >
        <Card
          className=" bg-selectedBg  px-3 py-2 rounded-10 cursor-pointer border-0 drop-shadow-none inline-block"
          key={index}
        >
          <CardContent className="p-0 h-6 flex items-center justify-center">
            <div className="flex items-center relative mr-6">
              <div className="flex items-center justify-center h-5 w-5">
                <EchoAvatar
                  size="mini"
                  mainImage={`${agent?.avatar}`}
                  fallbackImage={defAvatar}
                  alt="Bot"
                />
              </div>
              <div className="flex absolute left-[10px] items-center justify-center h-6 w-6 shadow-inner">
                <EchoAvatar
                  size="small"
                  mainImage={user?.profile?.avatar || ""}
                  initialsFallback={user?.profile?.avatar ? "" : user?.username}
                  fallbackImage={defUser}
                  alt="User"
                />
              </div>
            </div>
            <span className="text-sm font-medium text-selected">
              {question}
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }
}
