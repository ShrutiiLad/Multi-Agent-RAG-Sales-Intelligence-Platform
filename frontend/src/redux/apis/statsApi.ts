import { BotStats, PricingStats } from "@/config/models";
import { API_URL } from "@/services/global_config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/lib/prepareHeaders";

const statsApi = createApi({
  reducerPath: "statsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders,
  }),
  tagTypes: ["BotStats", "PricingStats"],
  endpoints: builder => ({
    fetchBotStats: builder.query<BotStats[], void>({
      providesTags: ["BotStats"],
      query: () => {
        return {
          url: "admin/stats/bots/",
          method: "GET",
        };
      },
    }),
    fetchPricingStats: builder.query<PricingStats[], void>({
      providesTags: ["PricingStats"],
      query: () => {
        return {
          url: "admin/stats/pricing/",
          method: "GET",
        };
      },
    }),
  }),
});

export { statsApi };
