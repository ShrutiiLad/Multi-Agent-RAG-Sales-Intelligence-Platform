import { API_URL, getHeaders } from "@/services/global_config";

export const deleteCall = async (
  uuid: string,
  token: string,
  url: "core/assistants/delete"
) => {
  const apiUrl = `${API_URL}${url}/${uuid}/`;
  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: getHeaders(token),
    });
    console.log(response);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    console.log("Bot deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return { error: error, success: false };
  }
};

// const tempModels = [
//   {
//     id: "863e1b17-04cb-4878-b6db-ffeb8217e213",
//     model_code: "gpt-3.5-turbo",
//     name: "GPT3.5-T",
//     description: "",
//   },
//   {
//     id: "2e7abd7b-0f45-4097-b2a8-11aebefdf954",
//     model_code: "gpt-4-1106-preview",
//     name: "GPT4",
//     description: "",
//   },
//   {
//     id: "9dcb1316-e0e8-4118-b848-ffd0402630ad",
//     model_code: "gpt-4-turbo",
//     name: "GPT4 Vision",
//     description: "",
//   },
// ];
