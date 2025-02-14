import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { customers, orderItems, orders, products } from "~/server/db/schema";

export const orderRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
        },
        products: sql<string>`json_group_array(json_object(
          'productId', ${orderItems.productId},
          'quantity', ${orderItems.quantity},
          'price', ${orderItems.price}
        ))`.mapWith(JSON.parse),
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .groupBy(orders.id)
      .orderBy(desc(orders.createdAt));

    return result;
  }),

  getById: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const order = await ctx.db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
        },
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, input))
      .get();

    if (!order) {
      throw new Error("Order not found");
    }

    const items = await ctx.db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        product: {
          name: products.name,
        },
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      ...order,
      items,
    };
  }),

  create: publicProcedure
    .input(
      z.object({
        customerId: z.number(),
        products: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().int().positive(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const productsWithPrices = await Promise.all(
          input.products.map(async (item) => {
            const product = await tx
              .select({
                id: products.id,
                name: products.name,
                price: products.price,
                stock: products.stock,
              })
              .from(products)
              .where(eq(products.id, item.productId))
              .get();

            if (!product) {
              throw new Error(`No existe el producto ${item.productId}`);
            }

            if (product.stock < item.quantity) {
              throw new Error(`No hay suficiente stock de ${product.name}`);
            }

            return {
              ...item,
              price: product.price,
            };
          }),
        );

        const total = productsWithPrices.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        const [order] = await tx
          .insert(orders)
          .values({
            customerId: input.customerId,
            total,
            status: "pending",
          })
          .returning();

        await tx.insert(orderItems).values(
          productsWithPrices.map((item) => ({
            orderId: order!.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        );

        await Promise.all(
          productsWithPrices.map((item) =>
            tx
              .update(products)
              .set({
                stock: sql`${products.stock} - ${item.quantity}`,
              })
              .where(eq(products.id, item.productId)),
          ),
        );

        return order;
      });
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "completed", "cancelled"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status } = input;

      if (status === "cancelled") {
        return ctx.db.transaction(async (tx) => {
          const items = await tx
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, id));

          await Promise.all(
            items.map((item) =>
              tx
                .update(products)
                .set({
                  stock: sql`${products.stock} + ${item.quantity}`,
                })
                .where(eq(products.id, item.productId)),
            ),
          );

          const [order] = await tx
            .update(orders)
            .set({ status })
            .where(eq(orders.id, id))
            .returning();

          return order;
        });
      }

      const [order] = await ctx.db
        .update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning();

      return order;
    }),

  delete: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction(async (tx) => {
      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, input));

      await Promise.all(
        items.map((item) =>
          tx
            .update(products)
            .set({
              stock: sql`${products.stock} + ${item.quantity}`,
            })
            .where(eq(products.id, item.productId)),
        ),
      );

      await tx.delete(orderItems).where(eq(orderItems.orderId, input));

      const [order] = await tx
        .delete(orders)
        .where(eq(orders.id, input))
        .returning();

      return order;
    });
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        customerId: z.number(),
        products: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().int().positive(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const currentItems = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, input.id));

        await Promise.all(
          currentItems.map((item) =>
            tx
              .update(products)
              .set({
                stock: sql`${products.stock} + ${item.quantity}`,
              })
              .where(eq(products.id, item.productId)),
          ),
        );

        const productsWithPrices = await Promise.all(
          input.products.map(async (item) => {
            const product = await tx
              .select({
                id: products.id,
                name: products.name,
                price: products.price,
                stock: products.stock,
              })
              .from(products)
              .where(eq(products.id, item.productId))
              .get();

            if (!product) {
              throw new Error(`No existe el producto ${item.productId}`);
            }

            if (product.stock < item.quantity) {
              throw new Error(`No hay suficiente stock de ${product.name}`);
            }

            return {
              ...item,
              price: product.price,
            };
          }),
        );

        const total = productsWithPrices.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        await tx.delete(orderItems).where(eq(orderItems.orderId, input.id));

        await tx.insert(orderItems).values(
          productsWithPrices.map((item) => ({
            orderId: input.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        );

        await Promise.all(
          productsWithPrices.map((item) =>
            tx
              .update(products)
              .set({
                stock: sql`${products.stock} - ${item.quantity}`,
              })
              .where(eq(products.id, item.productId)),
          ),
        );

        const [order] = await tx
          .update(orders)
          .set({
            customerId: input.customerId,
            total,
          })
          .where(eq(orders.id, input.id))
          .returning();

        return order;
      });
    }),
});
