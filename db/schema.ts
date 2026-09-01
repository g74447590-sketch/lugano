import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  accessToken: text("access_token").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  postalCode: text("postal_code").notNull(),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  status: text("status").notNull().default("awaiting_quote"),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents"),
  totalCents: integer("total_cents"),
  shippingDays: integer("shipping_days"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_orders_code").on(table.code),
  uniqueIndex("idx_orders_access_token").on(table.accessToken),
  index("idx_orders_status_created").on(table.status, table.createdAt),
  index("idx_orders_customer_email").on(table.customerEmail),
]);

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
}, (table) => [index("idx_order_items_order_id").on(table.orderId)]);

export const orderEvents = sqliteTable("order_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_order_events_order_id_created").on(table.orderId, table.createdAt)]);

export const emailOutbox = sqliteTable("email_outbox", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  eventKey: text("event_key").notNull(),
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  template: text("template").notNull(),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: text("created_at").notNull(),
  sentAt: text("sent_at"),
}, (table) => [
  uniqueIndex("idx_email_outbox_order_event").on(table.orderId, table.eventKey),
  index("idx_email_outbox_status_created").on(table.status, table.createdAt),
]);
