import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Bot } from "@/config/models";
import { useDialogue } from "@/hooks/useDialogue";
import { Link } from "react-router-dom";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { FaCircleXmark } from "react-icons/fa6";
import { useState } from "react";
import { Select, SelectItem } from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { MultiStepForm } from "@/components/layout/ai-agent/create/new-agent";
import defAvatar from "@/assets/avatar/avatar-48/1.svg";

import Search from "@/assets/Search.svg";
import EditPen from "@/assets/Edit.svg";
import EchoAvatar from "@/components/layout/dashboard/components/avatar";
import { set } from "date-fns";

interface ModelDialogueProps {
  bots: Bot[];
  onModelSelect: (bot: Bot) => void;
}

export function ModelDialogue({ bots, onModelSelect }: ModelDialogueProps) {
  const { isOpen, onClose } = useDialogue();
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedType, setSelectedType] = useState("discover");
  const [showNewAIAgentForm, setShowNewAIAgentForm] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dialogClasses, setDialogClasses] = useState("");

  const handleModelClick = (bot: Bot) => {
    onModelSelect(bot); // Use the passed callback function
    onClose(); // Optionally, close the dialogue after selection
  };

  // Step  2: Filter models based on search filter
  const filteredModels = bots.filter(
    bot =>
      (!bot.disabled && bot.name.toLowerCase().includes(searchFilter.toLowerCase()) || (bot.description && bot.description.toLowerCase().includes(searchFilter.toLowerCase()))) && (selectedType === "discover" || bot.category === selectedType)
  );

  function capitalizeFirstLetter(string: string) {
    return string
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function EditBotModal() {
    return (
      <div className=" justify-self-start">
        <div
          className={`h-7 w-7 group-hover:flex group-hover:bg-white items-center justify-center rounded-full ${isOpen ? "flex bg-navbarHoverBg" : "hidden"
            }`}
        >
          <Link to="/chat">
            <img src={EditPen} alt="Edit Icon" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  function createNewAIAgent() {
    return (
      <Dialog open={showNewAIAgentForm}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="m-2 w-[224px] p-0 border border-lightBackground "
            onClick={() => setShowNewAIAgentForm(true)}
          >
            <span className="px-4 py-2 text-[13px] font-normal text-supportCol radius-6 ">
              Create an AI agent
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent
          className={dialogClasses}
          closeDialog={() => { if (currentStep == 1) setCurrentStep(0); else setShowNewAIAgentForm(false), setCurrentStep(0); }}
          onInteractOutside={e => {
            e.preventDefault();
          }}
        >
          <MultiStepForm
            closeDialog={() => { setShowNewAIAgentForm(false), setCurrentStep(0); }}
            setDialogClasses={setDialogClasses}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            type="create"
          />
        </DialogContent>
      </Dialog>
    );
  }
  function BotCard(bot: Bot) {
    return (!bot.disabled &&
      <div
        key={bot.id}
        className={`group flex flex-col bg-white h-[176px] w-[240px] border-lightBackground border hover:bg-veryLightBackground rounded-10 p-4 cursor-pointer`}
        onClick={() => handleModelClick(bot)}
      >
        <div className="flex justify-between pb-3">
          <EchoAvatar
            size="large"
            mainImage={`${bot?.avatar}`}
            fallbackImage={defAvatar}
            alt="Chat Logo"
            radius="large"
          />
          {/* <img
            src={MEDIA_URL + bot?.avatar || defAvatar}
            alt="Chat Logo"
            className="h-[70px] w-[70px]"
          /> */}
          <EditBotModal />
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row">
            <span className="text-sm font-medium text-selected mb-1 truncate">
              {bot.name}
            </span>
          </div>
          <span className="text-supportCol text-sm text-ellipsis line-clamp-3">
            {bot.description}
          </span>
        </div>
      </div>
    );
  }

  function withWrapper(): any {
    return (
      <Dialog onOpenChange={onClose} open={isOpen} modal defaultOpen={isOpen}>
        <DialogContent
          className="flex flex-col max-w-[1040px]"
          onInteractOutside={e => {
            e.preventDefault();
          }}
        >
          {mainContent()}
        </DialogContent>
      </Dialog>
    );
  }

  function countBotsInCategory(category: string | null): number {
    let count = 0;
    if (category == null) return count;

    bots.forEach(bot => {
      if (bot.category === category) count++;
    });

    // Return the count of bots in the specified category
    return count;
  }

  // TODO: Deployment

  function mainContent(): any {
    return (
      <div className="m-0 p-0">
        <div className="px-4 py-2 flex justify-between items-center border-b border-solid border-lightBackground">
          <p className="medium-text text-selected font-medium ">
            Explore Agents
          </p>
          <div className="h-9 w-9 rounded-lg "></div>
        </div>
        {/* <Separator className="-my-4" /> */}
        <div className="relative flex flex-row">
          <div className="flex flex-col w-[240px] border-r border-lightBackground items-center">
            <div className="w-full p-2">
              <div className="relative flex justify-center items-center h-9 py-2 px-3 rounded-lg bg-lightBackground font-Inter text-supportCol">
                {/* <Search className="absolute top-0 bottom-0 w-4 h-4 my-auto text-supportCol left-5" /> */}
                <img src={Search} alt="Search Icon" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchFilter}
                  onChange={event => setSearchFilter(event.target.value)}
                  className=" text-[13px] placeholder:text-supportCol bg-transparent font-[450] pt-[7px]"
                />
                {searchFilter && (
                  <FaCircleXmark
                    className=" text-supportCol cursor-pointer"
                    onClick={() => setSearchFilter("")}
                  />
                )}
              </div>
            </div>
            <div className="w-full h-[484px] p-2 flex flex-col gap-[2px]">
              <Select defaultValue="discover" onValueChange={setSelectedType}>
                {" "}
                {/* Step  3: Update selected type state on change */}
                <SelectItem
                  value="discover"
                  defaultChecked
                  className={`w-full relative px-3 py-2 h-9 rounded-10 hover:bg-lightBackground focus:bg-inherit hover:focus:bg-lightBackground cursor-pointer  ${selectedType === "discover"
                    ? "bg-selected hover:bg-selected focus:bg-selected hover:focus:bg-selected focus:text-white text-white"
                    : "text-selected"
                    } `}
                >
                  <div className="flex justify-between w-full items-center">
                    <span className="small-text">Discover</span>
                    <span
                      className={`ml-auto absolute right-3 flex items-center justify-center h-5 w-5 text-[13px] rounded light-border  ${selectedType === "discover"
                        ? "text-white"
                        : "text-supportCol"
                        }`}
                    >
                      {bots.length}
                    </span>
                  </div>
                </SelectItem>
                {Array.from(new Set(bots.map(bot => bot.category))).map(
                  type => (
                    <SelectItem
                      key={type}
                      value={type || "discover"}
                      className={`px-3 relative py-2 h-9 rounded-10 hover:bg-lightBackground focus:bg-inherit hover:focus:bg-lightBackground cursor-pointer ${selectedType === type
                        ? "bg-selected hover:bg-selected focus:bg-selected hover:focus:bg-selected focus:text-white text-white"
                        : "text-selected"
                        }`}
                    >
                      <div className="flex w-full items-center">
                        <span className="small-text">
                          {capitalizeFirstLetter(type || "discover")}{" "}
                        </span>
                        <span
                          className={`ml-auto absolute right-3 flex items-center justify-center h-5 w-5 text-[13px] rounded light-border ${selectedType === type
                            ? " text-white"
                            : " text-supportCol "
                            }`}
                        >
                          {countBotsInCategory(type)}
                        </span>
                      </div>
                    </SelectItem>
                  )
                )}
              </Select>
            </div>

            {createNewAIAgent()}
          </div>
          <ScrollArea className="grow rounded-md p-4 overflow-auto w-[792px] h-[588px]">
            <div className="header flex flex-col">
              {filteredModels.length > 0 && !searchFilter && (
                <div className="flex flex-col gap-1 justify-center">
                  <span className="font-medium medium-text text-selected">
                    {" "}
                    {capitalizeFirstLetter(selectedType)}
                  </span>
                  <span className="text-supportCol text-sm">
                    List of AI Agents
                  </span>
                </div>
              )}
              {filteredModels.length > 0 && searchFilter && (
                <div>
                  <span className="font-medium text-sm text-selected">
                    Results for “{searchFilter}”
                  </span>
                  <span className=" block pt-1 text-xs text-inactive">
                    {filteredModels.length} AI Agents
                  </span>
                </div>
              )}
              {filteredModels.length === 0 && searchFilter ? (
                <div className="text-supportCol text-center text-[13px] mt-2">
                  No AI Agent found
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {filteredModels.map(model => BotCard(model))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }
  return withWrapper();
}
