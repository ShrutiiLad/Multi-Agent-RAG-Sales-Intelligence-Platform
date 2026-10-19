import React from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const InfoCard = ({
  title,
  value,
  percentChange,
}: {
  title: string;
  value: string;
  percentChange: string;
}) => {
  return (
    <Card className="h-[116px] p-6">
      <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
        <CardTitle className="text-sm font-medium leading-[14px]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-medium leading-[22px] pb-2">{value}</div>
        <p className="text-sm text-supportCol leading-[14px] font-normal">
          {percentChange}% from last month
        </p>
      </CardContent>
    </Card>
  );
};
