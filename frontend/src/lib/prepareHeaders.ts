import { RootState } from "@/redux/store";

export const prepareHeaders = (headers: Headers, { getState }) => {
  const state: RootState = getState() as RootState;
  const token = state.auth.token;
  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }
  if (!headers.has("Content-Type") || headers.get("Content-Type") !== "Empty") {
    headers.set("Content-Type", "application/json");
  }else{
    headers.delete("Content-Type");
  }
  return headers;
};
