import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"),
  // Email verification fields
  emailVerified: boolean("email_verified").default(false),
  emailVerificationCode: varchar("email_verification_code"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  // 2FA fields (non-breaking defaults)
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  totpSecret: varchar("totp_secret"),
  twoFactorVerifiedAt: timestamp("two_factor_verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BSE Stocks
export const stocks = pgTable("stocks", {
  id: varchar("id").primaryKey(),
  symbol: varchar("symbol").notNull().unique(),
  name: varchar("name").notNull(),
  sector: varchar("sector"),
  currentPrice: decimal("current_price", { precision: 10, scale: 3 }).notNull(),
  previousClose: decimal("previous_close", { precision: 10, scale: 3 }),
  marketCap: decimal("market_cap", { precision: 15, scale: 2 }),
  peRatio: decimal("pe_ratio", { precision: 8, scale: 2 }),
  dividendYield: decimal("dividend_yield", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Portfolios
export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull().default("Default Portfolio"),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).default("0"),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).default("0"),
  cashBalance: decimal("cash_balance", { precision: 15, scale: 2 }).default("10000"), // Starting balance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio Holdings
export const holdings = pgTable("holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  stockId: varchar("stock_id").notNull().references(() => stocks.id),
  quantity: integer("quantity").notNull(),
  averagePrice: decimal("average_price", { precision: 10, scale: 3 }).notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  portfolioId: varchar("portfolio_id").notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  stockId: varchar("stock_id").notNull().references(() => stocks.id),
  broker: varchar("broker").notNull(), // Stockbrokers Botswana, Imara Capital, Motswedi Securities
  orderType: varchar("order_type").notNull(), // BUY, SELL
  orderStyle: varchar("order_style").notNull().default("MARKET"), // MARKET, LIMIT, STOP_LOSS
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 3 }),
  executedPrice: decimal("executed_price", { precision: 10, scale: 3 }),
  executedQuantity: integer("executed_quantity").default(0),
  status: varchar("status").notNull().default("PENDING"), // PENDING, PARTIAL, FILLED, CANCELLED
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }),
  commission: decimal("commission", { precision: 8, scale: 2 }).default("2.50"),
  createdAt: timestamp("created_at").defaultNow(),
  executedAt: timestamp("executed_at"),
});

// Price History for charts
export const priceHistory = pgTable("price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stockId: varchar("stock_id").notNull().references(() => stocks.id),
  price: decimal("price", { precision: 10, scale: 3 }).notNull(),
  volume: integer("volume").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Brokers
export const brokers = pgTable("brokers", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  commission: decimal("commission", { precision: 5, scale: 2 }).default("2.50"),
  isActive: boolean("is_active").default(true),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  orders: many(orders),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  holdings: many(holdings),
  orders: many(orders),
}));

export const stocksRelations = relations(stocks, ({ many }) => ({
  holdings: many(holdings),
  orders: many(orders),
  priceHistory: many(priceHistory),
}));

export const holdingsRelations = relations(holdings, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [holdings.portfolioId],
    references: [portfolios.id],
  }),
  stock: one(stocks, {
    fields: [holdings.stockId],
    references: [stocks.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  portfolio: one(portfolios, {
    fields: [orders.portfolioId],
    references: [portfolios.id],
  }),
  stock: one(stocks, {
    fields: [orders.stockId],
    references: [stocks.id],
  }),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  stock: one(stocks, {
    fields: [priceHistory.stockId],
    references: [stocks.id],
  }),
}));

// Schema validation
export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  executedAt: true,
  executedPrice: true,
  executedQuantity: true,
  totalCost: true,
  userId: true,
  portfolioId: true,
});

export const insertHoldingSchema = createInsertSchema(holdings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Holding = typeof holdings.$inferSelect;
export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type Broker = typeof brokers.$inferSelect;

// Extended types with relations
export type PortfolioWithHoldings = Portfolio & {
  holdings: (Holding & { stock: Stock })[];
};

export type OrderWithStock = Order & {
  stock: Stock;
};

export type HoldingWithStock = Holding & {
  stock: Stock;
};
