import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { DataTable } from "@/components/helpers/data-table";
import { columnsUser as columns } from "@/components/helpers/table/columns/users-columns";
import { DataTableColumnHeader } from "@/components/helpers/table/data-table-column-header";
import { DataTableRowActions } from "@/components/helpers/table/data-table-row-actions";

import { Profie, User } from "@/config/models";
import { fetchUsers } from "@/redux/slices/adminSlice";
import { _agents, _users } from "@/components/helpers/table/data-table-toolbar";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import ForbiddenPage from "@/pages/admin/forbidden-page";

const UsersDirectory: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const users = useSelector((state: RootState) => state.admin.users);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotAnAdmin, setIsNotAnAdmin] = useState(false);
  const [hasRanOnce, setHasRanOnce] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  //  id: number;
  // avatar: string | null;
  // userName: string;
  // email: string;
  // profile: Profie;
  // last_login: string | null;
  // is_superuser: boolean;
  // username: string;
  // first_name: string;
  // last_name: string;
  // is_staff: boolean;
  // is_active: boolean;
  // date_joined: string;
  // groups: any[];
  // user_permissions: any[];

  const transformUsers = (
    users: User[]
  ): {
    id: number;
    userName: string;
    profile: Profie;
    email: string;
    is_superuser: boolean;
    date_joined: string;
    avatar: string | null;
  }[] => {
    return users.map(user => ({
      id: user.id,
      userName: user.username,
      profile: user.profile,
      email: user.email,
      is_superuser: user.is_superuser,
      date_joined: user.date_joined,
      avatar: user.avatar,
    }));
  };

  const transformedUsers = transformUsers(users);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        if (hasRanOnce) return;
        try {
          const response = await dispatch(fetchUsers(token));
          if (response?.payload === "Forbidden Access: Not an admin") {
            toast({
              variant: "destructive",
              title: "403",
              description: response?.payload,
            });
            setIsNotAnAdmin(true);
            navigate("/chat");
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "An error occurred while fetching stats",
          });
        } finally {
          setIsLoading(false);
          setHasRanOnce(true);
        }
      }
    };
    fetchData();
  }, [dispatch, token]);

  const getColumnWithDelete = () => {
    const deleteColumn = {
      id: "delete",
      accessorKey: "delete",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }: { row: any }) => (
        <div className="w-12">
          <DataTableRowActions
            row={row}
            selectedRowId={() => 0}
            setConfirmDialogOpen={() => 0}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    };
    return [...columns, deleteColumn];
  };

  return (
    <>
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <Spinner className="mr-2 h-10 w-10 text-inactive" size="large" />
        </div>
      ) : isNotAnAdmin ? (
        <ForbiddenPage />
      ) : (
        <div className="hidden flex-1 flex-col md:flex p-6 pb-0 h-full overflow-auto">
          <DataTable
            header="Users directory"
            tableType={_users}
            data={transformedUsers as User[]}
            columns={getColumnWithDelete()}
            filterFrom="email"
          />
        </div>
      )}
    </>
  );
};

export default UsersDirectory;
