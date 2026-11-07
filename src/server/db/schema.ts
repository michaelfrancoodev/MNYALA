import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigserial,
  boolean,
  char,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ enums */

export const userRole = pgEnum("user_role", ["staff", "admin", "super_admin"]);
export const tokenPurpose = pgEnum("token_purpose", ["password_reset", "invite"]);
export const productCategory = pgEnum("product_category", ["charcoal", "stove", "seeds", "manure"]);
export const galleryCategory = pgEnum("gallery_category", ["product", "production", "delivery", "community"]);
export const orderStatus = pgEnum("order_status", ["new", "confirmed", "in_delivery", "completed", "cancelled"]);
export const orderSource = pgEnum("order_source", ["phone", "whatsapp", "walk_in", "website_message"]);
export const messageSubject = pgEnum("message_subject", ["mkaa", "majiko", "mbegu", "mboji", "jumla", "nyingine"]);

/** All timestamps are stored in UTC and shown in Africa/Dar_es_Salaam by the UI. */
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const createdAt = () => ts("created_at").notNull().defaultNow();
const updatedAt = () =>
  ts("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* ------------------------------------------------------------------ auth */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 254 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    /** argon2id hash. NULL until an invited user accepts the invite. */
    passwordHash: text("password_hash"),
    role: userRole("role").notNull().default("staff"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: ts("last_login_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdBy: uuid("created_by").references((): AnyPgColumn => users.id, { onDelete: "set null" }),
  },
  (t) => [uniqueIndex("users_email_lower_key").on(sql`lower(${t.email})`)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** SHA-256 (hex) of the session token. The raw token is never stored. */
    tokenHash: char("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: ts("expires_at").notNull(),
    createdAt: createdAt(),
    lastUsedAt: ts("last_used_at").notNull().defaultNow(),
    ip: varchar("ip", { length: 64 }),
    userAgent: varchar("user_agent", { length: 300 }),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId), index("sessions_expires_at_idx").on(t.expiresAt)],
);

export const authTokens = pgTable(
  "auth_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    purpose: tokenPurpose("purpose").notNull(),
    /** SHA-256 (hex) of the token that was emailed. Single use. */
    tokenHash: char("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: ts("expires_at").notNull(),
    usedAt: ts("used_at"),
    createdAt: createdAt(),
  },
  (t) => [index("auth_tokens_user_id_idx").on(t.userId)],
);

export const rateLimits = pgTable("rate_limits", {
  /** For example "login:email:a@b.com" or "contact:ip:1.2.3.4". */
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: ts("window_start").notNull(),
  blockedUntil: ts("blocked_until"),
});

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    /** SET NULL so history survives when a user is deleted. */
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 40 }),
    entityId: varchar("entity_id", { length: 64 }),
    /** Never store passwords, tokens or message bodies here. */
    details: jsonb("details"),
    ip: varchar("ip", { length: 64 }),
    userAgent: varchar("user_agent", { length: 300 }),
    createdAt: createdAt(),
  },
  (t) => [index("activity_logs_created_at_idx").on(t.createdAt.desc()), index("activity_logs_user_id_idx").on(t.userId)],
);

/* --------------------------------------------------------- media + catalog */

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Random base name, no extension. Variants are "<file>-480.webp", "<file>-960.webp", "<file>-1600.webp". */
  file: varchar("file", { length: 80 }).notNull().unique(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  bytes: integer("bytes").notNull(),
  alt: varchar("alt", { length: 200 }).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    name: varchar("name", { length: 120 }).notNull(),
    category: productCategory("category").notNull(),
    summary: varchar("summary", { length: 300 }).notNull(),
    features: text("features").array().notNull().default(sql`'{}'::text[]`),
    /** Whole Tanzanian shillings. NULL means "contact us for the price". */
    priceTzs: integer("price_tzs"),
    priceUnit: varchar("price_unit", { length: 30 }),
    imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
    isPublished: boolean("is_published").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("products_price_non_negative", sql`${t.priceTzs} is null or ${t.priceTzs} >= 0`),
    index("products_published_sort_idx").on(t.isPublished, t.sortOrder),
  ],
);

export const galleryItems = pgTable(
  "gallery_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }).notNull(),
    description: varchar("description", { length: 300 }),
    category: galleryCategory("category").notNull(),
    isPublished: boolean("is_published").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("gallery_published_sort_idx").on(t.isPublished, t.sortOrder), index("gallery_media_idx").on(t.mediaId)],
);

/* ----------------------------------------------------- contact + customers */

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    subject: messageSubject("subject").notNull().default("nyingine"),
    body: varchar("body", { length: 2000 }).notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    isRead: boolean("is_read").notNull().default(false),
    repliedAt: ts("replied_at"),
    ip: varchar("ip", { length: 64 }),
    createdAt: createdAt(),
  },
  (t) => [index("messages_read_created_idx").on(t.isRead, t.createdAt.desc()), index("messages_product_idx").on(t.productId)],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    /** E.164, for example +255758730108. */
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 254 }),
    address: varchar("address", { length: 500 }),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("customers_phone_key").on(t.phone).where(sql`${t.phone} is not null`)],
);

/* ----------------------------------------------------------------- orders */

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** For example MN-2026-0001, issued from `counters` inside the creating transaction. */
    code: varchar("code", { length: 20 }).notNull().unique(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    status: orderStatus("status").notNull().default("new"),
    source: orderSource("source").notNull(),
    messageId: uuid("message_id").references(() => messages.id, { onDelete: "set null" }),
    deliveryAddress: varchar("delivery_address", { length: 500 }),
    notes: text("notes"),
    /** Always computed on the server from order_items; never accepted from a client. */
    totalTzs: integer("total_tzs").notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    completedAt: ts("completed_at"),
    cancelledAt: ts("cancelled_at"),
  },
  (t) => [
    check("orders_total_non_negative", sql`${t.totalTzs} >= 0`),
    index("orders_status_created_idx").on(t.status, t.createdAt.desc()),
    index("orders_customer_idx").on(t.customerId),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    /** The product name at the time of the order, so history does not change when a product is renamed. */
    nameSnapshot: varchar("name_snapshot", { length: 120 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceTzs: integer("unit_price_tzs").notNull(),
    lineTotalTzs: integer("line_total_tzs").notNull(),
  },
  (t) => [
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
    check("order_items_price_non_negative", sql`${t.unitPriceTzs} >= 0`),
    check("order_items_line_total_matches", sql`${t.lineTotalTzs} = ${t.quantity} * ${t.unitPriceTzs}`),
    index("order_items_order_idx").on(t.orderId),
    index("order_items_product_idx").on(t.productId),
  ],
);

/* ------------------------------------------------------------------- misc */

export const counters = pgTable("counters", {
  /** For example "order-2026". Incremented atomically with INSERT ... ON CONFLICT DO UPDATE. */
  key: varchar("key", { length: 40 }).primaryKey(),
  value: integer("value").notNull().default(0),
});

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: updatedAt(),
});
