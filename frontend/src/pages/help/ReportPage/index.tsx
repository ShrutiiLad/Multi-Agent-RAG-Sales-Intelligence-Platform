// Example usage in a page or component
import React from "react";
import ReportBugForm from "@/pages/help/ReportPage/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";

const ReportPage: React.FC = () => {
  return (
    <div className="flex items-center justify-start my-4">
      <ScrollArea
        className="overflow-auto w-full"
        style={{
          maxHeight: "calc(100vh - 20px)",
          scrollbarWidth: "none",
        }}
      >
        <Card className=" border-none shadow-none w-4/5">
          <CardHeader>
            <CardTitle>Report Bug</CardTitle>
            <CardDescription>
              Here you can report about any bugs you may have encountered in the
              app. Thank you for helping us improve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportBugForm />
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
};

export default ReportPage;
