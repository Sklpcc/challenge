"use client";

import { type OrderWithCustomer } from "~/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { OrderActions } from "./order-actions";
import { formatCurrency } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { type VariantProps } from "class-variance-authority";

const statusMap: Record<
  OrderWithCustomer["status"],
  VariantProps<typeof Badge>["variant"]
> = {
  pending: "warning",
  processing: "default",
  completed: "success",
  cancelled: "destructive",
};

export function OrderList() {
  const [orders] = api.order.getAll.useSuspenseQuery();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado el</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map((order) => (
            <TableRow key={order.id}>
              <TableCell>#{order.id}</TableCell>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell>{formatCurrency(order.total)}</TableCell>
              <TableCell>
                <Badge variant={statusMap[order.status]}>{order.status}</Badge>
              </TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <OrderActions order={order} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
