import { prepareHeaders } from "@/lib/prepareHeaders";
import { logout } from "@/redux/slices/authSlice";
import { API_URL } from "@/services/global_config";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders,
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  console.log({ result });

  if (
    result?.error &&
    "originalStatus" in result.error &&
    result.error.originalStatus >= 500
  ) {
    // Token expired or unauthorized
    api.dispatch(logout());
  }

  return result;
};

export default baseQueryWithReauth;
