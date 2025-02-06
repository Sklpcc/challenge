import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { customers } from "~/server/db/schema";

export const customerRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.customers.findMany({
      orderBy: [desc(customers.createdAt)],
    });
  }),

  getById: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.db.query.customers.findFirst({
      where: eq(customers.id, input),
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(customers).values(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.update(customers).set(data).where(eq(customers.id, id));
    }),

  delete: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    return ctx.db.delete(customers).where(eq(customers.id, input));
  }),
});
