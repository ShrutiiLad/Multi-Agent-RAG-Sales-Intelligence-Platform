import React, { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Message, User } from '@/config/models';
import ChatBottombar from '@/components/layout/chat/components/user-input';
import MessageModule from '@/components/layout/chat/components/message';
import { useToast } from '@/components/ui/use-toast';

interface ChatListProps {
  messages: Message[]; // messages should be a required prop to ensure there's always an array to work with
  selectedUser: User;
  sendMessage: (newMessage: Message) => void;
  isMobile: boolean;
}

export function ChatList({ messages, sendMessage, isMobile }: ChatListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const {toast} = useToast();

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (newMessage: Message) => {
    sendMessage(newMessage); // Add user message to the list
    console.log('newMessage', newMessage);
    setTimeout(() => {
      const botMessage: Message = {
        id: newMessage.id + (messages ? messages.length : 0), // Ensure unique ID for the bot message
        content: newMessage.content.split('').reverse().join(''),
        error: true,
        by: 'bot', // Indicates that this message is from the bot
        created_at: '',
        purpose: null,
        tokens: null,
        sources: [],
        files: [],
        thread: null,
        classification: '',
        feedback: null,
      };
      sendMessage(botMessage); // Add bot message to the list after a delay
    }, 1000); // Delay of 1 sec for bot response
  };

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col px-40">
      <div
        ref={messagesContainerRef}
        className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <MessageModule message={message} key={message.id} setReloadMessages={function (): void {
              toast({ title: 'To be implemented', description: 'This feature still needs to be worked on'})
            } } />
          ))}
        </AnimatePresence>
      </div>
      <ChatBottombar
        sendMessage={handleSendMessage}
        isMobile={isMobile}
        disabled={true}
        isLoading={false}
      />
    </div>
  );
}
