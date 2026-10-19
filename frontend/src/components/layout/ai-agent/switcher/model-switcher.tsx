import { useDispatch, useSelector } from "react-redux";
import { setSelectedBot } from "@/redux/slices/modelSlice"; // Adjust the import path as necessary
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Bot } from "@/config/models";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "@/redux/store";
import TooltipHelper from "@/components/helpers/tooltip-helper";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ModelDialogue } from "@/components/layout/ai-agent/switcher/model-modal";
import { useDialogue } from "@/hooks/useDialogue";
import React from "react";
import EditPen from "@/assets/Edit.svg";
import defAvatar from "@/assets/avatar/avatar-48/1.svg";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useNavigate } from "react-router-dom";
import EchoAvatar from "@/components/layout/dashboard/components/avatar";
import FallbackAvatar1 from "@/assets/avatar/avatar-20/2.svg";
import FallbackAvatar2 from "@/assets/avatar/avatar-20/3.svg";
import FallbackAvatar3 from "@/assets/avatar/avatar-20/4.svg";
import { Skeleton } from "@/components/ui/skeleton";

interface BotSwitcherProps {
  isCollapsed: boolean;
  bots: Bot[];
  boxShadow?: boolean;
}

export function BotSwitcher({ bots, boxShadow }: BotSwitcherProps) {
  const dispatch: AppDispatch = useDispatch();
  const selectedBot = useSelector(
    (state: RootState) => state.model.selectedBot
  );

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!selectedBot?.id && bots.length > 0) {
      dispatch(setSelectedBot(bots[0]));
    }
  }, [dispatch, bots, selectedBot]);

  const handleModelChange = (value: string) => {
    // localStorage.setItem("selectedConversation", "");
    const model = bots.find(bot => bot.id === value);
    if (model) {
      dispatch(setSelectedBot(model));
    }
    navigate("/chat");
  };

  const onModelSelect = (bot: Bot) => {
    handleModelChange(bot.id);
  };

  const handleMenuToggle = () => setIsOpen(!isOpen);

  const getFirstFiveBots = () => {
    const gptThreeFive = bots.find(
      bot =>
        bot.name.trim().replace(/\s/g, "") === "GPT3.5-Turbo" && !bot.disabled
    );
    const gptFour = bots.find(
      bot => bot.name.trim().replace(/\s/g, "") === "GPT4-T" && !bot.disabled
    );

    const firstTwoBots: Bot[] = [];
    if (gptThreeFive) firstTwoBots.push(gptThreeFive);
    if (gptFour) firstTwoBots.push(gptFour);

    const nextBots: Bot[] = bots
      .filter(bot => !bot.disabled && !firstTwoBots.includes(bot))
      .slice(0, 5 - firstTwoBots.length);

    return [...firstTwoBots, ...nextBots];
  };

  const firstFiveBots = getFirstFiveBots();

  const nextThreeBots = bots
    .filter(bot => !bot.disabled && !firstFiveBots.includes(bot))
    .slice(0, 3);

  return (
    <div
      className={`flex p-4 ${
        boxShadow && "shadow-[0_2px_12px_0px_rgba(0,0,0,0.10)]"
      }`}
    >
      <Select
        defaultValue={selectedBot?.id}
        onValueChange={handleModelChange}
        open={isOpen}
        onOpenChange={handleMenuToggle}
      >
        {!selectedBot ? (
          <div className="flex h-12 items-center justify-center space-x-4 px-2">
            <Skeleton className="h-8 w-8 rounded-[8px]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center rounded-[10px] hover:bg-[#FAFAFA] w-full ${
              isOpen && " bg-navbarHoverBg"
            }`}
          >
            <TooltipHelper content="Select an agent">
              <SelectTrigger
                className="flex h-12 mr-2 bg-transparent text-[selected] [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0"
                aria-label="Select model"
              >
                <div className="flex items-center overflow-hidden">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 bg-transparent rounded font-bold text-inactive">
                      <EchoAvatar
                        size="medium"
                        mainImage={`${selectedBot?.avatar}`}
                        fallbackImage={defAvatar}
                        alt="BM"
                        radius="small"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="w-[126px] text-[14px] leading-4 truncate font-medium text-left text-selected font-Kraftig">
                        {truncateTitle(selectedBot?.name ?? "")}
                      </span>
                      <span className="text-[13px] leading-[15px] text-lightText text-left truncate">
                        {truncateTitle(selectedBot?.category ?? "")}
                      </span>
                    </div>
                  </div>
                </div>
              </SelectTrigger>
            </TooltipHelper>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/chat">
                    <div className="mr-2 h-7 w-7 bg-[#FAFAFA] flex items-center justify-center rounded-full">
                      <img src={EditPen} alt="Edit Icon" className="w-4 h-4" />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="bg-selected text-white mb-4">
                  <p>Start new chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        <SelectContent className="w-[248px] max-h-[300px] rounded-10 p-0 m-0 mt-1">
          {firstFiveBots.map(bot => (
            <SelectItem
              key={bot.id}
              value={bot.id}
              content={bot.name}
              disabled={bot?.disabled}
              className="p-0 m-0"
            >
              {botCard(bot)}
            </SelectItem>
          ))}
          <div className="w-60 h-[1px] my-1 bg-lightBackground"></div>

          {ExploreButton(nextThreeBots, setIsOpen)}
        </SelectContent>
      </Select>
    </div>
  );

  function ExploreButton(
    nextThreeBots: Bot[],
    setIsOpen: (arg0: boolean) => void
  ) {
    const { onOpen } = useDialogue();

    const fallbackAvatar = [FallbackAvatar1, FallbackAvatar2, FallbackAvatar3];

    const onExploreMoreClick = () => {
      setIsOpen(false);
      onOpen();
    };

    return (
      <Dialog>
        <DialogTrigger
          className="w-full hover:bg-selectedBg rounded-6 p-2"
          onClick={onExploreMoreClick}
        >
          <div className="w-full text-left align-middle flex flex-row items-center justify-start space-x-2">
            <span className="flex -space-x-[14px]">
              {fallbackAvatar.map((avatar, index) => {
                return (
                  <span key={index}>
                    <EchoAvatar
                      size="mini"
                      mainImage={nextThreeBots[index]?.avatar}
                      fallbackImage={avatar}
                      alt="BM"
                      radius="small"
                    />
                    {/* <span>
                      <Search className="w-3 h-3 m-1 rounded-md text-inactive" />
                    </span> */}
                  </span>
                );
              })}
            </span>
            <span className="small-text font-medium text-selected">
              Explore all agents
            </span>
          </div>
        </DialogTrigger>
        <ModelDialogue bots={bots} onModelSelect={onModelSelect} />
      </Dialog>
    );
  }

  function truncateTitle(title: string) {
    return title.length > 20 ? title.substring(0, 20) + "..." : title;
  }

  function botCard(bot: Bot) {
    return (
      <div className="group flex items-center overflow-hidden cursor-pointer gap-2 h-[48px] p-2 rounded-6">
        <div className="flex items-center justify-center h-8 w-8 bg-transparent rounded-sm">
          {/* {bot.name.substring(0, 2).toUpperCase()} */}
          <EchoAvatar
            size="medium"
            mainImage={`${bot?.avatar}`}
            fallbackImage={defAvatar}
            alt="BM"
            radius="small"
          />
        </div>
        <div className="flex flex-col">
          <span className="w-[146px] text-[14px] leading-4 truncate font-medium text-left text-selected">
            {truncateTitle(bot.name)}
          </span>
          <span className="w-[146px] text-[13px] leading-[15px] text-lightText text-left text-ellipsis">
            {bot.category}
          </span>
        </div>
        <div className="h-7 w-7 bg-white group-hover:flex hidden items-center justify-center rounded-full">
          <img src={EditPen} alt="Edit Icon" className="w-4 h-4" />
        </div>
      </div>
    );
  }
}
