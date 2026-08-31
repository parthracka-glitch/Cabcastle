import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm font-bold font-display text-[#013E37] dark:text-[#FAF7F0]",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent border-[#013E37]/20 dark:border-[#7FB8A4]/30 p-0 opacity-75 hover:opacity-100 hover:bg-[#C86A46]/10 text-[#013E37] dark:text-[#FAF7F0] rounded-full transition-all"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between",
        head_cell:
          "text-[#013E37]/60 dark:text-[#7FB8A4] w-9 font-mono font-bold text-[0.75rem] uppercase tracking-wider text-center",
        row: "flex w-full mt-1.5 justify-between",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-transparent",
          "[&:has([aria-selected].day-range-end)]:rounded-r-full",
          "[&:has([aria-selected].day-range-start)]:rounded-l-full"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-medium text-[#013E37] dark:text-[#FAF7F0] aria-selected:opacity-100 hover:bg-[#C86A46]/15 rounded-full transition-all text-xs"
        ),
        day_range_start: "!bg-[#C86A46] !text-white font-bold rounded-l-full shadow-sm",
        day_range_end: "!bg-[#C86A46] !text-white font-bold rounded-r-full shadow-sm",
        day_range_middle: "!bg-[#C86A46]/20 !text-[#013E37] dark:!text-[#FAF7F0] font-semibold !rounded-none",
        day_selected: "!bg-[#C86A46] !text-white font-bold rounded-full shadow-sm",
        day_today: "font-bold text-[#C86A46]",
        day_outside: "day-outside text-gray-300 dark:text-gray-600 aria-selected:bg-transparent",
        day_disabled: "text-gray-300 dark:text-gray-600 opacity-40 cursor-not-allowed",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props} />
  );
}
Calendar.displayName = "Calendar"

export { Calendar }
