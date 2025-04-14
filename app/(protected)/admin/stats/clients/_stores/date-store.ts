import { DateRange } from "react-day-picker";
import { create } from 'zustand';

interface DateStore {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  resetDateRange: () => void;
}

export const useDateStore = create<DateStore>((set) => ({
  dateRange: {
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primer día del mes actual
    to: new Date(),
  },
  setDateRange: (range) => set({ dateRange: range }),
  resetDateRange: () => set({
    dateRange: {
      from: undefined,
      to: undefined,
    }
  }),
})); 