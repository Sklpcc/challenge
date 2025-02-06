"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ProductForm } from "./product-form";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import { type Product } from "~/types";

interface EditProductProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProduct({ product, open, onOpenChange }: EditProductProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate, isPending } = api.product.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      onOpenChange(false);
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

  const formData = {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <ProductForm
          initialData={formData}
          onSubmit={(data) => mutate({ id: product.id, ...data })}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
