// messages.ts

import { Message, Thread } from '@/config/models';
import { API_URL, getHeaders } from '@/services/global_config';
// TODO: Add routed bot's id
export const createUserThread = async (
  message: Message,
  bot_id: string,
  token: string
): Promise<{
  success: boolean;
  thread?: Thread | null;
  error?: string | null;
}> => {

  
  const sendMessage = message.content;
  console.log('sendMessage', sendMessage);
  try {
    const response = await fetch(`${API_URL}chat/threads/create/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        bot_id: bot_id,
        content: sendMessage,
        images: message.images
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('DATA', data);
    return {
      success:true,
      thread: data,
    };
  } catch (error) {
    console.error('Failed to create user thread:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success:false,
      error: errorMessage,
    };
  }
};

export const getHistoryMessagesByThread = async (
  threadId: string,
  token: string
): Promise<Message[] | { success: boolean; error: string }> => {
  try {
    const response = await fetch(
      `${API_URL}chat/threads/${threadId}/messages/`,
      {
        method: 'GET',
        headers: getHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to create user thread:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
};
