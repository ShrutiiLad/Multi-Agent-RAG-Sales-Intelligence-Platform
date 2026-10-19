"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Status = {
  value: string;
  label: string;
  icon: LucideIcon;
};

interface ComboboxPopoverAddItemProps {
  name?: string;
  initialText?: string;
  updateState: (newValue: Status | null) => void;
  statuses: Status[];
  statusesPlaceholder?: string;
  comboboxStyle?: string;
  preSelectedStatus?: Status | null;
  isDisabled?: boolean;
}
const ComboboxPopoverAddSingleItem: React.FC<ComboboxPopoverAddItemProps> = ({
  name,
  initialText = "",
  updateState,
  statuses,
  statusesPlaceholder,
  comboboxStyle = "space-x-6",
  preSelectedStatus,
  isDisabled,
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    preSelectedStatus || null
  );
  const handleChange = (newStatus: React.SetStateAction<Status | null>) => {
    setSelectedStatus(newStatus);
    updateState(newStatus as Status);
    setOpen(false);
  };

  return (
    <div className={`flex items-center ${comboboxStyle}`}>
      <p className="w-[88px] text-capitalize first-letter:uppercase font-medium text-supportCol font-Inter text-[13px]">
        {name}
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          asChild
          className="hover:text-supportCol text-supportCol"
          disabled={isDisabled}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-[150px] h-8 justify-start text-supportCol font-Inter text-[13px]"
          >
            {selectedStatus ? (
              <>
                <selectedStatus.icon
                  className={`mr-2 h-4 w-4 shrink-0 ${
                    selectedStatus.label === "Low"
                      ? "fill-supportCol"
                      : selectedStatus.label === "Very high"
                      ? "fill-supportCol"
                      : ""
                  }`}
                />
                {selectedStatus.label}
              </>
            ) : (
              <>{`+ ${initialText}`}</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            {statusesPlaceholder && (
              <CommandInput placeholder={statusesPlaceholder} />
            )}
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {statuses.map(status => (
                  <CommandItem
                    key={status.value}
                    defaultValue={
                      statuses.find(elem => elem.value === "general")?.value
                    }
                    value={status.value}
                    onSelect={value => {
                      handleChange(
                        statuses.find(priority => priority.value === value) ||
                          null
                      );
                    }}
                  >
                    <status.icon
                      className={cn(
                        "mr-2 h-4 w-4 text-supportCol",
                        status.label === "Low"
                          ? "fill-supportCol"
                          : status.label === "Very high"
                          ? "fill-supportCol"
                          : "",
                        status.value === selectedStatus?.value
                          ? "opacity-100"
                          : "opacity-40"
                      )}
                    />
                    <span>{status.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
export default ComboboxPopoverAddSingleItem;
