import { Suspense } from "react";
import { OrderList } from "~/app/orders/_components/order-list";
import { CreateOrder } from "~/app/orders/_components/create-order";
import { api, HydrateClient } from "~/trpc/server";

export default async function OrdersPage() {
  // Prefetch the orders query
  await api.order.getAll.prefetch();

  return (
    <HydrateClient>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <CreateOrder />
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <OrderList />
      </Suspense>
    </div>
    </HydrateClient>
  );
}
