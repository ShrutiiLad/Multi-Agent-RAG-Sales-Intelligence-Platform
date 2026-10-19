import { Bot } from "@/config/models";
import { createApi } from "@reduxjs/toolkit/query/react";
import { AgentFormData } from "@/components/layout/ai-agent/create/new-agent";
import baseQueryWithReauth from "./helpers/baseQueryWithReauth";

const agentsApi = createApi({
  reducerPath: "agentsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Agents", "Agent"],
  endpoints: builder => ({
    fetchAgents: builder.query<Bot[], void>({
      providesTags: ["Agents"],
      query: () => {
        return {
          url: "core/bots/",
          method: "GET",
        };
      },
    }),
    fetchAgentById: builder.query<Bot, string>({
      providesTags: (result, error, agentId) => {
        return [{ type: "Agent", id: agentId }];
      },
      query: agentId => {
        return {
          url: `core/bots/${agentId}/`,
          method: "GET",
        };
      },
    }),
    createAgent: builder.mutation<Bot, AgentFormData>({
      invalidatesTags: ["Agents"],
      query: agent => {
        const formData = new FormData();
        Object.entries(agent).forEach(([key, value]) => {
          if (key === "documents" && value.length > 0) {
            value.forEach((document: string) => {
              formData.append("documents", document);
            });
          }
          if (key !== "documents" && value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        return {
          url: "core/bots/create/",
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "Empty",
          },
        };
      },
    }),
    updateAgent: builder.mutation<Bot, AgentFormData>({
      invalidatesTags: (result, error, agent) => [
        "Agents",
        { type: "Agent", id: agent.id },
      ],
      query: agent => {
        const formData = new FormData();
        Object.entries(agent).forEach(([key, value]) => {
          if (key === "documents" && value.length > 0) {
            value.forEach((document: string) => {
              formData.append("documents", document);
            });
          }
          if (key !== "documents" && value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        return {
          url: `core/bots/${agent.id}/`,
          method: "PUT",
          body: formData,
          headers: {
            "Content-Type": "Empty",
          },
        };
      },
    }),
    deleteAgent: builder.mutation<Bot, string>({
      invalidatesTags: ["Agents"],
      query: agentId => {
        return {
          url: `core/bots/${agentId}/`,
          method: "DELETE",
        };
      },
    }),
  }),
});

export { agentsApi };
