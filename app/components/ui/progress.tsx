import { cn } from "cn";
import { Progress as ProgressPrimitive } from "radix-ui";
import * as React from "react";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-muted relative flex h-1 w-full items-center overflow-x-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary size-full flex-1 [transform:translateX(calc(var(--progress-value,0%)-100%))] transition-transform"
        // The design-system linter allows inline CSS custom properties only, so
        // the dynamic width travels through `--progress-value` and not through
        // an inline `transform`.
        style={{ "--progress-value": `${value ?? 0}%` } as React.CSSProperties}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
