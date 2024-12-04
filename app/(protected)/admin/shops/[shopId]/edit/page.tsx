import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ShopForm } from "../../_components/shop-form";

export default async function EditShopPage({
  params
}: {
  params: { shopId: string }
}) {
  const shop = await db.shop.findUnique({
    where: { id: params.shopId },
  });

  if (!shop) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Editar Tienda</h2>
      <ShopForm initialData={{
        id: shop.id,
        name: shop.name,
        phone: shop.phone || undefined,
        mail: shop.mail || undefined,
        address: shop.address || undefined,
        schedule: shop.schedule || undefined,
        image: shop.image || undefined
      }} />
    </div>
  );
}