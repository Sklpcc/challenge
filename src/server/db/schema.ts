import { sql } from "drizzle-orm";
import { int, text, integer, real, sqliteTable } from "drizzle-orm/sqlite-core";

export const customers = sqliteTable("customers", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const products = sqliteTable("products", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const orders = sqliteTable("orders", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  customerId: int("customer_id")
    .references(() => customers.id)
    .notNull(),
  total: real("total").notNull(),
  status: text("status", {
    enum: ["pending", "processing", "completed", "cancelled"],
  })
    .default("pending")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orderId: int("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});
