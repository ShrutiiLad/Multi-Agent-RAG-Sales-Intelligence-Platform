import { Document } from "@/config/models";
import { API_URL } from "@/services/global_config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/lib/prepareHeaders";

const documentsApi = createApi({
  reducerPath: "documentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders,
  }),
  tagTypes: ["Document"],
  endpoints: builder => ({
    fetchDocuments: builder.query<Document[], void>({
      providesTags: ["Document"],
      query: () => {
        return {
          url: "core/documents/",
          method: "GET",
        };
      },
    }),
    fetchDocumentById: builder.query<Document, string>({
      providesTags: (result, error, documentId) => [
        { type: "Document", id: documentId },
      ],
      query: documentId => {
        return {
          url: `core/documents/${documentId}/`,
          method: "GET",
        };
      },
    }),
    createDocument: builder.mutation<Document, Document>({
      invalidatesTags: ["Document"],
      query: document => {
        const formData = new FormData();
        for (const key in document) {
          formData.append(key, document[key]);
        }
        return {
          url: "core/new/documents/create/",
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "Empty",
          },
        };
      },
    }),
    updateDocument: builder.mutation<
      Document,
      { document: Document; id: string }
    >({
      invalidatesTags: ["Document"],
      query: ({ document, id }) => {
        return {
          url: `core/new/documents/${id}/`,
          method: "PUT",
          body: JSON.stringify(document),
        };
      },
    }),
    deleteDocument: builder.mutation<Document, string>({
      invalidatesTags: ["Document"],
      query: documentId => {
        return {
          url: `core/documents/${documentId}/`,
          method: "DELETE",
        };
      },
    }),
  }),
});

export { documentsApi };
