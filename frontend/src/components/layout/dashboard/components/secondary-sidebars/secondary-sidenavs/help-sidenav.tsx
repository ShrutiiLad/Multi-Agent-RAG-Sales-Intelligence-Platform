import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { helpMenu } from "@/components/constants/help-menu";
import Navbar from "@/components/layout/dashboard/components/navbar";
import Bug from "@/assets/sidebar/bug.svg";
import Help from "@/assets/sidebar/help.svg";
import FAQ from "@/assets/sidebar/info.svg";

// Import images for icons

interface MenuItem {
  to: string;
  icon: { active: string; inactive: string };
  label: string;
}

const HelpNavLink: React.FC<{ menuItem: MenuItem }> = ({ menuItem }) => {
  const location = useLocation(); // Get the current location
  const path = location.pathname; // Get the current path

  return (
    <Link
      to={menuItem.to}
      className={`flex flex-row py-2 pr-3 pl-2 items-center rounded-10 text-sm text-inactive ${
        path === menuItem.to
          ? "bg-selectedBg text-selected"
          : "hover:bg-hover hover:text-selected"
      }`}
    >
      <img
        src={
          path === menuItem.to ? menuItem.icon.active : menuItem.icon.inactive
        }
        alt=""
        className="h-5 w-5"
      />
      <Label className="ml-2 cursor-pointer">{menuItem.label}</Label>
    </Link>
  );
};

export function HelpSideNav() {
  const menuItems: MenuItem[] = [
    {
      to: "/help/report",
      icon: { active: Bug, inactive: Bug },
      label: helpMenu.reportBug,
    },
    {
      to: "/help/faq",
      icon: { active: FAQ, inactive: FAQ },
      label: helpMenu.faqPage,
    },
    {
      to: "https://www.intercom.com/help/en/",
      icon: { active: Help, inactive: Help },
      label: helpMenu.intercom,
    },
  ];

  return (
    <Navbar>
      <div className="header text-sm p-4 w-[280px]">
        <Label className="text-indigo-950">Help Settings</Label>
        <Separator className="h-[0.50px] my-4 bg-navbarHoverBg" />
        <div className="flex flex-col">
          <HelpNavLink menuItem={menuItems[0]} />
          <HelpNavLink menuItem={menuItems[1]} />
          <Label className="flex pr-4 pb-2 pl-2 pt-3 text-75">Redirects</Label>
          {/* <HelpNavLink menuItem={menuItems[2]} /> */}
        </div>
      </div>
    </Navbar>
  );
}
