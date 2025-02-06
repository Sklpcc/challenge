"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import { type OrderWithCustomer } from "~/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { useState } from "react";

interface UpdateOrderStatusProps {
  order: OrderWithCustomer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statuses = ["pending", "processing", "completed", "cancelled"] as const;

export function UpdateOrderStatus({
  order,
  open,
  onOpenChange,
}: UpdateOrderStatusProps) {
  const [status, setStatus] = useState<(typeof statuses)[number]>(order.status);
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate, isPending } = api.order.updateStatus.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order status updated successfully",
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Estado del Pedido</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            disabled={isPending}
            onValueChange={(value) =>
              setStatus(value as (typeof statuses)[number])
            }
            value={status}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="w-full"
            disabled={isPending || status === order.status}
            onClick={() => mutate({ id: order.id, status })}
          >
            {isPending ? "Actualizando..." : "Actualizar Estado"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
