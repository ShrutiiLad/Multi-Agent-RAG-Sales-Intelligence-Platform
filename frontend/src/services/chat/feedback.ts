import { API_URL, getHeaders } from '@/services/global_config';

export const createMessageFeedback = async (
  chatFeedback: {
    feedback?: string;
    positive: boolean | null;
    message_id: string;
  },
  token: string
): Promise<{
  success: boolean;
  data?: {
    id: string;
    feedback: string;
    created_at: string;
    category: string;
    positive: boolean;
  };
  error?: string | null;
}> => {
  try {
    const response = await fetch(`${API_URL}chat/feedback/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ ...chatFeedback }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return {
      ...data,
    };
  } catch (error) {
    console.error('Failed to send chat feedback:', error);
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

export const updateMessageFeedback = async (
  chatFeedback: {
    feedback?: string;
    positive: boolean | null;
  },
  feedback_id: string,
  token: string
): Promise<{
  success: boolean;
  data?: {
    id: string;
    feedback: string;
    created_at: string;
    category: string;
    positive: boolean;
  };
  error?: string | null;
}> => {
  try {
    const response = await fetch(`${API_URL}chat/feedback/${feedback_id}/`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ ...chatFeedback }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return {
      ...data,
    };
  } catch (error) {
    console.error('Failed to send chat feedback:', error);
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

export const getAllFeedbackById = async (
  id: string,
  token: string
): Promise<
  | {
      id: string;
      feedback: string;
      created_at: string;
      category: string;
      positive: boolean;
      messagePair: string;
    }
  | { success: boolean; error: string }
> => {
  try {
    const response = await fetch(`${API_URL}chat/feedback/${id}/`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('data', data);
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

export const deleteFeedbackById = async (
  id: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}chat/feedback/${id}/`, {
      method: "DELETE",
      headers: getHeaders(token),
    });

    if (response.status !== 204) {
      throw new Error("Something Went Wrong");
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to create user thread:", error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
};
