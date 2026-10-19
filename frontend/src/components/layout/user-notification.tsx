import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUpdatesAsync,
  markUpdateAsReadById,
  markUpdatesAsRead,
} from "@/redux/slices/supportSlice";
import ReadNotif from "@/assets/sidebar/ReadNotif.svg";
import ActiveNotif from "@/assets/sidebar/ActiveNotif.svg";
import RedDot from "@/assets/sidebar/RedDot.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppDispatch, RootState } from "@/redux/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { login } from "@/redux/slices/authSlice";
import {
  markAllUpdatesAsRead,
  markUpdateAsRead,
} from "@/services/support/updates";
import { CheckCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Notification {
  id: number;
  title: string;
  description: string;
  primaryLink?: string | null;
  secondaryLink?: string | null;
}

//TODO: Use user notification props. Fetch and set the notifications in the side-nav component and send the list to this component. every time the user clicks on notifications, we trigger an api call to add new notifications if there's any.
// interface UserNotificationProps {
//  notifications: Notification[];
// }

const UserNotification = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { updates, loading, error, hasUnreadNotif } = useSelector(
    (state: RootState) => state.support
  );
  const token = useSelector((state: RootState) => state.auth.token);
  const userDataRedux = useSelector((state: RootState) => state.auth.user);
  const userData = localStorage.getItem("userData");

  useEffect(() => {
    if (token) {
      dispatch(fetchUpdatesAsync(token));
      if (userDataRedux === null && userData !== null) {
        dispatch(login({ token: token, user: JSON.parse(userData) }));
      }
    }
  }, [token, dispatch, userData, userDataRedux, isOpen]);

  const handleMenuToggle = () => setIsOpen(!isOpen);

  const handleReadAllMessages = async () => {
    if (!hasUnreadNotif) return;
    if (!token) return;
    try {
      const response = await markAllUpdatesAsRead(token);
      if (!response) {
        throw new Error("Invalid response");
      }
      if ("success" in response && !response.success) {
        throw new Error(response.error);
      }
      console.log("Cleared Notifications");
      dispatch(markUpdatesAsRead());
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  // if (loading) return <div className="text-xs">Loading notifications...</div>;
  // if (error)
  //   return <div className="text-xs">Error fetching notifications: {error}</div>;

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleMenuToggle}>
      <DropdownMenuTrigger>
        <div
          className={`relative flex justify-center items-center h-10 w-10 cursor-pointer hover:bg-navbarHoverBg rounded-10 ${
            isOpen ? "bg-navbarHoverBg" : ""
          }`}
        >
          {Array.isArray(updates) &&
            updates.length > 0 &&
            hasUnreadNotif &&
            !isOpen && (
              <img src={RedDot} className="absolute top-[10px] right-[10px]" />
            )}
          <img src={isOpen ? ActiveNotif : ReadNotif} alt="Notifications" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onCloseAutoFocus={e => e.preventDefault()}
        className="relative ml-16 w-80 p-0 rounded-[10px] top-11"
      >
        <DropdownMenuLabel className="p-0 cursor-default">
          <div className="flex items-center px-4 py-3">
            <span className="small-text text-selected font-medium">
              Notifications
            </span>

            <div
              className={`mr-auto ml-2 flex flex-col items-center justify-center h-5 w-5 text-[13px] leading-5 rounded light-border text-supportCol ${
                Array.isArray(updates) &&
                (updates.length == 0 || loading) &&
                "hidden"
              }`}
            >
              {Array.isArray(updates) && updates.length}
            </div>
            {Array.isArray(updates) && updates.length > 0 && (
              <span
                className={`ml-auto text-supportCol cursor-pointer small-text font-normal hover:text-selected ${
                  loading && "hidden"
                }`}
                onClick={handleReadAllMessages}
              >
                Mark all as read
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />

        <ScrollArea className="w-80 max-h-[328px] bg-white rounded-lg flex-col justify-center items-start inline-flex">
          {loading ? (
            <NotificationItem
              title={"Loading Notification"}
              description={"Please wait while notification are loading!"}
              isRead={true}
              notifId={""}
            />
          ) : error ? (
            <NotificationItem
              title={"Error fetching notifications"}
              description={error}
              isRead={true}
              notifId={""}
            />
          ) : Array.isArray(updates) && updates.length == 0 ? (
            <NotificationItem
              title={`You're All Caught Up !`}
              description={`While you're here, why not help us improve? Share your feedback with us.`}
              isRead={true}
              notifId={""}
              primaryLink="/help/report"
            />
          ) : (
            Array.isArray(updates) &&
            updates.map((notif, index) => (
              <NotificationItem
                key={index}
                title={notif.title}
                description={notif.description}
                primaryLink={notif.primaryLink}
                secondaryLink={notif.secondaryLink}
                isRead={notif.is_read}
                notifId={notif.id}
              />
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface NotificationItemProps {
  index?: number;
  title: string;
  description: string;
  isRead: boolean;
  notifId: string;
  primaryLink?: string;
  secondaryLink?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  index,
  title,
  description,
  isRead,
  notifId,
  primaryLink,
  secondaryLink,
}) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();

  const handleReadMessage = async (id: string) => {
    if (!token) return;
    try {
      const response = await markUpdateAsRead(token, id);
      if (!response) {
        throw new Error("Invalid response");
      }
      if ("success" in response && !response.success) {
        throw new Error(response.error);
      }
      console.log("Cleared Specific Notification");
      dispatch(markUpdateAsReadById(id));
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  return (
    <DropdownMenuItem
      key={index || 0}
      className={`group rounded-[6px] cursor-pointer p-3 m-1 ml-0.5 ${
        !isRead && "bg-[#f5f5f5]"
      }`}
      onClick={e => e.preventDefault()}
    >
      <Card className=" relative m-0 border-none bg-transparent shadow-none w-full flex flex-col gap-2 text-selected">
        {!isRead && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CheckCheck
                  size={14}
                  className="hidden text-[#8c9eab] group-hover:block hover:text-black absolute top-0 right-0"
                  onClick={() => handleReadMessage(notifId)}
                />
              </TooltipTrigger>
              <TooltipContent>
                <span>Mark as Read</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <CardHeader className="p-0 flex flex-row items-center">
          <CardTitle className="small-text font-medium tracking-normal">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <span className="text-sm">{description}</span>
        </CardContent>
        <CardFooter className="flex gap-1 p-0 text-sm">
          {primaryLink && (
            <a
              href={primaryLink}
              target="_blank"
              onClick={e => e.stopPropagation()}
            >
              <span className="underline">Take me there</span>
            </a>
          )}
          {secondaryLink && (
            <div className="flex gap-1">
              <span>or</span>
              <a
                href={secondaryLink}
                target="_blank"
                onClick={e => e.stopPropagation()}
              >
                <span className="underline">Learn more</span>
              </a>
            </div>
          )}
        </CardFooter>
      </Card>
    </DropdownMenuItem>
  );
};

export default UserNotification;
