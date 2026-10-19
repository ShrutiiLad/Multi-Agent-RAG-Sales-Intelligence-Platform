import { DataTable } from "@/components/helpers/data-table";
import { StatsData } from "@/config/models";
import { RootState } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import { columnsPrompt } from "@/components/helpers/table/columns/prompt-classification-columns";

export const PromptClassificationTab: React.FC = () => {
  const stats: StatsData | null = useSelector((state: RootState) => state.stats.stats);
  const queryCategoryStats = stats?.queryCategoryStats.map(queryCategory => queryCategory).flat() || [];

  return (
    <DataTable
      isMini={true}
      data={queryCategoryStats}
      columns={columnsPrompt}
    />
  );
};
