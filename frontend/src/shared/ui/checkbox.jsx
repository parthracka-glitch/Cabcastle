import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 !min-h-[20px] !max-h-[20px] !min-w-[20px] !max-w-[20px] shrink-0 rounded-[6px] border border-[#706B65]/40 bg-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82C4B7] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#111111] data-[state=checked]:border-[#111111] data-[state=checked]:text-white transition-all cursor-pointer",
      className
    )}
    {...props}>
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-3.5 w-3.5 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
