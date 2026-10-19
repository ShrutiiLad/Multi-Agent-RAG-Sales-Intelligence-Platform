import React from "react";
import { cn } from "@/lib/utils";
import { SideNav } from "@/components/layout/dashboard/components/primary-sidebar/side-nav";
import { SideNavItems } from "@/config/site";

interface SidebarProps {
  className?: string;
  token: string | null;
}

export default function Sidebar({ className, token }: SidebarProps) {
  return (
    <nav
      className={cn(
        `relative hidden h-screen md:block `,
        "duration-500",
        "w-[72px]",
        "p-4",
        "bg-[#2222440d]",
        className
      )}
    >
      <div className="h-full">
        <SideNav
          className="text-background opacity-0 transition-all duration-300 group-hover:z-50 group-hover:ml-4 group-hover:rounded group-hover:bg-foreground group-hover:p-2 group-hover:opacity-100"
          items={SideNavItems}
          token={token}
        />
      </div>
    </nav>
  );
}

// const { isOpen, toggle } = useSidebar();
// const [status, setStatus] = useState(false);

// const handleToggle = () => {
//     setStatus(true);
//     toggle();
//     setTimeout(() => setStatus(false), 500);
// };
// isOpen ? "w-60" : "w-[60px]",
{
  /* <BsArrowLeftShort
                className={cn(
                    "absolute -right-3 top-20 cursor-pointer rounded-full border bg-background text-3xl text-foreground",
                    !isOpen && "rotate-180"
                )}
                onClick={handleToggle}
            /> */
}
