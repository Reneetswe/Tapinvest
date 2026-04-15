import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOrderSchema, insertStockSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Demo login - creates a demo user and logs them in automatically
  app.post('/api/auth/demo', async (req: any, res) => {
    try {
      const demoUserId = `demo_${Date.now()}`;
      const demoUsername = `demo_user_${Math.floor(Math.random() * 10000)}`;
      
      // Create demo user
      const demoUser = await storage.createUser({
        id: demoUserId,
        username: demoUsername,
        email: `${demoUsername}@demo.com`,
        password: 'demo_password_not_used',
        fullName: 'Demo Trader',
        role: 'trader',
        twoFactorEnabled: false,
        twoFactorSecret: null,
      });

      // Create demo portfolio
      const portfolio = await storage.createPortfolio({
        userId: demoUserId,
        name: "Demo Trading Portfolio",
        cashBalance: "100000", // BWP 100,000 demo balance
      });

      // Log in the demo user
      req.login(demoUser, (err: any) => {
        if (err) {
          console.error("Demo login error:", err);
          return res.status(500).json({ message: "Failed to login demo user" });
        }
        res.json({ success: true, user: demoUser, portfolioId: portfolio.id });
      });
    } catch (error) {
      console.error("Error creating demo user:", error);
      res.status(500).json({ message: "Failed to create demo account" });
    }
  });

  // Initialize default data
  app.post('/api/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Initialize BSE stocks if not exist
      await initializeBSEStocks();
      
      // Initialize brokers if not exist
      await initializeBrokers();
      
      // Create user portfolio if not exists
      let portfolio = await storage.getUserPortfolio(userId);
      if (!portfolio) {
        const newPortfolio = await storage.createPortfolio({
          userId,
          name: "My Trading Portfolio",
          cashBalance: "50000", // Starting with BWP 50,000
        });
        portfolio = { ...newPortfolio, holdings: [] };
      }
      
      res.json({ success: true, portfolioId: portfolio?.id });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  // Stock routes
  app.get('/api/stocks', async (req, res) => {
    try {
      const stocks = await storage.getStocks();
      res.json(stocks);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  app.get('/api/stocks/:id', async (req, res) => {
    try {
      const stock = await storage.getStock(req.params.id);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      res.json(stock);
    } catch (error) {
      console.error("Error fetching stock:", error);
      res.status(500).json({ message: "Failed to fetch stock" });
    }
  });

  app.get('/api/stocks/:id/history', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getPriceHistory(req.params.id, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching price history:", error);
      res.status(500).json({ message: "Failed to fetch price history" });
    }
  });

  // Portfolio routes
  app.get('/api/portfolio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let portfolio = await storage.getUserPortfolio(userId);
      
      // Auto-create portfolio if it doesn't exist
      if (!portfolio) {
        const newPortfolio = await storage.createPortfolio({
          userId,
          name: "My Trading Portfolio",
          cashBalance: "50000", // Starting with BWP 50,000
        });
        // Return with empty holdings array
        portfolio = { ...newPortfolio, holdings: [] };
      }
      
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse(req.body);
      
      // Get user portfolio
      const portfolio = await storage.getUserPortfolio(userId);
      if (!portfolio) {
        return res.status(400).json({ message: "Portfolio not found" });
      }

      // Get stock
      const stock = await storage.getStock(orderData.stockId);
      if (!stock) {
        return res.status(400).json({ message: "Stock not found" });
      }

      // Calculate order cost
      const price = orderData.price ? parseFloat(orderData.price) : parseFloat(stock.currentPrice);
      const totalCost = orderData.quantity * price;
      const commission = parseFloat(orderData.commission || "2.50");
      const finalCost = totalCost + commission;

      // Validate sufficient funds for BUY orders
      if (orderData.orderType === 'BUY') {
        const cashBalance = parseFloat(portfolio.cashBalance || "0");
        if (cashBalance < finalCost) {
          return res.status(400).json({ message: "Insufficient funds" });
        }
      }

      // Validate sufficient holdings for SELL orders
      if (orderData.orderType === 'SELL') {
        const holding = await storage.getHolding(portfolio.id, orderData.stockId);
        if (!holding || holding.quantity < orderData.quantity) {
          return res.status(400).json({ message: "Insufficient shares" });
        }
      }

      // Create order
      const order = await storage.createOrder({
        ...orderData,
        userId,
        portfolioId: portfolio.id,
        price: price.toString(),
        commission: commission.toString(),
      } as any);

      // Simulate order execution for market orders
      if (orderData.orderStyle === 'MARKET') {
        await executeOrder(order.id, price, orderData.quantity);
      }

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = req.query.status as string;
      const orders = await storage.getUserOrders(userId, status);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch('/api/orders/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (order.status !== 'PENDING') {
        return res.status(400).json({ message: "Order cannot be cancelled" });
      }

      await storage.updateOrderStatus(req.params.id, 'CANCELLED');
      res.json({ success: true });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  // Broker routes
  app.get('/api/brokers', async (req, res) => {
    try {
      const brokers = await storage.getBrokers();
      res.json(brokers);
    } catch (error) {
      console.error("Error fetching brokers:", error);
      res.status(500).json({ message: "Failed to fetch brokers" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Client connected to trading feed');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'subscribe') {
          // Subscribe to specific stock updates
          ws.send(JSON.stringify({ type: 'subscribed', symbols: message.symbols }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from trading feed');
    });
  });

  // Simulate real-time price updates
  setInterval(async () => {
    try {
      const stocks = await storage.getStocks();
      
      for (const stock of stocks) {
        // Simulate price movement (-2% to +2%)
        const currentPrice = parseFloat(stock.currentPrice);
        const change = (Math.random() - 0.5) * 0.04; // -2% to +2%
        const newPrice = Math.max(0.01, currentPrice * (1 + change));
        
        // Update stock price
        await storage.updateStockPrice(stock.id, newPrice);
        
        // Add to price history
        await storage.addPriceHistory(stock.id, newPrice, Math.floor(Math.random() * 1000));

        // Broadcast to WebSocket clients
        const priceUpdate = {
          type: 'priceUpdate',
          symbol: stock.symbol,
          price: newPrice,
          change: newPrice - currentPrice,
          changePercent: ((newPrice - currentPrice) / currentPrice) * 100,
          timestamp: new Date().toISOString(),
        };

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(priceUpdate));
          }
        });
      }
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }, 5000); // Update every 5 seconds

  return httpServer;
}

// Helper functions
async function initializeBSEStocks() {
  const bseStocks = [
    {
      id: 'letshego',
      symbol: 'LETSHEGO',
      name: 'Letshego Holdings Limited',
      sector: 'Financials',
      currentPrice: '1.05',
      previousClose: '1.15',
      marketCap: '2100000000',
      peRatio: '8.4',
      dividendYield: '4.2',
    },
    {
      id: 'absa',
      symbol: 'ABSA',
      name: 'Absa Bank Botswana Limited',
      sector: 'Financials',
      currentPrice: '7.30',
      previousClose: '6.90',
      marketCap: '5200000000',
      peRatio: '12.1',
      dividendYield: '5.8',
    },
    {
      id: 'chobe',
      symbol: 'CHOBE',
      name: 'Chobe Holdings Limited',
      sector: 'Consumer Services',
      currentPrice: '17.55',
      previousClose: '17.36',
      marketCap: '3400000000',
      peRatio: '15.2',
      dividendYield: '3.1',
    },
    {
      id: 'choppies',
      symbol: 'CHOPPIES',
      name: 'Choppies Enterprises Limited',
      sector: 'Consumer Services',
      currentPrice: '0.70',
      previousClose: '0.52',
      marketCap: '450000000',
      peRatio: '18.5',
      dividendYield: '2.1',
    },
    {
      id: 'engen',
      symbol: 'ENGEN',
      name: 'Engen Botswana Limited',
      sector: 'Oil & Gas',
      currentPrice: '14.25',
      previousClose: '14.13',
      marketCap: '1800000000',
      peRatio: '9.7',
      dividendYield: '6.2',
    },
    {
      id: 'fnb',
      symbol: 'FNB',
      name: 'First National Bank of Botswana Limited',
      sector: 'Financials',
      currentPrice: '5.30',
      previousClose: '5.11',
      marketCap: '2800000000',
      peRatio: '11.3',
      dividendYield: '4.8',
    },
  ];

  for (const stockData of bseStocks) {
    try {
      await storage.upsertStock(stockData);
    } catch (error) {
      console.error(`Error initializing stock ${stockData.symbol}:`, error);
    }
  }
}

async function initializeBrokers() {
  const brokerData = [
    {
      id: 'stockbrokers-botswana',
      name: 'Stockbrokers Botswana',
      description: 'Established in 1989, first broker with research function',
      commission: '2.50',
    },
    {
      id: 'imara-capital',
      name: 'Imara Capital Securities',
      description: 'Part of Capital Group, started operations in March 2000',
      commission: '2.75',
    },
    {
      id: 'motswedi-securities',
      name: 'Motswedi Securities',
      description: 'Citizen-owned company serving individuals and institutions',
      commission: '2.25',
    },
  ];

  try {
    await storage.initializeBrokers(brokerData);
  } catch (error) {
    console.error('Error initializing brokers:', error);
  }
}

async function executeOrder(orderId: string, executedPrice: number, executedQuantity: number) {
  try {
    const order = await storage.getOrder(orderId);
    if (!order) return;

    // Update order status
    await storage.updateOrderStatus(orderId, 'FILLED', executedPrice, executedQuantity);

    // Update portfolio holdings
    const portfolio = await storage.getUserPortfolio(order.userId);
    if (!portfolio) return;

    if (order.orderType === 'BUY') {
      // Add to holdings
      const existingHolding = await storage.getHolding(portfolio.id, order.stockId);
      
      if (existingHolding) {
        // Update existing holding
        const newQuantity = existingHolding.quantity + executedQuantity;
        const newTotalCost = parseFloat(existingHolding.totalCost) + (executedPrice * executedQuantity);
        const newAveragePrice = newTotalCost / newQuantity;
        
        await storage.updateHolding(portfolio.id, order.stockId, newQuantity, newAveragePrice);
      } else {
        // Create new holding
        await storage.upsertHolding({
          portfolioId: portfolio.id,
          stockId: order.stockId,
          quantity: executedQuantity,
          averagePrice: executedPrice.toString(),
          totalCost: (executedPrice * executedQuantity).toString(),
        });
      }

      // Deduct cash
      const newCashBalance = parseFloat(portfolio.cashBalance || "0") - parseFloat(order.totalCost || "0");
      await storage.updatePortfolioValue(portfolio.id, parseFloat(portfolio.totalValue || "0"), parseFloat(portfolio.totalCost || "0"));
    } else if (order.orderType === 'SELL') {
      // Remove from holdings
      const existingHolding = await storage.getHolding(portfolio.id, order.stockId);
      
      if (existingHolding) {
        const newQuantity = existingHolding.quantity - executedQuantity;
        
        if (newQuantity > 0) {
          await storage.updateHolding(portfolio.id, order.stockId, newQuantity, parseFloat(existingHolding.averagePrice));
        } else {
          // Remove holding completely - would need deleteHolding method
        }
      }

      // Add cash
      const proceeds = (executedPrice * executedQuantity) - parseFloat(order.commission || "0");
      const newCashBalance = parseFloat(portfolio.cashBalance || "0") + proceeds;
      await storage.updatePortfolioValue(portfolio.id, parseFloat(portfolio.totalValue || "0"), parseFloat(portfolio.totalCost || "0"));
    }
  } catch (error) {
    console.error('Error executing order:', error);
  }
}
