import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { agentsMenu } from "@/components/constants/agents-menu";
import Navbar from "@/components/layout/dashboard/components/navbar";

// Import images for icons
import manageAgents from "@/assets/sidebar/secondarySidebar/agents/manageAgents.svg";
import activeManageAgents from "@/assets/sidebar/secondarySidebar/agents/activeManageAgents.svg";
import contentLibrary from "@/assets/sidebar/secondarySidebar/agents/contentLibrary.svg";
import activeContentLibrary from "@/assets/sidebar/secondarySidebar/agents/activeContentLibrary.svg";
import connections from "@/assets/sidebar/secondarySidebar/agents/connections.svg";
import { useToast } from "@/components/ui/use-toast";
interface MenuItem {
  to: string;
  icon: { active: string; inactive: string };
  label: string;
  disabled?: boolean;
}

const AgentsNavLink: React.FC<{ menuItem: MenuItem }> = ({ menuItem }) => {
  const { toast } = useToast();
  const location = useLocation(); // Get the current location
  const path = location.pathname; // Get the current path


  return (
    <Link
      to={menuItem.to}
      className={`flex flex-row py-2 pr-3 pl-2 items-center rounded-10 text-sm text-inactive ${path === menuItem.to
          ? "bg-selectedBg text-selected"
          : "hover:bg-hover hover:text-selected"
        } ${menuItem?.disabled && "cursor-not-allowed"}`}
      onClick={() => {
        if (menuItem.label === agentsMenu.connections) {
          toast({
            title: "This feature is not available yet.",
            description:
              "Please check back later.",
          });
        }
      }}
    >
      <img
        src={
          path === menuItem.to ? menuItem.icon.active : menuItem.icon.inactive
        }
        alt=""
        className="h-5 w-5"
      />
      <Label
        className={`ml-2 cursor-pointer ${menuItem?.disabled && "cursor-not-allowed"
          }`}
      >
        {menuItem.label}
      </Label>
    </Link>
  );
};

export function AgentsSideNav() {
  const menuItems: MenuItem[] = [
    {
      to: "/agents/manage-agents",
      icon: { active: activeManageAgents, inactive: manageAgents },
      label: agentsMenu.manageAgents,
    },
    {
      to: "/agents/content-library",
      icon: { active: activeContentLibrary, inactive: contentLibrary },
      label: agentsMenu.contentLibrary,
    },
    {
      to: "",
      icon: { active: connections, inactive: connections },
      label: agentsMenu.connections,
      disabled: true,
    },
    {
      to: "",
      icon: { active: connections, inactive: connections },
      label: agentsMenu.redrepo,
      disabled: true,
    },
    {
      to: "",
      icon: { active: connections, inactive: connections },
      label: agentsMenu.videomeet,
      disabled: true,
    },
  ];

  return (
    <Navbar>
      <div className="header text-sm p-4 w-[280px]">
        <Label className="text-indigo-950">Workspace Settings</Label>
        <Separator className="h-[0.50px] my-4 bg-navbarHoverBg" />
        <div className="flex flex-col">
          <AgentsNavLink menuItem={menuItems[0]} />
          <Label className="flex pr-4 pb-2 pl-2 pt-3 text-75">Plugins</Label>
          <AgentsNavLink menuItem={menuItems[1]} />
          <AgentsNavLink menuItem={menuItems[2]} />
          <AgentsNavLink menuItem={menuItems[3]} />
          <AgentsNavLink menuItem={menuItems[4]} />
        </div>
      </div>
    </Navbar>
  );
}
