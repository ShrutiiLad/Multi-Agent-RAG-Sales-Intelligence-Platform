import React, { useRef, useEffect, useState, useCallback } from "react";
import { Message } from "@/config/models";
import { useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { WebSocketMessage } from "react-use-websocket/dist/lib/types";
import { getHistoryMessagesByThread } from "@/services/chat/messages";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setMessages } from "@/redux/slices/messagesSlice";
import { WEBSOCKET_URL } from "@/services/global_config";
import MessageModule from "@/components/layout/chat/components/message";
import ChatBottombar from "@/components/layout/chat/components/user-input";
import ChatTopBar from "@/components/layout/chat/chat-topbar";
import { Zap } from "lucide-react";
import PreMessageModule from "@/components/layout/chat/components/pre-message";
import { Spinner } from "@/components/ui/spinner";

interface ChatProps {
  messages?: Message[];
}

// type MessageGroup = Message[];
// type MessageGroupsByDate = MessageGroup[];
// TODO: SEPERATE THE COMPONENT INTO SMALLER COMPONENTS TO MAKE IT MORE READABLE AND EASIER TO MAINTAI.
// TODO: SEPERATE BUSINESS LOGIC FROM THE COMPONENT
// TODO: MAKE THE BUSINESS LOGIC FOR FUNCTION/CLASS DRIVEN, MODULAR AND REUSABLE
export default function ChatScreen({ messages }: ChatProps) {
  // TODO:  MOVE IMPORTANT FUNCTIONS SUCH AS WEBSOCKET CONNECTIONS/SENDING AND RECEIVING MESSAGE OUTSIDE OF THE COMPONENT, KEEP THE PAGE CLEAN AND TO AVOID RE-CREATION OF CONNECTIONS ON EVERY RENDER
  // ALSO, USE THE useEffect HOOK TO HANDLE SIDE EFFECTS
  const location = useLocation();

  const currentThreadId = location.state?.threadId || null;

  const conversations = useSelector(
    (state: RootState) => state.conversations.conversationsList
  );

  const title =
    conversations.find(conv => conv.id === currentThreadId)?.title || "";

  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false); // New state to track initial message processing
  const initialMessage = location.state?.initialMessage;
  //causing errors on npm run build
  const [_, setWebSocketReady] = useState(false);
  const [messagesState, setMessagesState] = React.useState<Message[]>(
    messages ?? initialMessage ?? []
  );
  const [preMessage, setPreMessage] = React.useState<string>("");
  const [isLoadingOldMessages, setIsLoadingOldMessages] = React.useState(false);
  const [showPreMessage, setShowPreMessage] = React.useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadInitialMessage = useRef(false);
  const agent = location.state?.agent;

  const dispatch = useDispatch();
  /* const messageHistory = useSelector((state: RootState) => state.messages);
  const chatGeneralInfo = useSelector((state: RootState) => state.chatInfo); */
  const [errorLoading, setErrorLoading] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const isNewChat = useSelector(
    (state: RootState) => state.chatInfo.chatInfo.isNewChat
  );
  const threadIdRedux = useSelector(
    (state: RootState) => state.chatInfo.chatInfo.threadId
  );

  const isDeletedAgent = agent?.deleted;

  const { sendMessage, lastMessage } = useWebSocket(
    `${WEBSOCKET_URL}${currentThreadId}/`,
    {
      shouldReconnect: () => (isDeletedAgent ? false : true),
      onOpen: () => setWebSocketReady(true),
      onClose: () => setWebSocketReady(false),
    }
  );

  useEffect(() => {
    if (currentThreadId) {
      setInitialMessageProcessed(false);
      setWebSocketReady(false);
      setMessagesState(messages ?? initialMessage ?? []);
      setPreMessage("");
      setIsLoadingOldMessages(false);
      setShowPreMessage(false);
      setIsProcessing(false);
      setErrorLoading(false);
    }
  }, [currentThreadId]);

  const getMessagesHistory = useCallback(
    async (thread_id: string) => {
      try {
        const response = await getHistoryMessagesByThread(
          thread_id,
          token ? token : ""
        );
        if ("success" in response && response.success === false) {
          setErrorLoading(true);
        } else {
          setErrorLoading(false);
        }
        return response;
      } catch (error) {
        setErrorLoading(true);
        console.error("Network error:", error);
      }
    },
    [token]
  );

  const getnSetMessagesHistory = useCallback(
    async (isReload = true) => {
      isReload && setIsLoadingOldMessages(true);
      getMessagesHistory(currentThreadId).then(resp => {
        dispatch(
          setMessages([
            {
              id: currentThreadId,
              conversations: [...(Array.isArray(resp) ? resp : [])],
            },
          ])
        );
        if (resp && Array.isArray(resp)) {
          const oldMessages = createMessagesList(resp);
          if (oldMessages && oldMessages.length > 0) {
            setMessagesState([...oldMessages]);
          }
        }
        setIsLoadingOldMessages(false);
      });
    },
    [currentThreadId, dispatch, getMessagesHistory]
  );

  const startNewChat = useCallback(() => {
    if (isDeletedAgent) return;
    if (initialMessageProcessed === false) {
      setInitialMessageProcessed(prevState => !prevState);
      if (!loadInitialMessage.current) {
        sendMessage(
          JSON.stringify({
            content: initialMessage.content,
            imageUrls: initialMessage.imageUrls,
          })
        );
        loadInitialMessage.current = true;
      }
      !initialMessageProcessed && setMessagesState([initialMessage]);
    }
  }, [initialMessage, initialMessageProcessed, sendMessage]);

  const [reloadMessages, setReloadMessages] = useState<boolean | null>(null);

  useEffect(() => {
    initialMessage && setMessagesState(initialMessage);
  }, [initialMessage]);

  useEffect(() => {
    if (isNewChat) {
      startNewChat();
      setIsProcessing(true);
    } else {
      getnSetMessagesHistory();
    }
  }, [getnSetMessagesHistory, isNewChat, startNewChat, threadIdRedux]);

  useEffect(() => {
    if (reloadMessages !== null && (!isNewChat || messagesState?.length))
      getnSetMessagesHistory(false);
  }, [reloadMessages, isNewChat]);

  /* const __isOld__ = (messageHistory: any, currentThreadId: string) => {
    return Object.values(messageHistory).includes(currentThreadId);
  }; */

  /* useEffect(() => {
    getnSetMessagesHistory(__isOld__(messageHistory, currentThreadId));
  }, [currentThreadId, dispatch]); */ //DO NOT add more dependencies

  const createMessagesList = (messages: Message[]) => {
    const response: Message[] = [];
    messages.map(item =>
      response.push({
        id: item.id,
        content: item.content,
        by: item.by === "user" || item.by === "bot" ? item.by : "bot",
        created_at: item.created_at,
        error: false,
        purpose: item.purpose,
        tokens: item.tokens,
        sources: item.sources,
        files: item.files,
        thread: item.thread,
        classification: item.classification,
        feedback: item.feedback,
      })
    );

    return response;
  };

  const handleWebSocketMessage = useCallback((messageData: string) => {
    try {
      if (isDeletedAgent) return;
      const data = JSON.parse(messageData);
      if (data !== null) {
        if (typeof data === "object") {
          setMessagesState(currentMessages => [...currentMessages, data]);
          setPreMessage("");
          setIsProcessing(false);
          setShowPreMessage(false);
        } else if (typeof data === "string") {
          setPreMessage(prev => prev + data);
          setIsProcessing(true);
          setShowPreMessage(true);
        }
      }
    } catch (error) {
      console.error("Error parsing message data:", error);
    }
  }, []);

  useEffect(() => {
    if (lastMessage !== null) {
      handleWebSocketMessage(lastMessage.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]); //DO NOT add more dependencies

  //TODO NOTE: No need to add any other dependencies to the useEffects below
  // Open the last message by default
  useEffect(() => {
    const scrollToBottom = () => {
      const lastMessageContainer =
        messagesContainerRef.current?.lastElementChild;
      if (lastMessageContainer && !isUserScrolling) {
        lastMessageContainer.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    };
    scrollToBottom();
    setIsUserScrolling(false);
  }, [messagesState]);

  const handleScroll = event => {
    const isMouseWheelScroll = event.deltaY !== 0;
    if (isMouseWheelScroll) {
      setIsUserScrolling(true);
    } else {
      setIsUserScrolling(false);
    }
  };

  // Remove this piece of code from the global scope and use an effect if necessary, executing it once after messages load.
  useEffect(() => {
    const lastMessageContainer = messagesContainerRef.current?.lastElementChild;
    if (lastMessageContainer && !isUserScrolling) {
      lastMessageContainer.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [preMessage]);

  const handleClickSendMessage = React.useCallback(
    (newMessage: Message) => {
      if (isDeletedAgent) return;
      const webSocketMessage: WebSocketMessage = JSON.stringify({
        content: newMessage.content,
        imageUrls: newMessage.files?.map(image => image.link) || [],
      });
      setIsProcessing(true); // Start processing
      sendMessage(webSocketMessage);
      setMessagesState(currentMessages => [...currentMessages, newMessage]);
    },
    [sendMessage]
  );

  const handleRetryMessage = (id: unknown) => {
    const message = messagesState.find(item => item.id === id);
    messagesState.pop();
    if (message) handleClickSendMessage(message);
  };

  // const renderMessages = () => {
  //   const messageGroups = groupMessagesByDate(messagesState) as MessageGroupsByDate;
  //   // messageGroups = messageGroups.reverse();
  //   return messageGroups.map((group: MessageGroup, index: number) => {
  //     const messageDate = new Date(group[0].created_at);
  //     const formattedDate = getFormattedDate(messageDate);

  //     return (
  //       <div key={index}>
  //         <div className="text-center text-xs text-gray-500 py-2">
  //           {formattedDate}
  //         </div>
  //         {group.map((message, key) => (
  //           <MessageModule
  //             key={key}
  //             message={message}
  //             isLoading={false}
  //             handleRetryMessage={handleRetryMessage}
  //             setReloadMessages={setReloadMessages}
  //             id={key}
  //             agent={agent}
  //           />
  //         ))}
  //       </div>
  //     );
  //   });
  // };

  // const groupMessagesByDate = (messages) => {
  //   const groups = {};
  //   messages.forEach((message) => {
  //     const messageDate = new Date(message.created_at).toLocaleDateString();
  //     groups[messageDate] = groups[messageDate] || [];
  //     groups[messageDate].push(message);
  //   });
  //   return Object.values(groups);
  // };

  // const getFormattedDate = (date: any) => {
  //   const today = new Date();
  //   const yesterday = new Date(today);
  //   yesterday.setDate(yesterday.getDate() - 1);

  //   // if (date.toDateString() === today.toDateString()) {
  //   //   return "Today";
  //   // } else if (date.toDateString() === yesterday.toDateString()) {
  //   //   return "Yesterday";
  //   // } else {
  //   return date.toLocaleDateString();
  //   // }
  // };

  return (
    // TODO: Pass thread object to ChatTopBar
    <div className="flex flex-col justify-between w-full h-full overflow-hidden rounded-tl-[10px] bg-white">
      <ChatTopBar
        agent={agent}
        token={token || ""}
        threadId={currentThreadId}
        title={title || ""}
      />
      <div className="w-full items-center overflow-auto h-full flex flex-col mx-auto">
        {errorLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center">
              <Zap size={50} color="var(--danger)" />
              <h1 className="text-lg font-semibold text-inactive mt-4">
                An error occurred while loading messages
              </h1>
            </div>
            <button
              onClick={() => {
                getnSetMessagesHistory();
              }}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-md"
            >
              Retry
            </button>
          </div>
        ) : isLoadingOldMessages ? (
          <div className="hide-webkit-scrollbar w-full overflow-y-auto h-full flex flex-col pr-4 mb-[28px] mt-2 items-center justify-center">
            {/* <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> */}
            <Spinner className="mr-2 h-10 w-10 text-inactive" size="large" />
          </div>
        ) : (
          <div
            ref={messagesContainerRef}
            onWheel={handleScroll}
            className="w-full items-center overflow-y-auto h-full flex flex-col pb-[28px]"
          >
            {messagesState.length > 1 &&
              messagesState
                ?.slice(0, messagesState.length - 1)
                .map((message, key) => (
                  <div
                    className="items-center w-[766px]"
                    key={message.id + message.feedback?.id}
                  >
                    <MessageModule
                      message={message}
                      isLoading={false}
                      handleRetryMessage={handleRetryMessage}
                      setReloadMessages={setReloadMessages}
                      id={key}
                      agent={agent}
                    />
                  </div>
                ))}
            {/* <div ref={messagesContainerRef}>{renderMessages()}</div> */}
            {messagesState.length > 0 &&
              messagesState?.slice(-1).map((message, key) => (
                <div
                  className="items-center w-[766px]"
                  key={message.id + message.feedback?.id}
                >
                  {showPreMessage && (
                    <MessageModule
                      message={message}
                      isLoading={false}
                      handleRetryMessage={handleRetryMessage}
                      setReloadMessages={setReloadMessages}
                      id={key}
                      agent={agent}
                    />
                  )}
                  {showPreMessage ? (
                    <PreMessageModule message={preMessage} agent={agent} />
                  ) : (
                    <>
                      <MessageModule
                        key={message.id + message.feedback?.id}
                        message={message}
                        isLoading={false}
                        handleRetryMessage={handleRetryMessage}
                        setReloadMessages={setReloadMessages}
                        id={key}
                        agent={agent}
                      />
                    </>
                  )}
                </div>
              ))}
            {isProcessing && preMessage === "" && (
              <PreMessageModule
                message={preMessage}
                agent={agent}
                showSpinner={true}
              />
            )}
          </div>
        )}
        <ChatBottombar
          isLoading={isProcessing}
          sendMessage={handleClickSendMessage}
          isMobile={false}
          disabled={isProcessing || errorLoading}
          agent={agent}
        />
      </div>
    </div>
  );
}
