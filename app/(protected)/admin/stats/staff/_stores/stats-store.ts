import { create } from 'zustand';
import { startOfMonth } from 'date-fns';

interface StatsStore {
  shopId: string | undefined;
  month: Date;
  setShop: (shopId: string) => void;
  setMonth: (date: Date) => void;
  resetFilters: () => void;
}

export const useStatsStore = create<StatsStore>((set) => ({
  shopId: undefined,
  month: startOfMonth(new Date()),
  setShop: (shopId) => set({ shopId }),
  setMonth: (date) => set({ month: date }),
  resetFilters: () => set({
    shopId: undefined,
    month: startOfMonth(new Date())
  })
})); 