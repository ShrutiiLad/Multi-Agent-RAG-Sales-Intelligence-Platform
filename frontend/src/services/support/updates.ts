import { Update } from "@/config/models";
import { API_URL, getHeaders } from "@/services/global_config";

export const fetchUpdates = async (
  token: string
): Promise<Update[] | { success: boolean; error: string }> => {
  try {
    const response = await fetch(`${API_URL}support/updates/`, {
      method: "GET",
      headers: getHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("data", data);
    return data;
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

export const markUpdateAsRead = async (
  token: string,
  updateId: string
): Promise<Update[] | { success: boolean; error: string }> => {
  try {
    const response = await fetch(
      `${API_URL}support/updates/${updateId}/read/`,
      {
        method: "POST",
        headers: getHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to mark following update as read:", updateId, error);
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

export const markAllUpdatesAsRead = async (
  token: string
): Promise<Update[] | { success: boolean; error: string }> => {
  try {
    const response = await fetch(`${API_URL}support/updates/readAll/`, {
      method: "POST",
      headers: getHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to mark updates as read:", error);
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
