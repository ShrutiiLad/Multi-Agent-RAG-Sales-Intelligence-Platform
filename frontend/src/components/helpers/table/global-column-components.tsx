import EchoAvatar from "@/components/layout/dashboard/components/avatar";
import React from "react";
import defUser from "@/assets/avatar/defUser.png";
import defAvatar from "@/assets/avatar/avatar-48/1.svg";

export const dataTableValue = (value: string) => {
  return (
    <div className="text-indigo-950 text-sm font-normal font-['Test Söhne'] leading-tight">
      {value}
    </div>
  );
};

export const dataTableValueWithAvatar = (
  name: string,
  avatarUrl: string,
  type?: string
) => {
  if (!type) type = "user";
  return (
    <div className="flex items-center w-[512px] truncate space-x-2">
      <EchoAvatar
        size="small"
        mainImage={avatarUrl}
        alt={name}
        initialsFallback={type === "user" && !avatarUrl ? name : ""}
        fallbackImage={type === "user" ? defUser : defAvatar}
      />
      {dataTableValue(name)}
    </div>
  );
};

export const dataTableDateValue = (date: string) => {
  const dateValue = date || new Date();
  let dateString = "";
  if (dateValue instanceof Date) {
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    const day = String(dateValue.getDate()).padStart(2, "0");
    dateString = `${year}-${month}-${day}`;
  } else if (typeof dateValue === "string") {
    const date = new Date(dateValue);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "2-digit",
      year: "numeric",
    };
    dateString = date.toLocaleDateString("en-US", options);
  }
  return dateString;
};
