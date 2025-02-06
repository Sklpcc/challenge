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
import { OrderForm } from "./order-form";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";

export function CreateOrder() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate, isPending } = api.order.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Registrar Pedido</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registrar Pedido</DialogTitle>
        </DialogHeader>
        <OrderForm onSubmit={(data) => mutate(data)} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  );
}
