"use client";

import { useState, ReactNode } from "react";
import { DateRangeContext, defaultDateRange } from "@/hooks/use-date-range";
import { DateRange } from "@/types/metrics";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      <TooltipProvider>{children}</TooltipProvider>
    </DateRangeContext.Provider>
  );
}
