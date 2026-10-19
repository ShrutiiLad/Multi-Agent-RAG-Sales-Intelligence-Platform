export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<any> | null; // Make icon optional and allow null
  color?: string; // Add this line if color is optional
}

export interface NewNavItemList {
  title: string;
  href?: string;
  disabled?: boolean;
  activeImg?: string;
  defaultImg?: string;
}
