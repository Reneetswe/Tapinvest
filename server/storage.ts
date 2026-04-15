import {
  users,
  stocks,
  portfolios,
  holdings,
  orders,
  priceHistory,
  brokers,
  type User,
  type UpsertUser,
  type Stock,
  type InsertStock,
  type Portfolio,
  type InsertPortfolio,
  type Holding,
  type InsertHolding,
  type Order,
  type InsertOrder,
  type PriceHistory,
  type Broker,
  type PortfolioWithHoldings,
  type OrderWithStock,
  type HoldingWithStock,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Stock operations
  getStocks(): Promise<Stock[]>;
  getStock(id: string): Promise<Stock | undefined>;
  getStockBySymbol(symbol: string): Promise<Stock | undefined>;
  upsertStock(stock: InsertStock): Promise<Stock>;
  
  // Portfolio operations
  getUserPortfolio(userId: string): Promise<PortfolioWithHoldings | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolioValue(portfolioId: string, totalValue: number, totalCost: number): Promise<void>;
  
  // Holdings operations
  getHoldings(portfolioId: string): Promise<HoldingWithStock[]>;
  getHolding(portfolioId: string, stockId: string): Promise<Holding | undefined>;
  upsertHolding(holding: InsertHolding): Promise<Holding>;
  updateHolding(portfolioId: string, stockId: string, quantity: number, averagePrice: number): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getUserOrders(userId: string, status?: string): Promise<OrderWithStock[]>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string, executedPrice?: number, executedQuantity?: number): Promise<void>;
  
  // Price history operations
  addPriceHistory(stockId: string, price: number, volume?: number): Promise<PriceHistory>;
  getPriceHistory(stockId: string, limit?: number): Promise<PriceHistory[]>;
  
  // Broker operations
  getBrokers(): Promise<Broker[]>;
  initializeBrokers(brokerData: any[]): Promise<void>;
  
  // Market operations
  updateStockPrice(stockId: string, price: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // If user exists, update only the provided fields
      if (userData.id) {
        const existingUser = await this.getUser(userData.id);
        if (existingUser) {
          // Update only - merge with existing data
          const [user] = await db
            .update(users)
            .set({
              ...userData,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userData.id))
            .returning();
          return user;
        }
      }
      
      // Insert new user
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error("[Storage] upsertUser error:", error);
      throw error;
    }
  }

  // Stock operations
  async getStocks(): Promise<Stock[]> {
    return await db.select().from(stocks).where(eq(stocks.isActive, true));
  }

  async getStock(id: string): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.id, id));
    return stock;
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.symbol, symbol));
    return stock;
  }

  async upsertStock(stockData: InsertStock): Promise<Stock> {
    const [stock] = await db
      .insert(stocks)
      .values(stockData)
      .onConflictDoUpdate({
        target: stocks.symbol,
        set: {
          ...stockData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return stock;
  }

  // Portfolio operations
  async getUserPortfolio(userId: string): Promise<PortfolioWithHoldings | undefined> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId));

    if (!portfolio) return undefined;

    const portfolioHoldings = await this.getHoldings(portfolio.id);
    
    return {
      ...portfolio,
      holdings: portfolioHoldings,
    };
  }

  async createPortfolio(portfolioData: InsertPortfolio): Promise<Portfolio> {
    const [portfolio] = await db
      .insert(portfolios)
      .values(portfolioData)
      .returning();
    return portfolio;
  }

  async updatePortfolioValue(portfolioId: string, totalValue: number, totalCost: number): Promise<void> {
    await db
      .update(portfolios)
      .set({
        totalValue: totalValue.toString(),
        totalCost: totalCost.toString(),
        updatedAt: new Date(),
      })
      .where(eq(portfolios.id, portfolioId));
  }

  // Holdings operations
  async getHoldings(portfolioId: string): Promise<HoldingWithStock[]> {
    const results = await db
      .select({
        holding: holdings,
        stock: stocks,
      })
      .from(holdings)
      .innerJoin(stocks, eq(holdings.stockId, stocks.id))
      .where(eq(holdings.portfolioId, portfolioId));
    
    return results.map(result => ({
      ...result.holding,
      stock: result.stock,
    }));
  }

  async getHolding(portfolioId: string, stockId: string): Promise<Holding | undefined> {
    const [holding] = await db
      .select()
      .from(holdings)
      .where(and(eq(holdings.portfolioId, portfolioId), eq(holdings.stockId, stockId)));
    return holding;
  }

  async upsertHolding(holdingData: InsertHolding): Promise<Holding> {
    const [holding] = await db
      .insert(holdings)
      .values(holdingData)
      .onConflictDoUpdate({
        target: [holdings.portfolioId, holdings.stockId],
        set: {
          ...holdingData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return holding;
  }

  async updateHolding(portfolioId: string, stockId: string, quantity: number, averagePrice: number): Promise<void> {
    const totalCost = quantity * averagePrice;
    await db
      .update(holdings)
      .set({
        quantity,
        averagePrice: averagePrice.toString(),
        totalCost: totalCost.toString(),
        updatedAt: new Date(),
      })
      .where(and(eq(holdings.portfolioId, portfolioId), eq(holdings.stockId, stockId)));
  }

  // Order operations
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async getUserOrders(userId: string, status?: string): Promise<OrderWithStock[]> {
    let whereConditions = [eq(orders.userId, userId)];
    
    if (status) {
      whereConditions.push(eq(orders.status, status));
    }

    const results = await db
      .select({
        order: orders,
        stock: stocks,
      })
      .from(orders)
      .innerJoin(stocks, eq(orders.stockId, stocks.id))
      .where(and(...whereConditions))
      .orderBy(desc(orders.createdAt));
    
    return results.map(result => ({
      ...result.order,
      stock: result.stock,
    }));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrderStatus(id: string, status: string, executedPrice?: number, executedQuantity?: number): Promise<void> {
    const updateData: any = {
      status,
    };

    if (executedPrice !== undefined) {
      updateData.executedPrice = executedPrice.toString();
      updateData.executedAt = new Date();
    }

    if (executedQuantity !== undefined) {
      updateData.executedQuantity = executedQuantity;
    }

    await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id));
  }

  // Price history operations
  async addPriceHistory(stockId: string, price: number, volume: number = 0): Promise<PriceHistory> {
    const [priceRecord] = await db
      .insert(priceHistory)
      .values({
        stockId,
        price: price.toString(),
        volume,
      })
      .returning();
    return priceRecord;
  }

  async getPriceHistory(stockId: string, limit: number = 50): Promise<PriceHistory[]> {
    return await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.stockId, stockId))
      .orderBy(desc(priceHistory.timestamp))
      .limit(limit);
  }

  // Broker operations
  async getBrokers(): Promise<Broker[]> {
    return await db.select().from(brokers).where(eq(brokers.isActive, true));
  }

  async initializeBrokers(brokerData: any[]): Promise<void> {
    for (const broker of brokerData) {
      try {
        await db
          .insert(brokers)
          .values(broker)
          .onConflictDoNothing();
      } catch (error) {
        console.error(`Error inserting broker ${broker.name}:`, error);
      }
    }
  }

  // Market operations
  async updateStockPrice(stockId: string, price: number): Promise<void> {
    await db
      .update(stocks)
      .set({
        currentPrice: price.toString(),
        updatedAt: new Date(),
      })
      .where(eq(stocks.id, stockId));
  }
}

export const storage = new DatabaseStorage();
