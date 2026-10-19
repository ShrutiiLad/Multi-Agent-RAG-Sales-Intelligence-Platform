import { useEffect, useState } from "react";
import { Message, Document } from "@/config/models";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Dot,
  Square,
  ThumbsDown,
  ThumbsUp,
  Zap,
} from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSelector } from "react-redux";
import { RootState, useLazyFetchDocumentByIdQuery } from "@/redux/store";
import { ContentLibraryForm } from "@/components/helpers/form/content-library-form";
import ChatFeedbackModal from "@/components/layout/chat/components/chat-feedback-modal";
import defUser from "@/assets/avatar/defUser.png";
import defAvatar from "@/assets/avatar/avatar-48/1.svg";
import ArrowDocument from "@/assets/arrowDocument.svg";
import { Spinner } from "@/components/ui/spinner";
import EchoAvatar from "@/components/layout/dashboard/components/avatar";
import FilledThumbsDown from "@/assets/filledThumbsDown.svg";
import FilledThumbsUp from "@/assets/filledThumbsUp.svg";
import { useToast } from "@/components/ui/use-toast";
import { deleteFeedbackById } from "@/services/chat/feedback";
import AttachmentViewer from "@/components/layout/chat/components/attachment-viewer";
import { format } from "date-fns";
// TODO
interface MessageModuleProps {
  message: Message;
  isLoading?: boolean;
  handleRetryMessage?: (id: number) => void;
  setReloadMessages: React.Dispatch<React.SetStateAction<boolean | null>>;
  id?: number;
  agent?: any;
}

const MessageModule: React.FC<MessageModuleProps> = ({
  message,
  isLoading = true,
  handleRetryMessage,
  setReloadMessages,
  id,
  agent,
}) => {
  const [showLoader, setShowLoader] = useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [modalFeedback, setModalFeedback] = React.useState<boolean | null>(
    null
  );
  const [isResendingMessage, setResendingMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user) || null;
  const { toast } = useToast();
  const [loadingSourceId, setLoadingSourceId] = useState<string | null>(null);

  const [
    getDocumentDetails,
    {
      isFetching: isDocumentLoading,
      isError: isDocumentError,
      data: documentDetails,
    },
  ] = useLazyFetchDocumentByIdQuery();

  const [documentData, setDocumentData] = React.useState<Document>({
    id: "",
    title: "",
    description: "",
    source: "",
    summary: "",
    url: "",
    author: "",
    category: "",
    created_at: "",
    published_at: "",
    type: "",
    strength: "",
    project: "",
    location: "",
    associated_with: [],
  });
  // TODO: Fix the local time shown.
  //const currentTime = new Date();
  //const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [formattedTime, setFormattedTime] = useState<JSX.Element>(<></>);
  const [date, setDate] = useState("");
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const date = format(message.created_at, "dd MMM, yyyy");
    const time = format(message.created_at, "h:mm a");
    setFormattedTime(
      <div className="flex flex-row items-center space-x-1">
        <div>{date}</div>
        <span className="w-0.5 h-0.5 bg-inactive rounded-full"></span>
        <div>{time}</div>
      </div>
    );
  }, [message.created_at]);

  useEffect(() => {
    setShowLoader(isLoading || false);
  }, [isLoading]);

  useEffect(() => {
    const date = new Date(message.created_at);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);
    setDate(formattedDate);
  }, [message.created_at]);

  useEffect(() => {
    if (message?.error) setErrorMessage(true);
  }, [message]);

  const handleDeleteFeedback = async () => {
    const id = message.feedback?.id || "";
    const { success, error } = await deleteFeedbackById(id, token || "");
    if (success) {
      setReloadMessages(reload => !reload);
    }
    toast({
      variant: success ? "default" : "destructive",
      description: success ? "Feedback Removed" : error,
    });
  };

  const updateDocumentDetails = () => {
    setShowForm(true);
    setDocumentData({
      id: documentDetails?.id || "",
      title: documentDetails?.title || "",
      description: documentDetails?.summary || "",
      source: documentDetails?.source || "",
      summary: documentDetails?.summary || "",
      url: documentDetails?.url || "",
      author: documentDetails?.author || "",
      category: documentDetails?.category || "",
      created_at: documentDetails?.created_at || "",
      published_at: documentDetails?.published_at || "",
      type: documentDetails?.type || "",
      strength: documentDetails?.strength || "",
    });
  };

  useEffect(() => {
    if (isDocumentLoading) return;
    if (documentDetails) updateDocumentDetails();
  }, [isDocumentLoading]);

  useEffect(() => {
    if (isDocumentError) {
      toast({
        variant: "destructive",
        description: "Unable to fetch document details",
      });
    }
  }, [isDocumentError]);

  const handleGetDocumentDetails = async (docId: string) => {
    console.log("Document ID: ", docId);
    setLoadingSourceId(docId);
    getDocumentDetails(docId || "");
  };

  function handleRetry() {
    setResendingMessage(true);
    if (handleRetryMessage && id !== undefined) {
      handleRetryMessage(id);
    } else {
      console.error("handleRetryMessage is undefined or id is undefined");
    }
  }

  function handleClose() {
    setShowFeedbackModal(false);
  }

  return (
    <div className="flex gap-3 mt-6">
      <div className="flex flex-row space-x-3 px-3">
        {/* CHANGE THIS FOR STAIC FOR BOT AND ECHO */}
        <div className={cn("items-center justify-center h-6 w-6 mt-1")}>
          {message?.by == "user" ? (
            <EchoAvatar
              size="small"
              mainImage={user?.profile?.avatar || ""}
              initialsFallback={user?.profile?.avatar ? "" : user?.username}
              fallbackImage={defUser}
              alt="User"
            />
          ) : (
            <EchoAvatar
              size="small"
              mainImage={`${agent?.avatar}`}
              fallbackImage={defAvatar}
              alt="User"
            />
          )}
        </div>
        <div className="flex flex-col w-[714px]">
          <div className="flex flex-row items-center space-x-2">
            <span className="text-[13px] font-semibold text-selected">
              {message?.by == "user" ? "You" : agent?.name}
            </span>
            {errorMessage ? (
              ""
            ) : (
              <span className="w-0.5 h-0.5 bg-inactive rounded-full"></span>
            )}
            <span className="text-[13px] text-inactive">
              {errorMessage ? "" : formattedTime}
            </span>
          </div>

          {message.by === "bot" && showLoader ? (
            <div className="flex justify-center mt-4 mr-20">
              <div className="loader">
                {/* <Icons.spinner className="mr-2 h-4 w-4 animate-spin spinner absolute ml-2" /> */}
              </div>
              {/* loading spinner */}
            </div>
          ) : (
            !errorMessage && (
              <div>
                <ReactMarkdown
                  className="text-selected text-sm prose max-w-full"
                  remarkPlugins={[remarkGfm]}
                >
                  {message?.content}
                </ReactMarkdown>
                {Array.isArray(message.files) && message.files.length > 0 && (
                  <div className="flex-col my-2">
                    <span className="block text-supportCol my-1 text-[13px]">
                      Attachments
                    </span>
                    <div className="grid grid-cols-4 gap-3 w-[560px]">
                      {Array.isArray(message.files) &&
                        message.files.length > 0 &&
                        message.files.map(file => (
                          <AttachmentViewer
                            attachment={file.link || file.file}
                            customSize={"extra-large"}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )
            // <span>{message?.message}</span>
          )}
          {message.by !== "user" && !showLoader && (
            <>
              {errorMessage ? (
                <div className="flex items-center text-sm">
                  <p className="text-white">
                    {!isResendingMessage && (
                      <AlertCircle className="fill-supportCol pt-1" />
                    )}
                  </p>
                  <p className="text-supportCol mr-1">
                    {isResendingMessage
                      ? "[Loading message...]"
                      : "[An Error occurred...]"}
                  </p>
                  <button
                    className=" font-semibold text-selected "
                    onClick={handleRetry}
                    disabled={isResendingMessage}
                  >
                    {!isResendingMessage && "Retry"}
                    {isResendingMessage && (
                      // <Icons.spinner className="text-inactive h-4 w-4 animate-spin spinner" />
                      <Spinner className="text-inactive h-4 w-4" />
                    )}
                  </button>
                </div>
              ) : (
                <>
                  {Array.isArray(message.sources) &&
                    message.sources.length > 0 && (
                      <div className="flex-col">
                        <span className="block text-supportCol mt-3 text-[13px]">
                          Sources
                        </span>
                        <TooltipProvider>
                          <div className="grid grid-cols-4 gap-3 mt-2 mb-3">
                            {Array.isArray(message.sources) &&
                              message.sources.length > 0 &&
                              message.sources.map(data => (
                                <div
                                  key={data.id}
                                  onClick={() =>
                                    handleGetDocumentDetails(data.id)
                                  }
                                  className="py-1 px-2 bg-[#F8F8F8] flex items-center gap-1 rounded-xl hover:border-[#D4D4D4] border-2 border-transparent cursor-pointer"
                                >
                                  {/* <img
                                    src="/src/assets/arrowDocument.svg"
                                    alt=""
                                    className="w-8 h-8"
                                  /> */}
                                  {loadingSourceId === data.id &&
                                  isDocumentLoading ? (
                                    <Spinner className="text-inactive h-6 w-6 mr-1" />
                                  ) : (
                                    <EchoAvatar
                                      size="medium"
                                      mainImage=""
                                      alt="Document"
                                      fallbackImage={ArrowDocument}
                                    />
                                  )}
                                  <Tooltip>
                                    <TooltipTrigger className="text-[13px] underline underline-offset-8 w-[136px] h-[32px] truncate">
                                      {data.title}
                                    </TooltipTrigger>
                                    <TooltipContent className="flex-col items-center w-[224px] h-[120px] mr-10 mb-3 p-3">
                                      <div className=" w-full bg-white text-left">
                                        <p className="text-selected text-[13px] h-[60px] overflow-hidden">
                                          {data.description}
                                        </p>
                                        <Separator className="my-2" />
                                        <div className="flex items-center justify-center text-supportCol">
                                          <p className="flex items-center gap-1 text-xs">
                                            {data.strength === "" && (
                                              <Zap className="fill-supportCol text-supportCol h-3.5 w-3.5" />
                                            )}
                                            {data.strength === "3" && (
                                              <Zap className="h-3.5 w-3.5 text-supportCol" />
                                            )}
                                            {data.strength === "2" && (
                                              <Square className="fill-supportCol text-supportCol h-3.5 w-3.5" />
                                            )}
                                            {data.strength !== "2" &&
                                              data.strength !== "3" &&
                                              data.strength !== "4" && (
                                                <Square className="text-supportCol h-3.5 w-3.5" />
                                              )}
                                            {data.strength === "4"
                                              ? "Very High"
                                              : data.strength === "3"
                                              ? "High"
                                              : data.strength === "2"
                                              ? "Low"
                                              : "Very low"}
                                          </p>
                                          <Dot className="h-3 w-3 mx-2" />
                                          <p className="text-xs">{date}</p>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              ))}
                          </div>
                        </TooltipProvider>
                      </div>
                    )}
                  {agent?.deleted || (
                    <div className="flex items-center space-x-2 pt-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {message.feedback?.positive === true ? (
                              <img
                                src={FilledThumbsUp}
                                alt=""
                                className="h-3.5 w-3.5"
                                onClick={handleDeleteFeedback}
                              />
                            ) : (
                              <ThumbsUp
                                className="text-supportCol h-3.5 w-3.5 hover:text-selected"
                                onClick={() => {
                                  setModalFeedback(true);
                                  setShowFeedbackModal(true);
                                }}
                              />
                            )}
                          </TooltipTrigger>
                          <TooltipContent className="bg-selected text-white">
                            <p>Good response</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {message.feedback?.positive === false ? (
                              <img
                                src={FilledThumbsDown}
                                alt=""
                                className="h-3.5 w-3.5"
                                onClick={handleDeleteFeedback}
                              />
                            ) : (
                              <ThumbsDown
                                className="text-supportCol h-3.5 w-3.5 hover:text-selected"
                                onClick={() => {
                                  setModalFeedback(false);
                                  setShowFeedbackModal(true);
                                }}
                              />
                            )}
                          </TooltipTrigger>
                          <TooltipContent className="bg-selected text-white">
                            <p>Bad response</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <ContentLibraryForm
        canEdit={false}
        displayLibraryForm={showForm}
        setDisplayLibraryForm={setShowForm}
        closeBothDialogs={() => setShowForm}
        documentLoadedData={documentData}
        isLoading={isDocumentLoading}
      />
      <ChatFeedbackModal
        displayFeedbackModal={showFeedbackModal}
        onDisplayFeedbackModal={() => setShowFeedbackModal(false)}
        messageId={message?.id}
        feedbackId={message?.feedback?.id || ""}
        handleClose={handleClose}
        setReloadMessages={setReloadMessages}
        typeOfFeedback={modalFeedback}
      />
    </div>
  );
};
export default MessageModule;
