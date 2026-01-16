import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const IndeterminateProgress = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={cn(
            "relative h-1 w-full overflow-hidden rounded-full",
            className
        )}
        {...props}
    >
        <ProgressPrimitive.Indicator
            className="h-full w-1/3 bg-border animate-indeterminate-progress transition-all"
        />
    </ProgressPrimitive.Root>
))
IndeterminateProgress.displayName = "IndeterminateProgress"

export { IndeterminateProgress }
