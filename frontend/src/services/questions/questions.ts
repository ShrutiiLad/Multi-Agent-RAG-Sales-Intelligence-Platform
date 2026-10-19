import { API_URL, getHeaders } from "@/services/global_config";

export const createQuestions = async (
  token: string,
  assistantId: string,
  questions: string[]
): Promise<{ questions?: any; success: boolean; error: string }> => {
  try {
    const response = await fetch(
      `${API_URL}core/assistants/questions/create/`,
      {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({
          bot_id: assistantId,
          questions: questions,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
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

export const getAssitantQuestions = async (
  token: string,
  assistantId: string
): Promise<any[] | { success: boolean; error: string }> => {
  try {
    const response = await fetch(`${API_URL}core/assistants/${assistantId}`, {
      method: "GET",
      headers: getHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch documents:", error);
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

export const editAssistantQuestions = async (
  token: string,
  assistantId: string,
  questions: string[]
): Promise<{ questions?: any; success: boolean; error: string }> => {
  try {
    const response = await fetch(
      `${API_URL}core/assistants/questions/${assistantId}/`,
      {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(questions),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
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
