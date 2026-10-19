import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { NewNavItemList } from "@/types/nav";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import UserProfile from "@/components/layout/user-profile";
import UserNotification from "@/components/layout/user-notification";
import { useToast } from "@/components/ui/use-toast";
import { RootState } from "@/redux/store";
interface SideNavProps {
  items: NewNavItemList[];
  setOpen?: (open: boolean) => void;
  className?: string;
  token: string | null;
}

export function SideNav({ items, setOpen, className, token }: SideNavProps) {
  const location = useLocation();
  const path = location.pathname;
  const { isOpen } = useSidebar();
  const [openItem, setOpenItem] = useState("");
  const [lastOpenItem, setLastOpenItem] = useState("");
  const user = useSelector((state: RootState) => state.auth.user) || null;
  const isNotAnAdmin = !user?.is_superuser;
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setOpenItem(lastOpenItem);
    } else {
      setLastOpenItem(openItem);
      setOpenItem("");
    }
  }, [isOpen]);

  return (
    <nav className="flex-box h-[98vh] flex flex-col">
      <div className="flex-grow">
        <div className="space-y-[8px]">
          {items
            .filter(item => item.href !== undefined)
            .map(item => (
              <div key={item.href}>
                <Link
                  to={
                    (!(
                      item.disabled ||
                      (item.title === "Admin" && isNotAnAdmin)
                    ) &&
                      item.href) ||
                    ""
                  }
                  onClick={() => {
                    if (setOpen) setOpen(false);
                    if (item.disabled)
                      toast({
                        title: "This feature is not available yet.",
                        description:
                          "Please check back later.",
                      });
                    if (item.title === "Admin" && isNotAnAdmin)
                      toast({
                        variant: "destructive",
                        title: "403",
                        description: "Forbidden Access: Not an admin",
                      });
                  }}
                  className={cn(
                    "group flex items-center justify-center text-inactive h-auto",
                    item.disabled || (item.title === "Admin" && isNotAnAdmin)
                      ? "cursor-not-allowed disabled-link"
                      : "cursor-pointer"
                  )}
                  style={{
                    borderRadius: "10px",
                  }}
                >
                  <div
                    className={cn(
                      "duration-200 flex flex-col items-center text-xs justify-center gap-1",
                      !isOpen && className,
                      path.substring(0, 5) === item.href?.substring(0, 5) &&
                        "text-selected",
                      item.disabled || (item.title === "Admin" && isNotAnAdmin)
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    )}
                  >
                    <div
                      className={`h-10 w-10 flex items-center justify-center rounded-10 hover:bg-navbarHoverBg ${
                        path.substring(0, 5) === item.href?.substring(0, 5) &&
                        "bg-navbarHoverBg"
                      }`}
                    >
                      <img
                        src={
                          path.substring(0, 5) === item.href?.substring(0, 5)
                            ? item.activeImg
                            : item.defaultImg
                        }
                        alt=""
                        className="h-5 w-5"
                      />
                    </div>
                    <p>{item.title}</p>
                  </div>
                </Link>
              </div>
            ))}
        </div>
      </div>
      <div>
        <div className="flex-col">
          {/* <UserNotification /> */}
          <UserProfile token={token} />
        </div>
      </div>
    </nav>
  );
}
