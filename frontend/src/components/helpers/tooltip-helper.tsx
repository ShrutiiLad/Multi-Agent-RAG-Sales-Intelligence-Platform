import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipHelperProps {
  children: React.ReactNode;
  content: string;
}

const TooltipHelper: React.FC<TooltipHelperProps> = ({ children, content }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="dark">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipHelper;

// USE EXAMPLE:
{
  /* <TooltipHelper content="Add to library">
    <Button variant="outline">Hover</Button>
</TooltipHelper> */
}
