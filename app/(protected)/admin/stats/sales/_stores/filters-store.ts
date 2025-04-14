import { create } from 'zustand';
import { DateRange } from "react-day-picker";

interface FiltersStore {
  shopId: string | null;
  serviceId: string | null;
  workerId: string | null;
  dateRange: DateRange;
  setShop: (shopId: string | null) => void;
  setService: (serviceId: string | null) => void;
  setWorker: (workerId: string | null) => void;
  setDateRange: (range: DateRange) => void;
  resetFilters: () => void;
}

export const useFiltersStore = create<FiltersStore>((set) => ({
  shopId: null,
  serviceId: null,
  workerId: null,
  dateRange: {
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  },
  setShop: (shopId) => set({ shopId, serviceId: null, workerId: null }),
  setService: (serviceId) => set({ serviceId }),
  setWorker: (workerId) => set({ workerId }),
  setDateRange: (range) => set({ dateRange: range }),
  resetFilters: () => set({
    shopId: null,
    serviceId: null,
    workerId: null,
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    }
  })
})); 