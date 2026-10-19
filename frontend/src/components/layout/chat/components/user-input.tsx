import React, { useRef, useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Message, Img } from "@/config/models";
import "@/index.css";
import ActiveSend from "@/assets/ActiveSend.svg";
import DefaultSend from "@/assets/DefaultSend.svg";
import { Spinner } from "@/components/ui/spinner";
import Attachment from "@/components/layout/chat/components/attachments";
import AttachmentInput from "@/components/layout/chat/components/attachment-input";
import { useAutosizeTextArea } from "@/hooks/useAutosizeTextArea";
import { useLocation } from "react-router-dom";

interface ChatBottombarProps {
  sendMessage: (newMessage: Message) => void;
  isMobile: boolean;
  disabled: boolean;
  isLoading: boolean;
  handleMessageInputChange?: (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  agent?: any | null;
}

export default function ChatBottombar({
  sendMessage,
  handleMessageInputChange, // Destructure onTyping prop
  isLoading,
  agent,
}: ChatBottombarProps) {
  const [message, setMessage] = useState("");
  const [isBotReplying, setIsBotReplying] = useState(false); // State to track if the bot is replying
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const deletedBot = agent?.deleted;
  const [selectedFiles, setSelectedFile] = useState<Img[]>([]);
  const location = useLocation();

  useEffect(() => {
    // on location changes clear the message in input
    setMessage("");
    setSelectedFile([]);
  }, [location.pathname]);

  // Autosize the textarea
  const messageTextAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea("message", messageTextAreaRef.current, message || "");

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    if (handleMessageInputChange) {
      handleMessageInputChange(event); // Call handleMessageInputChange if it exists
    }
  };

  const handleSend = () => {
    console.log("Send message: ", selectedFiles);
    if (message.trim() && !isBotReplying) {
      const newMessage: Message = {
        id: (message.length + 1).toString(),
        by: "user",
        error: false,
        content: message.trim(),
        created_at: new Date().toISOString(),
        purpose: null,
        tokens: null,
        files: selectedFiles,
        sources: [],
        thread: null,
        classification: "",
        feedback: null,
      };
      sendMessage(newMessage);
      setSelectedFile([]);
      setMessage("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
      setIsBotReplying(true);
      // Reset isBotReplying state after a delay
      setTimeout(() => {
        setIsBotReplying(false);
      }, 6000); // Adjust the delay as needed
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      if (isLoading) return;
      event.preventDefault();
      handleSend();
    }

    // if (event.key === "Enter" && event.shiftKey) {
    //   event.preventDefault();
    //   setMessage(prev => prev + "\n");
    // }
  };

  useEffect(() => {
    if (!isBotReplying) {
      // Reset bot replying status after a delay
      const timeout = setTimeout(() => {
        setIsBotReplying(false);
      }, 2000); // Adjust the delay as needed
      return () => clearTimeout(timeout);
    }
  }, [isBotReplying]);


  return (
    <div className="w-[766px] mb-8 rounded-10 medium-border p-3 pr-0 ">
      {selectedFiles && selectedFiles.length > 0 && (
        <Attachment
          attachments={selectedFiles}
          setAttachments={setSelectedFile}
        />
      )}

      <div className="relative flex justify-between  items-end  gap-2 ">
        <AttachmentInput
          agentName={agent?.name}
          selectedFile={selectedFiles}
          setSelectedFile={setSelectedFile}
        />

        <Textarea
          id="message"
          autoComplete="on"
          value={message}
          ref={messageTextAreaRef}
          onKeyDown={handleKeyPress}
          onChange={handleInputChange}
          name="message"
          placeholder={
            deletedBot ? "Agent was Deleted" : isLoading ? "" : "Chat With Blueberry"
          }
          className="w-full rounded-sm max-h-[240px] h-[20px] resize-none flex justify-center text-sm text-selected shadow-none p-0 pr-9 m-0"
          disabled={deletedBot} // Disable textarea while bot is replying
        ></Textarea>
        {!deletedBot && (
          <div className="h-6 w-6 absolute right-3 flex items-center justify-center">
            {isLoading ? (
              // <Icons.spinner className="text-inactive h-4 w-4 animate-spin spinner" />
              <Spinner className="text-inactive h-4 w-4" />
            ) : (
              <img
                src={message == "" ? DefaultSend : ActiveSend}
                className={`cursor-pointer ${isBotReplying ? "opacity-50 pointer-events-none" : ""
                  } `}
                alt="Send"
                onClick={handleSend}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
