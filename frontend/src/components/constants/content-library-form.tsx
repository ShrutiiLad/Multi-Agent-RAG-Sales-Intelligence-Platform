import { LucideIcon, Square, Zap } from "lucide-react";
type Status = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export const locationList: Status[] = [
  // {
  //   value: "france",
  //   label: "France",
  //   icon: Square,
  // },
  // {
  //   value: "germany",
  //   label: "Germany",
  //   icon: Square,
  // },
  // {
  //   value: "argentina",
  //   label: "Argentina",
  //   icon: Square,
  // },
  {
    value: "india",
    label: "India",
    icon: Square,
  },
  {
    value: "global",
    label: "Global",
    icon: Square,
  },
];

export const projectsList: Status[] = [
  {
    value: "red-copilot",
    label: "RED COPILOT",
    icon: Square,
  },
  {
    value: "analyzer",
    label: "ANALYZER",
    icon: Square,
  },
  {
    value: "general",
    label: "GENERAL",
    icon: Square,
  },
];
export const roleStatuses: Status[] = [
  {
    value: "general",
    label: "General",
    icon: Square,
  },
  {
    value: "user support",
    label: "User support",
    icon: Square,
  },
  {
    value: "others",
    label: "Others",
    icon: Square,
  },
];

export const strengthStatuses: Status[] = [
  {
    value: "1",
    label: "Very low",
    icon: Square,
  },
  {
    value: "2",
    label: "Low",
    icon: Square,
  },
  {
    value: "3",
    label: "High",
    icon: Zap,
  },
  {
    value: "4",
    label: "Very high",
    icon: Zap,
  },
];

//To be integrated once backend is ready
export const categoriesOptions = [
  { value: "general", label: "General" },
  // { value: "interview", label: "Interview" },
  // { value: "hybrid", label: "Hybrid" },
  // { value: "mega", label: "Mega" },
];

export const typesOptions = [
  { value: "general", label: "General" },
  // { value: "interview", label: "Interview" },
  // { value: "file_content", label: "File Content" },
  // { value: "mega", label: "Mega" },
];
