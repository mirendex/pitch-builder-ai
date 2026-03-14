import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-none rounded-[24px] border border-card bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-32 sm:rounded-3xl",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
