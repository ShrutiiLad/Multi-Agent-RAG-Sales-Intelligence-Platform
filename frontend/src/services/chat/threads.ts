import { API_URL, getHeaders } from "@/services/global_config";

// threads.ts
export const getAllUserThreads = async (
  token: string
): Promise<{
  success: boolean;
  threads?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}chat/threads/`, {
      method: "GET",
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return {
      success: true,
      threads: data,
    };
  } catch (error) {
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

export const renameChat = async (
  token: string,
  threadId: string,
  newTitle: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}chat/threads/${threadId}/`, {
      method: "PUT",
      headers: {
        ...getHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTitle }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return { success: true };
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};

export const deleteChat = async (
  token: string,
  threadId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}chat/threads/${threadId}/`, {
      method: "DELETE",
      headers: {
        ...getHeaders(token),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return { success: true };
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};
