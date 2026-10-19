import { API_URL, getHeaders } from "@/services/global_config";

interface ReportFormData {
  title: string;
  description: string;
  notes?: string;
}

export const postReport = async (
  reportData: ReportFormData,
  token: string
): Promise<any> => {
  const apiUrl = `${API_URL}support/supports/create/`;
  try {
    console.log("Posting Report Data", reportData);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({
        ...reportData,
        status: "Open",
        priority: "Medium",
      }),
    });
    // console.log(response);
    if (!response.ok) {
      console.log(response);
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    
    return { data: data, success: true };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return { error: error, success: false };
  }
};
