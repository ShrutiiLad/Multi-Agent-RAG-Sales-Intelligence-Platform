import ManageAgents from "@/pages/agents/ManageAgents";
import React from "react";

export const AgentUsageTab: React.FC = () => {
  return <ManageAgents showMini={true} isAdmin={true} />;
};
