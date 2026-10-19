import { API_URL } from "@/services/global_config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/lib/prepareHeaders";

const chatsApi = createApi({
  reducerPath: "chatsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders,
  }),
  endpoints: builder => ({
    createImageURL: builder.mutation<{ file: string }, File>({
      query: imageData => {
        const formData = new FormData();
        formData.append("file", imageData);
        return {
          url: "chat/file/add/",
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "Empty",
          },
        };
      },
    }),
  }),
});

export { chatsApi };
