import { Button } from "@/components/ui/button";
import React from "react";
import { useFetchPricingStatsQuery } from "@/redux/store";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { DataTable } from "@/components/helpers/data-table";
import { _agents } from "@/components/helpers/table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/helpers/table/data-table-column-header";
import { dataTableValueWithAvatar } from "@/components/helpers/table/global-column-components";
import { DatePicker } from "@/components/layout/DatePicker";
import { InfoCard } from "@/components/layout/InfoCard";

const PricingModule: React.FC = () => {
  const { toast } = useToast();

  const { isFetching, data: pricingStats, error } = useFetchPricingStatsQuery();

  const columns = [
    {
      accessorKey: "name",
      enableResizing: true, //disable resizing for just this column
      size: 1000,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="w-[560px] truncate">
          {dataTableValueWithAvatar(
            row.original.name || "Deleted",
            row.original.avatar || "",
            "agent"
          )}
        </div>
      ),
    },
    {
      accessorKey: "num_users",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Users" />
      ),
      cell: ({ row }) => (
        <div className="w-[120px] truncate">{row.getValue("num_users")}</div>
      ),
    },
    {
      accessorKey: "num_threads",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Chats" />
      ),
      cell: ({ row }) => (
        <div className="w-[120px] truncate">{row.getValue("num_threads")}</div>
      ),
    },
    {
      accessorKey: "tokens",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tokens" />
      ),
      cell: ({ row }) => (
        <div className="w-[120px] truncate">{row.original.tokens || 0}</div>
      ),
    },
    {
      accessorKey: "pricing",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Cost" />
      ),
      cell: ({ row }) => (
        <div className="w-[120px] truncate">{`$${row.original.pricing?.toFixed(
          2
        )}`}</div>
      ),
    },
    {
      accessorKey: "token_increase_percentage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Evolution" />
      ),
      cell: ({ row }) => (
        <div className="w-[120px] truncate">
          {`${row.original.token_increase_percentage?.toFixed(2)}%`}
        </div>
      ),
    },
  ];

  const adminStats = pricingStats?.[0]?.admin;
  const { total_cost, average_per_user, average_per_bot, average_per_prompt } =
    adminStats || {};

  return (
    <>
      {isFetching ? (
        <div className="h-full w-full flex items-center justify-center">
          <Spinner className="mr-2 h-10 w-10 text-inactive" size="large" />
        </div>
      ) : (
        <div className="hidden flex-col md:flex">
          <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium leading-[18px] tracking-tight">
                Pricing Module
              </h2>
              <div className="flex items-center space-x-2">
                <DatePicker />
                <Button
                  className="rounded-[10px] h-9"
                  onClick={() =>
                    toast({
                      title: "This feature is not available yet.",
                      description:
                        "Please check back later.",
                    })
                  }
                >
                  Download
                </Button>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {total_cost && (
                <InfoCard
                  title="Total cost"
                  value={`$${total_cost.toFixed(2)}`}
                  percentChange="+20.1"
                />
              )}
              {average_per_user && (
                <InfoCard
                  title="Avg cost per user"
                  value={`$${average_per_user.toFixed(2)}`}
                  percentChange="+19"
                />
              )}
              {average_per_bot && (
                <InfoCard
                  title="Avg cost per agent"
                  value={`$${average_per_bot.toFixed(2)}`}
                  percentChange="+2.2"
                />
              )}
              {average_per_prompt && (
                <InfoCard
                  title="Avg cost per prompt"
                  value={`$${average_per_prompt.toFixed(2)}`}
                  percentChange="+2.2"
                />
              )}
            </div>
            <div className="hidden flex-col overflow-auto md:flex h-[calc(100vh-300px)]">
              <DataTable
                header="Pricing Module"
                isMini={true}
                data={pricingStats?.[1].bot_list || []}
                columns={columns}
                isLoading={isFetching}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PricingModule;
