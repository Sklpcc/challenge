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
import { ProductForm } from "./product-form";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";

export function CreateProduct() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate, isPending } = api.product.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setOpen(false);
      void utils.product.getAll.invalidate();
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
        <Button>Crear Producto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Producto</DialogTitle>
        </DialogHeader>
        <ProductForm onSubmit={(data) => mutate(data)} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  );
}
