"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

const formSchema = z.object({
  customerId: z.coerce.number().optional().default(0),
  products: z.array(
    z.object({
      productId: z.coerce.number().optional().default(0),
      quantity: z.coerce.number().int().positive(),
    }),
  ),
});

type OrderFormValues = z.infer<typeof formSchema>;

interface OrderFormProps {
  initialData?: OrderFormValues;
  onSubmit: (data: OrderFormValues) => void;
  isLoading: boolean;
}

export function OrderForm({
  initialData,
  onSubmit,
  isLoading,
}: OrderFormProps) {
  const { data: customers } = api.customer.getAll.useQuery();
  const { data: products } = api.product.getAll.useQuery();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? {
      customerId: 0,
      products: [{ productId: 0, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "products",
    control: form.control,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem
                      key={customer.id}
                      value={customer.id.toString()}
                    >
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Products</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: 0, quantity: 1 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-4">
              <FormField
                control={form.control}
                name={`products.${index}.productId`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      disabled={isLoading}
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un producto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id.toString()}
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`products.${index}.quantity`}
                render={({ field }) => (
                  <FormItem className="w-[100px]">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isLoading || fields.length === 1}
                onClick={() => remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Cargando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
}
