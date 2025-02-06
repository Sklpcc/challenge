import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { products } from "~/server/db/schema";

export const productRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.products.findMany({
      orderBy: [desc(products.createdAt)],
    });
  }),

  getById: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.db.query.products.findFirst({
      where: eq(products.id, input),
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        price: z.number().positive(),
        stock: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(products).values(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        description: z.string().min(1),
        price: z.number().positive(),
        stock: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.update(products).set(data).where(eq(products.id, id));
    }),

  delete: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    return ctx.db.delete(products).where(eq(products.id, input));
  }),
});
