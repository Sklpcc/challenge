"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { OrderForm } from "./order-form";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import { type OrderWithCustomer } from "~/types";

interface EditOrderProps {
  order: OrderWithCustomer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOrder({ order, open, onOpenChange }: EditOrderProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const { data: orderDetails } = api.order.getById.useQuery(order.id, {
    enabled: open,
  });

  const { mutate, isPending } = api.order.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      onOpenChange(false);
      void utils.order.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!orderDetails && open) {
    return null;
  }

  const formData = orderDetails
    ? {
        customerId: orderDetails.customerId,
        products: orderDetails.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Pedido</DialogTitle>
        </DialogHeader>
        <OrderForm
          initialData={formData}
          onSubmit={(data) => mutate({ id: order.id, ...data })}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
