"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface ShopData {
  name: string;
  phone: string;
  mail: string;
  address: string;
  [key: string]: any;
}

export async function createShop(data: ShopData) {
  try {
    await db.shop.create({
      data: {
        ...data,
        userId: "placeholder-user-id", // Replace with actual user ID from auth
      },
    });
    revalidatePath("/admin/shops");
  } catch (error) {
    console.error("Failed to create shop:", error);
    throw new Error("Failed to create shop");
  }
}

export async function updateShop(id: string, data: Partial<ShopData>) {
  try {
    await db.shop.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/shops");
  } catch (error) {
    console.error("Failed to update shop:", error);
    throw new Error("Failed to update shop");
  }
}

export async function deleteShop(id: string) {
  try {
    await db.shop.delete({
      where: { id },
    });
    revalidatePath("/admin/shops");
  } catch (error) {
    console.error("Failed to delete shop:", error);
    throw new Error("Failed to delete shop");
  }
}

