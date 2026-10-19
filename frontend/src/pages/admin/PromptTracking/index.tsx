import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useEffect, useState } from "react";
import { PromptClassificationTab } from "@/pages/admin/PromptTracking/tabs/prompt-classification-tab";
import { AgentUsageTab } from "@/pages/admin/PromptTracking/tabs/agent-usage-tab";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchStatsAsync } from "@/redux/slices/adminSlice";
import { StatsData } from "@/config/models";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import ForbiddenPage from "@/pages/admin/forbidden-page";
import { DatePicker } from "@/components/layout/DatePicker";
import { InfoCard } from "@/components/layout/InfoCard";

const PromptTracking: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isNotAnAdmin, setIsNotAnAdmin] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const stats: StatsData | null = useSelector(
    (state: RootState) => state.stats.stats
  );
  const dispatch: AppDispatch = useDispatch();

  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    if (token) {
      try {
        const response = await dispatch(fetchStatsAsync(token));
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
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, token]);

  return (
    <>
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <Spinner className="mr-2 h-10 w-10 text-inactive" size="large" />
        </div>
      ) : isNotAnAdmin ? (
        <ForbiddenPage />
      ) : (
        <div className="hidden flex-col md:flex">
          <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium leading-[18px] tracking-tight">
                Prompt Tracking
              </h2>
              <div className="flex items-center space-x-2">
                <DatePicker />
                <Button
                  className="rounded-[10px] h-9"
                  onClick={() =>
                    toast({
                      title: "This feature is not available yet.",
                      description:
                        "Please check back later.",
                    })
                  }
                >
                  Download
                </Button>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              <InfoCard title="Error Rate" value="NA" percentChange="NA" />
              <InfoCard
                title="Response time"
                value={stats?.averageResponseTime ?? ""}
                percentChange="-2.3"
              />
              <InfoCard
                title="Monthly Active Users"
                value={(stats?.MAU ?? "").toString()}
                percentChange="+19"
              />
              <InfoCard
                title="Number of threads"
                value={(stats?.totalThreads ?? "").toString()}
                percentChange="+23"
              />
              <InfoCard
                title="Numer of messages"
                value={(stats?.totalMessages ?? "").toString()}
                percentChange="+300"
              />
            </div>
            <Tabs defaultValue="overview">
              <TabsList className="rounded-lg h-9 mb-4">
                <TabsTrigger value="overview" className="rounded-md h-7">
                  Prompt Classification
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-md h-7">
                  Agent Usage
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="overview"
                className="space-y-4 mt-0 w-[calc(100vw-400px)]"
              >
                <PromptClassificationTab />
              </TabsContent>
              <TabsContent value="analytics" className="space-y-4 mt-0">
                <AgentUsageTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
};

export default PromptTracking;
