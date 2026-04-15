import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ui/theme-provider";
import { Sun, Moon, LogOut, BarChart3, TrendingUp, PieChart, Settings, Wallet, Activity, Bot } from "lucide-react";
import StockChart from "./StockChart";
import TradePanel from "./TradePanel";
import OrderBook from "./OrderBook";
import PortfolioSummary from "./PortfolioSummary";
import TradingTab from "./TradingTab";
import PortfolioTab from "./PortfolioTab";
import ChartsTab from "./ChartsTab";
import SettingsTab from "./SettingsTab";
import AIAssistant from "@/components/ai/AIAssistant";
import type { Stock } from "@shared/schema";
import AIFab from "@/components/ai/AIFab";
import { useLocation } from "wouter";

export default function TradingDashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedBroker, setSelectedBroker] = useState<string>("");
  const [location, navigate] = useLocation();

  // Derive initial tab from URL (?tab=...) or /portfolio path
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const url = new URL(window.location.href);
      const qp = url.searchParams.get("tab");
      if (qp) return qp;
      if (url.pathname.endsWith("/portfolio")) return "portfolio";
    } catch {}
    return "trading";
  });

  // Fetch stocks
  const { data: stocks = [], isLoading: stocksLoading } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  // Fetch brokers
  const { data: brokers = [] } = useQuery<any[]>({
    queryKey: ["/api/brokers"],
  });

  // Fetch portfolio
  const { data: portfolio, isLoading: portfolioLoading, error: portfolioError } = useQuery<any>({
    queryKey: ["/api/portfolio"],
    retry: 2,
  });

  // Log portfolio data for debugging
  useEffect(() => {
    if (portfolio) {
      console.log("Portfolio loaded:", portfolio);
    }
    if (portfolioError) {
      console.error("Portfolio error:", portfolioError);
    }
  }, [portfolio, portfolioError]);

  // Set default selected stock
  useEffect(() => {
    if ((stocks as Stock[]).length > 0 && !selectedStock) {
      setSelectedStock((stocks as Stock[]).find((s: Stock) => s.symbol === 'LETSHEGO') || (stocks as Stock[])[0]);
    }
  }, [stocks, selectedStock]);

  // Keep URL in sync with active tab (update query param without full navigation)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeTab);
      window.history.replaceState({}, "", url.toString());
    } catch {}
  }, [activeTab]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `BWP ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">BSE Trading Platform</h1>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Local MetaTrader</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Market Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Market Open</span>
              </div>
              
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="trading" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Charts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <TradingTab 
              stocks={stocks}
              brokers={brokers}
                portfolio={portfolio}
              selectedStock={selectedStock}
              setSelectedStock={setSelectedStock}
              selectedBroker={selectedBroker}
              setSelectedBroker={setSelectedBroker}
            />
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioTab portfolio={portfolio} />
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <ChartsTab 
              stocks={stocks}
              selectedStock={selectedStock}
              setSelectedStock={setSelectedStock}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsTab 
              brokers={brokers}
              user={user}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating AI Assistant */}
      <AIFab selectedStock={selectedStock || (stocks[0] || null)} portfolio={portfolio} />
    </div>
  );
}
