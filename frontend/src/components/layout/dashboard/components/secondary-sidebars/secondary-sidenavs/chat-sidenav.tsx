import React from "react";

import { useState } from "react";
import { useSelector } from "react-redux";

import { RootState, useFetchAgentsQuery } from "@/redux/store";

import { BotSwitcher } from "@/components/layout/ai-agent/switcher/model-switcher";
import ConversationList from "@/components/layout/dashboard/components/conversations-list";
import { Separator } from "@radix-ui/react-select";
import Navbar from "@/components/layout/dashboard/components/navbar";

export function ChatSideNav() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [scrolled, setScrolled] = useState(false);
  const { data: bots } = useFetchAgentsQuery();

  return (
    <Navbar>
      <div className="header w-[280px]">
        <BotSwitcher
          isCollapsed={false}
          bots={bots || []}
          boxShadow={scrolled}
        />
        <Separator
          className={`h-[0.50px] bg-navbarHoverBg ${
            scrolled ? "mx-0" : "mx-4"
          }`}
        />
        <div className={`mr-1`}>
          <ConversationList token={token} setScrolled={setScrolled} />
        </div>
      </div>
    </Navbar>
  );
}
