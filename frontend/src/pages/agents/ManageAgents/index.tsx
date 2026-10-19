import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  RootState,
  useFetchAgentsQuery,
  useLazyFetchAgentByIdQuery,
} from "@/redux/store";
import { DataTable } from "@/components/helpers/data-table";
import { getColumns } from "@/components/helpers/table/columns/agents-columns";
import { DataTableColumnHeader } from "@/components/helpers/table/data-table-column-header";
import { DataTableRowActionsAgents } from "@/components/helpers/table/data-table-row-actions-agents";
import { _agents } from "@/components/helpers/table/data-table-toolbar";
import { Bot, Question, BotStats } from "@/config/models";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent } from "@/components/ui/dialog";
import { MultiStepForm } from "@/components/layout/ai-agent/create/new-agent";
import { ColumnDef } from "@tanstack/react-table";
import { Spinner } from "@/components/ui/spinner";
import { DataTableRowActionsAgentsEditDelete } from "@/components/helpers/table/data-table-row-actions-agent-edit-delete";
import { useFetchBotStatsQuery } from "@/redux/store";

type ManageAgentsProps = {
  showMini?: boolean;
  isAdmin?: boolean;
};

const ManageAgents: React.FC<ManageAgentsProps> = ({
  showMini = false,
  isAdmin = false,
}) => {
  const { data: bots, isFetching: isLoading } = useFetchAgentsQuery();

  const { isFetching: isStatsLoading, data: botStats } =
    useFetchBotStatsQuery();

  const [selectedRow, setSelectedRow] = useState({
    id: "",
    name: "",
    type: "",
  });

  const [agentId, setAgentId] = useState("");

  const [
    getAgent,
    { data: agentData, isLoading: isAgentLoading, isFetching: isAgentFetching },
  ] = useLazyFetchAgentByIdQuery();

  const [dialogClasses, setDialogClasses] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const transformBots = (
    bots?: Bot[]
  ): {
    id?: string;
    assistant_id?: string | null;
    rag?: boolean;
    name: string;
    avatar: string;
    category: string;
    project: string;
    model: string;
    description: string;
    instructions: string;
    rules: string;
    created_at: string;
    updated_at: string;
    documents: string[];
    type: string;
    author: string;
    disabled: boolean;
    questions: Question[];
    thread_count: number;
  }[] => {
    return (
      bots?.map(bot => ({
        id: bot.id,
        assistant_id: bot.assistant_id ?? "",
        rag: bot.rag,
        name: bot.name,
        avatar: bot.avatar ?? "",
        category: bot.category ?? "",
        project: bot.project ?? "",
        model: bot.model,
        description: bot.description ?? "",
        instructions: bot.instructions ?? "",
        rules: bot.rules ?? "",
        created_at: bot.created_at,
        updated_at: bot.updated_at,
        documents: bot.documents,
        type: bot.type,
        disabled: bot.disabled,
        author: bot.author ?? "",
        questions: bot.questions.map((question: Question) => question),
        thread_count: bot.thread_count ?? 0,
      })) || []
    );
  };

  const transformedBots = transformBots(bots);

  const getColumnWithDelete = isAdmin
    ? getColumns(isAdmin)
    : [
        ...getColumns(isAdmin),
        {
          id: "delete",
          accessorKey: "delete",
          header: ({ column }: { column: any }) => (
            <DataTableColumnHeader column={column} title="" />
          ),
          cell: ({ row }: { row: any }) => (
            <div className="w-12" key={row.original.id}>
              <DataTableRowActionsAgents row={row} onRowSelect={onRowSelect} />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        },
      ];

  const handleShowForm = (id: string | number) => {
    setAgentId(id as string);
    getAgent(id as string, true);
  };

  const onRowSelect = (id: string, name: string, type: string) => {
    setSelectedRow({ id, name, type });
  };

  return (
    <>
      <div
        className={`hidden flex-1 flex-col h-full overflow-auto md:flex ${
          showMini ? "" : "p-6 pb-0"
        }`}
      >
        {isAdmin && (botStats ?? []).length > 0 ? (
          <DataTable
            header="Manage Agents"
            filterFrom="name"
            tableType={_agents}
            isMini={showMini}
            data={botStats as BotStats[]}
            columns={getColumnWithDelete as ColumnDef<BotStats, unknown>[]}
            onHandleShowForm={handleShowForm}
            isLoading={isStatsLoading}
          />
        ) : (
          <div className="h-[calc(100vh-300px)]">
            <DataTable
              header="Manage Agents"
              filterFrom="name"
              tableType={_agents}
              isMini={showMini}
              data={transformedBots as Bot[]}
              columns={getColumnWithDelete as ColumnDef<Bot, unknown>[]}
              onHandleShowForm={handleShowForm}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
      <Dialog open={Boolean(agentId)}>
        <DialogContent
          className={dialogClasses}
          closeDialog={() => {
            setAgentId("");
          }}
          onInteractOutside={e => {
            e.preventDefault();
          }}
        >
          {isAgentLoading || isAgentFetching ? (
            <Spinner className="absolute left-1/2 top-1/2 z-50" />
          ) : (
            <MultiStepForm
              closeDialog={() => {
                setAgentId("");
              }}
              agent={agentData}
              setDialogClasses={setDialogClasses}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              type="detail"
            />
          )}
        </DialogContent>
      </Dialog>
      {selectedRow.id && (
        <DataTableRowActionsAgentsEditDelete
          key="edit-delete"
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          bots={bots}
        />
      )}
    </>
  );
};

export default ManageAgents;
