import { Model } from "@/config/models";
import { API_URL } from "@/services/global_config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/lib/prepareHeaders";

const modelsApi = createApi({
  reducerPath: "modelsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders,
  }),
  tagTypes: ["Model"],
  endpoints: builder => ({
    fetchModels: builder.query<Model[], void>({
      providesTags: ["Model"],
      query: () => {
        return {
          url: "core/models/",
          method: "GET",
        };
      },
    }),
  }),
});

export { modelsApi };
