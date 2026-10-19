import React, { useEffect, useState } from "react";
import {
  useDeleteDocumentMutation,
  useFetchDocumentsQuery,
} from "@/redux/store";
import { DataTable } from "@/components/helpers/data-table";
import { columns } from "@/components/helpers/table/columns/content-columns";
import { DataTableColumnHeader } from "@/components/helpers/table/data-table-column-header";
import { DataTableRowActions } from "@/components/helpers/table/data-table-row-actions";
import { ContentLibraryForm } from "@/components/helpers/form/content-library-form";
import { Document } from "@/config/models";
import { _contents } from "@/components/helpers/table/data-table-toolbar";
import { useToast } from "@/components/ui/use-toast";
import { DeleteConfirmationDialog } from "@/components/constants/delete-confirmation-dialog";

const ContentLibrary: React.FC = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [documentData, setDocumentData] = React.useState<Document>({
    id: "",
    title: "",
    description: "",
    source: "",
    summary: "",
    url: "",
    author: "",
    category: "",
    created_at: "",
    published_at: "",
    type: "",
    strength: "",
    project: "",
    location: "",
    associated_with: [],
  });

  const {
    data: documents,
    isFetching: isFetchDocumentsLoading,
    isError: isFetchDocumentsError,
  } = useFetchDocumentsQuery();

  const [
    deleteDocument,
    {
      isLoading: isDeleteDocumentLoading,
      isError: isDeleteDocumentError,
      data: deletedDocument,
    },
  ] = useDeleteDocumentMutation();

  useEffect(() => {
    if (deletedDocument) {
      toast({
        description: "Document deleted successfully.",
      });
      setConfirmDialogOpen(false);
    }
  }, [JSON.stringify(deletedDocument)]);

  useEffect(() => {
    if (isDeleteDocumentError) {
      toast({
        description: "Error occured while deleting. Try again!",
      });
    }
  }, [JSON.stringify(isDeleteDocumentError)]);

  useEffect(() => {
    if (isFetchDocumentsError) {
      toast({
        description: "Error occured while fetching documents",
      });
    }
  }, [JSON.stringify(isFetchDocumentsError)]);

  const handleDelete = () => {
    rowId && deleteDocument(rowId);
  };

  const handleShowForm = (id: any) => {
    if (documents) {
      console.log("My Documents", documents[id]);
      setDocumentData({
        id: documents[id]?.id,
        title: documents[id]?.title,
        description: documents[id]?.summary,
        source: documents[id]?.source,
        summary: documents[id]?.summary ?? "",
        url: documents[id]?.url,
        author: documents[id]?.author,
        category: documents[id]?.category,
        created_at: documents[id]?.created_at,
        published_at: documents[id]?.published_at,
        type: documents[id]?.type,
        strength: documents[id]?.strength,
        project: documents[id]?.project,
        location: documents[id]?.location,
        associated_with: documents[id]?.associated_with,
        file: documents[id]?.file,
      });
    }
    setTimeout(() => {
      setShowForm(true);
    }, 0);
  };

  const [confirmdialogOpen, setConfirmDialogOpen] = useState(false);

  const [rowId, selectedRowId] = useState("");

  const getColumnWithDelete = () => {
    const deleteColumn = {
      id: "delete",
      accessorKey: "delete",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }: { row: any }) => (
        <div className="w-8">
          <DataTableRowActions
            row={row}
            selectedRowId={selectedRowId}
            setConfirmDialogOpen={setConfirmDialogOpen}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    };
    return [...columns, deleteColumn];
  };

  return (
    <>
      <div className="hidden flex-1 flex-col h-full overflow-auto md:flex p-6 pb-0">
        <DataTable
          tableType={_contents}
          data={documents || []}
          columns={getColumnWithDelete()}
          onHandleShowForm={handleShowForm}
          isLoading={isFetchDocumentsLoading}
        />
      </div>
      {showForm && (
        <ContentLibraryForm
          displayLibraryForm={showForm}
          setDisplayLibraryForm={setShowForm}
          closeBothDialogs={() => setShowForm}
          documentLoadedData={documentData}
          isOldDocument={true}
        />
      )}
      {confirmdialogOpen && (
        <DeleteConfirmationDialog
          confirmDialogOpen={confirmdialogOpen}
          setConfirmDialogOpen={setConfirmDialogOpen}
          onHandleDelete={() => handleDelete?.()}
          textMsg=""
          supportingText='the document "'
          boldText={documents?.find(doc => doc.id === rowId)?.title ?? ""}
          endingText='"'
          isLoading={Boolean(isDeleteDocumentLoading)}
        />
      )}
    </>
  );
};

export default ContentLibrary;
