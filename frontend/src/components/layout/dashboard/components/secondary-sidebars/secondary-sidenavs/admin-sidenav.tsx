import React from "react";
import { Link, useLocation } from "react-router-dom"; // Import Link and useLocation
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { adminMenu } from "@/components/constants/admin-menu";
import Navbar from "@/components/layout/dashboard/components/navbar";

// Import images for icons
import usersDirectory from "@/assets/sidebar/secondarySidebar/admin/usersDirectory.svg";
import activeUsersDirectory from "@/assets/sidebar/secondarySidebar/admin/activeUsersDirectory.svg";
import promptTracking from "@/assets/sidebar/secondarySidebar/admin/promptTracking.svg";
import activePromptTracking from "@/assets/sidebar/secondarySidebar/admin/activePromptTracking.svg";
import pricingModule from "@/assets/sidebar/secondarySidebar/admin/pricingModule.svg";

interface MenuItem {
  to: string;
  icon: { active: string; inactive: string };
  label: string;
}

const AdminNavLink: React.FC<{ menuItem: MenuItem }> = ({ menuItem }) => {
  const location = useLocation(); // Get the current location
  const path = location.pathname; // Get the current path

  return (
    <Link
      to={menuItem.to}
      className={`flex flex-row py-2 pr-3 pl-2 items-center rounded-10 text-sm text-inactive ${
        path === menuItem.to
          ? "bg-selectedBg text-selected"
          : "hover:bg-hover  hover:text-selected"
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

export function AdminSideNav() {
  // Define menu items with their respective icons
  const menuItems: MenuItem[] = [
    {
      to: "/admin/users-directory",
      icon: { active: activeUsersDirectory, inactive: usersDirectory },
      label: adminMenu.usersDirectory,
    },
    {
      to: "/admin/prompt-tracking",
      icon: { active: activePromptTracking, inactive: promptTracking },
      label: adminMenu.promptTracking,
    },
    {
      to: "/admin/pricing-module",
      icon: { active: pricingModule, inactive: pricingModule },
      label: adminMenu.pricingModule,
    },
  ];

  return (
    <Navbar>
      <div className="header text-sm p-4 w-[280px]">
        <Label className="text-indigo-950">Workspace Settings</Label>
        <Separator className="h-[0.50px] my-4 bg-navbarHoverBg" />
        <div className="flex flex-col">
          <AdminNavLink menuItem={menuItems[0]} />
          {/* <Label className="flex pr-4 pb-2 pl-2 pt-3 text-75">Analytics</Label>
          <AdminNavLink menuItem={menuItems[1]} />
          <AdminNavLink menuItem={menuItems[2]} /> */}
        </div>
      </div>
    </Navbar>
  );
}
