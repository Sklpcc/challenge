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
import { type Product } from "~/types";

interface DeleteProductProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProduct({
  product,
  open,
  onOpenChange,
}: DeleteProductProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate, isPending } = api.product.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully",
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Estas seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no puede ser revertida. El producto{" "}
            <span className="font-medium">{product.name}</span> se eliminará
            permanentemente y se perderá toda su información.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => mutate(product.id)}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
