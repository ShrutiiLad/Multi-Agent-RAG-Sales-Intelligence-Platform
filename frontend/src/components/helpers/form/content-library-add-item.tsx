"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";

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
  updateState: (newValue: Status[] | null) => void;
  statuses: Status[];
  statusesPlaceholder?: string;
  comboboxStyle?: string;
  preSelectedStatus?: Status[] | null;
  isDisabled?: boolean;
}
const ComboboxPopoverAddItem: React.FC<ComboboxPopoverAddItemProps> = ({
  name,
  initialText = "",
  updateState,
  statuses,
  statusesPlaceholder,
  comboboxStyle = "",
  preSelectedStatus,
  isDisabled,
  // "space-x-6",
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status[] | null>(
    preSelectedStatus || null
  );
  const handleChange = (newStatus: Status | null) => {
    if (newStatus === null) {
      return;
    }
    setSelectedStatus([newStatus]);
    updateState([newStatus]);
    setOpen(false);
  };

  const handleRemoveChip = (newStatus: React.SetStateAction<Status | null>) => {
    const filteredList = selectedStatus?.filter(status => {
      if (
        typeof newStatus === "object" &&
        newStatus !== null &&
        status.value === newStatus.value
      ) {
        return false;
      }
      return true;
    });
    setSelectedStatus(filteredList || [...(selectedStatus || [])]);
  };

  return (
    <div
      className={`grid grid-cols-[88px_minmax(100px,1fr)] place-items-center justify-items-start gap-x-[31px] gap-y-1`}
      key={name}
    >
      <div className={`flex items-center ${comboboxStyle}`}>
        <p className="flex-1 text-capitalize first-letter:uppercase text-supportCol font-medium font-Inter text-[13px]">
          {name}
        </p>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={isDisabled}>
          <Button
            variant="ghost"
            size="sm"
            className=" h-8 text-supportCol font-Inter text-[13px]"
          >
            <>{`+ ${initialText}`}</>
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
                {statuses.map((status, key) => (
                  <CommandItem
                    key={key}
                    value={status.value}
                    onSelect={value => {
                      handleChange(
                        statuses.find(priority => priority.value === value) ||
                          null
                      );
                    }}
                  >
                    <span>{status.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div
        className="flex flex-wrap justify-start gap-2 whitespace-nowrap col-start-2"
        style={{ maxWidth: "200px" }}
      >
        {selectedStatus &&
          selectedStatus?.map((item, key) => (
            <div className="flex flex-row flex-wrap" key={key}>
              <Button
                variant="outline"
                className="text-selected text-[13px] font-Inter leading-tight rounded-lg px-2 py-1.5 h-8"
                disabled={isDisabled}
                onClick={() => {
                  handleRemoveChip(item);
                }}
              >
                <p className="text-transform: capitalize">{item?.value}</p>
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
};
export default ComboboxPopoverAddItem;
