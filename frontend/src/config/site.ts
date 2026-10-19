import { Icons } from "@/components/ui/icons";
import { NavItem, NewNavItemList } from "@/types/nav";
import { Square, Zap } from "lucide-react";
import activeSparks from "@/assets/sidebar/activeSparks.svg";
import defaultSparks from "@/assets/sidebar/defaultSparks.svg";
import activeBuilding from "@/assets/sidebar/activeBuilding.svg";
import defaultBuilding from "@/assets/sidebar/defaultBuilding.svg";
import activeBot from "@/assets/sidebar/activeBot.svg";
import defaultBot from "@/assets/sidebar/defaultBot.svg";
import lifesaverImg from "@/assets/sidebar/lifesaver.svg";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Blueberry",
  description: "",
  links: {},
};

export const SideNavItems: NewNavItemList[] = [
  {
    title: "Chat",
    href: "/chat",
    activeImg: activeSparks,
    defaultImg: defaultSparks,
    disabled: false,
  },
  {
    title: "Agents",
    href: "/agents",
    activeImg: activeBot,
    defaultImg: defaultBot,
    disabled: false,
  },
  {
    title: "Admin",
    href: "/admin",
    activeImg: activeBuilding,
    defaultImg: defaultBuilding,
    disabled: false,
  },
  {
    title: "Copilot",
    href: "",
    activeImg: activeSparks,
    defaultImg: defaultSparks,
    disabled: true,
  },
  {
    title: "Tools",
    href: "",
    activeImg: activeSparks,
    defaultImg: defaultSparks,
    disabled: true,
  },
  {
    title: "Governance",
    href: "",
    activeImg: activeSparks,
    defaultImg: defaultSparks,
    disabled: true,
  },
];

export const BottomNavItems: NavItem[] = [
  {
    title: "Help Center",
    icon: Icons.circle,
    href: "/help",
  },
  {
    title: "Updates",
    icon: Icons.circle,
    href: "/updates",
  },
  {
    title: "Log Out",
    icon: Icons.circle,
    href: "/login",
  },
];

export const strengths = [
  {
    value: "very_low",
    label: "Very Low",
    icon: Square,
  },
  {
    value: "low",
    label: "Low",
    icon: Square,
  },
  {
    value: "high",
    label: "High",
    icon: Zap,
  },
  {
    value: "very_high",
    label: "Very High",
    icon: Zap,
  },
];
