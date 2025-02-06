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
import { type Customer } from "~/types";

interface DeleteCustomerProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCustomer({
  customer,
  open,
  onOpenChange,
}: DeleteCustomerProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate, isPending } = api.customer.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      onOpenChange(false);
      void utils.customer.getAll.invalidate();
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
          <AlertDialogTitle>Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no puede ser revertida. El cliente{" "}
            <span className="font-medium">{customer.name}</span> se eliminará
            permanentemente y se perderá toda su información.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => mutate(customer.id)}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
