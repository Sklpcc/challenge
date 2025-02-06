"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import { type OrderWithCustomer } from "~/types";

interface DeleteOrderProps {
  order: OrderWithCustomer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteOrder({ order, open, onOpenChange }: DeleteOrderProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate, isPending } = api.order.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order deleted successfully",
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Estas seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no puede ser revertida. El pedido #${order.id} del
            cliente <span className="font-medium">{order.customer.name}</span>{" "}
            se eliminará permanentemente y se perderá toda su información.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => mutate(order.id)}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
