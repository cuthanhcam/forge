import type { JSX, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/shared/lib/cn";

interface TooltipProps {
  children: ReactNode;
  className?: string;
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({
  children,
  className,
  content,
  side = "right",
}: TooltipProps): JSX.Element {
  return (
    <TooltipPrimitive.Provider delayDuration={250} skipDelayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <div className="pointer-events-none">
            <TooltipPrimitive.Content
              className={cn(
                "z-50 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 shadow-lg shadow-slate-950/10 outline-none data-[side=bottom]:animate-in data-[side=bottom]:slide-in-from-top-1 data-[side=left]:animate-in data-[side=left]:slide-in-from-right-1 data-[side=right]:animate-in data-[side=right]:slide-in-from-left-1 data-[side=top]:animate-in data-[side=top]:slide-in-from-bottom-1",
                className,
              )}
              side={side}
              sideOffset={8}
            >
              {content}
              <TooltipPrimitive.Arrow className="fill-white" />
            </TooltipPrimitive.Content>
          </div>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
