"use client";

import { create } from "zustand";

interface ShopStore {
  shop: {
    id: string;
  } | null;
  setShop: (shop: { id: string } | null) => void;
}

export const useShop = create<ShopStore>((set) => ({
  shop: null,
  setShop: (shop) => set({ shop })
})); 