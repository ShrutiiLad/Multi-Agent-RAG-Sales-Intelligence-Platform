import React from "react";
import { format } from "date-fns";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CalendarIcon from "@/assets/calendar.svg";
import { Calendar } from "@/components/ui/calendar";

export const DatePicker = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const handleChangeDate = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[245px] justify-start text-left rounded-[10px] font-medium h-9 text-[13px]",
            !date && "text-muted-foreground"
          )}
        >
          <img src={CalendarIcon} alt="" className="mr-2 h-5 w-5" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleChangeDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
