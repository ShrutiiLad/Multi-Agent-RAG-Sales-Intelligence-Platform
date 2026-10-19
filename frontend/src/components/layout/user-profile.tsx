import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { logout } from "@/redux/slices/authSlice";
import { logOut } from "@/services/auth/auth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/redux/store";
import { useSidebar } from "@/hooks/useSidebar";
import MyAgents from "@/assets/sidebar/MyAgents.svg";
import Settings from "@/assets/sidebar/Settings.svg";
import LogOut from "@/assets/sidebar/LogOut.svg";
import defUser from "@/assets/avatar/defUser.png";
import EchoAvatar from "@/components/layout/dashboard/components/avatar";
import { UserPreferences } from "@/components/layout/UserPreferences";

interface UserProfileProps {
  setOpen?: (open: boolean) => void;
  token: string | null;
}

const UserProfile = ({ setOpen, token }: UserProfileProps) => {
  const user = useSelector((state: RootState) => state.auth.user) || null;
  const { isOpen } = useSidebar();
  const [openItem, setOpenItem] = useState("");
  const [lastOpenItem, setLastOpenItem] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const title = "Log Out";

  const [preferenceOpen, setPreferenceOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOpenItem(lastOpenItem);
    } else {
      setLastOpenItem(openItem);
      setOpenItem("");
    }
  }, [isOpen, dispatch]);

  async function logoutUser() {
    try {
      if (token !== null) {
        const response = await logOut(token);
        if (response && response.success) {
          dispatch(logout());
        } else {
          console.error("Failed to log out");
        }
      } else {
        console.error("Token is null. Cannot log out.");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
      // Optionally, you can dispatch an action to update the UI or state to reflect the error
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center cursor-pointer my-[16px]">
            <Avatar className="rounded">
              {/* <AvatarImage src={user?.profile?.avatar ?? defUser} />
               */}
              <EchoAvatar
                size="normal"
                mainImage={user?.profile?.avatar || ""}
                initialsFallback={user?.profile?.avatar ? "" : user?.username}
                fallbackImage={defUser}
                alt="User"
                radius="small"
              />
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60 h-[173px] -mb-[44px] ml-16 lg:mr-2">
          <DropdownMenuLabel className="p-2">
            <div className="flex">
              <EchoAvatar
                size="medium"
                mainImage={user?.profile?.avatar || ""}
                initialsFallback={user?.profile?.avatar ? "" : user?.username}
                fallbackImage={defUser}
                alt="User"
                className="mr-2"
                radius="small"
              />
              <span>
                <p className="text-selected text-sm leading-[14px] font-medium">
                  {user?.username || "No Username"}
                </p>
                <p className="text-inactive pt-1 text-[13px] leading-[13px] font-normal">
                  {user?.email || "No Email"}
                </p>
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="p-2 cursor-pointer"
              onClick={() => setPreferenceOpen(true)}
            >
              <img src={Settings} alt="setting" className="mr-2" />
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-2 cursor-pointer">
              <Link to="/agents/manage-agents" className="flex items-center">
                <img src={MyAgents} alt="agent" className="mr-2" />
                <span>My Agents</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="mx-1" />
          <DropdownMenuItem
            className="p-2 cursor-pointer"
            onClick={e => {
              e.preventDefault(); // Prevent the default link behavior
              if (title === "Log Out") {
                logoutUser()
                  .then(() => {
                    navigate("/login");
                  })
                  .catch(error => {
                    console.error("Logout failed:", error);
                    // Handle the error, e.g., show an error message to the user
                  });
              } else {
                if (setOpen) setOpen(false);
              }
            }}
          >
            <img src={LogOut} alt="logout" className="mr-2" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserPreferences open={preferenceOpen} setOpen={setPreferenceOpen} />
    </>
  );
};

export default UserProfile;
