"use client";

import { createContext, useContext } from "react";
import { subDays } from "date-fns";
import { DateRange } from "@/types/metrics";

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const DateRangeContext = createContext<DateRangeContextType>({
  dateRange: {
    from: subDays(new Date(), 30),
    to: new Date(),
  },
  setDateRange: () => {},
});

export function useDateRange() {
  return useContext(DateRangeContext);
}

export const defaultDateRange: DateRange = {
  from: subDays(new Date(), 30),
  to: new Date(),
};
