import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EchoAvatar from "@/components/layout/dashboard/components/avatar";
import defAvatar from "@/assets/avatar/avatar-48/1.svg";
import { Spinner } from "@/components/ui/spinner";

interface PreMessageModuleProps {
  message: string;
  agent: any;
  showSpinner?: boolean;
}

const PreMessageModule: React.FC<PreMessageModuleProps> = ({
  message,
  agent,
  showSpinner,
}) => {
  const [_, setLoading] = useState(false);
  const [errorMessage, __] = useState(false);
  const [formattedTime, ___] = useState<string>("");

  useEffect(() => {
    if (message) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [message]);

  return (
    <div className="flex gap-3 mt-6 w-[766px]">
      <div className="relative flex flex-row space-x-3 px-3">
        <div className={cn("items-center justify-center h-6 w-6 mt-1")}>
          <EchoAvatar
            size="small"
            mainImage={`${agent?.avatar}`}
            fallbackImage={defAvatar}
            alt="User"
          />
        </div>
        <div className="flex flex-col w-[714px]">
          <div className="flex flex-row items-center space-x-2">
            <span className="text-[13px] font-semibold text-selected">
              {agent?.name}
            </span>
            {errorMessage ? (
              ""
            ) : (
              <span className="w-0.5 h-0.5 bg-inactive rounded-full"></span>
            )}
            <span className="text-[13px] text-inactive">
              {errorMessage ? "" : formattedTime}
            </span>
          </div>
          {!errorMessage && !showSpinner && (
            <div>
              <ReactMarkdown
                className="text-selected text-sm prose max-w-full custom-react-markdown-dot"
                remarkPlugins={[remarkGfm]}
              >
                {message}
              </ReactMarkdown>
            </div>
          )}
          {!errorMessage && showSpinner && (
            <div className="flex items-center gap-1">
              <p className="text-supportCol font-Inter text-sm">
                Loading message...
              </p>
              <Spinner className="text-selected h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PreMessageModule;
