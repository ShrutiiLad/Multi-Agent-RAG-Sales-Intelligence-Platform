// src/redux/store.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import modelReducer from "@/redux/slices/modelSlice";
import messageReducer from "@/redux/slices/messagesSlice";
import authReducer from "@/redux/slices/authSlice";
import conversationReducer from "@/redux/slices/conversationSlice";
import supportReducer from "@/redux/slices/supportSlice";
import { statsReducer, userDirectoryReducer } from "@/redux/slices/adminSlice";
import chatInfoReducer from "@/redux/slices/chatInfo";

import { agentsApi } from "@/redux/apis/agentsApi";
import { modelsApi } from "@/redux/apis/modelsApi";
import { chatsApi } from "@/redux/apis/chatsApi";
import { documentsApi } from "@/redux/apis/documentsApi";
import { statsApi } from "@/redux/apis/statsApi";

const rootReducer = combineReducers({
  model: modelReducer,
  auth: authReducer,
  messages: messageReducer,
  conversations: conversationReducer,
  support: supportReducer,
  admin: userDirectoryReducer,
  stats: statsReducer,
  chatInfo: chatInfoReducer,
  [agentsApi.reducerPath]: agentsApi.reducer,
  [modelsApi.reducerPath]: modelsApi.reducer,
  [documentsApi.reducerPath]: documentsApi.reducer,
  [chatsApi.reducerPath]: chatsApi.reducer,
  [statsApi.reducerPath]: statsApi.reducer,
});
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware()
      .concat(agentsApi.middleware)
      .concat(modelsApi.middleware)
      .concat(chatsApi.middleware)
      .concat(documentsApi.middleware)
      .concat(statsApi.middleware);
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const {
  useFetchAgentsQuery,
  useLazyFetchAgentByIdQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
} = agentsApi;

export const { useFetchModelsQuery } = modelsApi;

export const {
  useFetchDocumentsQuery,
  useLazyFetchDocumentByIdQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApi;

export const { useCreateImageURLMutation } = chatsApi;

export const { useFetchBotStatsQuery, useFetchPricingStatsQuery } = statsApi;
