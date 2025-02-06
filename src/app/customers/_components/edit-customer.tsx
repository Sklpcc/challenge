"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { CustomerForm } from "./customer-form";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import { type Customer } from "~/types";

interface EditCustomerProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCustomer({
  customer,
  open,
  onOpenChange,
}: EditCustomerProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate, isPending } = api.customer.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer updated successfully",
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

  const formData = {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        <CustomerForm
          initialData={formData}
          onSubmit={(data) => mutate({ id: customer.id, ...data })}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
