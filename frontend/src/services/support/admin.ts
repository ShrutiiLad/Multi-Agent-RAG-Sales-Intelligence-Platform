import { StatsData } from "@/config/models";
import { API_URL, getHeaders } from "@/services/global_config";

export const fetchStats = async (
  token: string
): Promise<StatsData | { success: boolean; error: string }> => {
  try {
    const response = await fetch(`${API_URL}admin/stats/`, {
      method: "GET",
      headers: getHeaders(token),
    });
    if (!response.ok) {
      if (response.status === 403) {
        return { success: false, error: "Forbidden Access: Not an admin" };
      }
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};
