"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { CustomerForm } from "./customer-form";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";

export function CreateCustomer() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate, isPending } = api.customer.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear Cliente</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Cliente</DialogTitle>
        </DialogHeader>
        <CustomerForm onSubmit={(data) => mutate(data)} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  );
}
