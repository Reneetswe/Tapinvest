import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Target } from "lucide-react";

interface PortfolioTabProps {
  portfolio: any;
}

export default function PortfolioTab({ portfolio }: PortfolioTabProps) {
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `BWP ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Show loading state if portfolio is undefined
  if (portfolio === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  // Mock portfolio data for demonstration
  const mockPortfolio = {
    totalValue: "75000",
    totalCost: "65000",
    cashBalance: "25000",
    totalPnL: "10000",
    totalPnLPercent: 15.38,
    margin: "50000",
    equity: "75000",
    marginLevel: 150,
    riskLevel: "Moderate",
    holdings: [
      {
        symbol: "LETSHEGO",
        quantity: 1000,
        averagePrice: "1.05",
        currentPrice: "1.15",
        marketValue: "1150",
        totalCost: "1050",
        pnl: "100",
        pnlPercent: 9.52,
      },
      {
        symbol: "ABSA",
        quantity: 500,
        averagePrice: "7.30",
        currentPrice: "7.80",
        marketValue: "3900",
        totalCost: "3650",
        pnl: "250",
        pnlPercent: 6.85,
      },
      {
        symbol: "CHOBE",
        quantity: 200,
        averagePrice: "17.55",
        currentPrice: "18.20",
        marketValue: "3640",
        totalCost: "3510",
        pnl: "130",
        pnlPercent: 3.70,
      },
    ],
  };

  // Calculate portfolio metrics from actual data
  const calculatePortfolioMetrics = (portfolio: any) => {
    if (!portfolio) return mockPortfolio;
    
    const totalValue = parseFloat(portfolio.totalValue || "0");
    const totalCost = parseFloat(portfolio.totalCost || "0");
    const cashBalance = parseFloat(portfolio.cashBalance || "0");
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
    
    return {
      totalValue: portfolio.totalValue || "0",
      totalCost: portfolio.totalCost || "0",
      cashBalance: portfolio.cashBalance || "0",
      totalPnL: totalPnL.toString(),
      totalPnLPercent,
      margin: totalValue.toString(),
      equity: totalValue.toString(),
      marginLevel: totalCost > 0 ? (totalValue / totalCost) * 100 : 100,
      riskLevel: "Low",
      holdings: portfolio.holdings || [],
    };
  };

  const portfolioData = calculatePortfolioMetrics(portfolio);

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(portfolioData.totalValue)}</p>
                <p className="text-sm text-green-200">
                  {formatPercentage(portfolioData.totalPnLPercent)} ↗
                </p>
              </div>
              <DollarSign className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total P&L</p>
                <p className="text-2xl font-bold">{formatCurrency(portfolioData.totalPnL)}</p>
                <p className="text-sm opacity-80">Realized + Unrealized</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Cash Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(portfolioData.cashBalance)}</p>
                <p className="text-sm opacity-80">Available for Trading</p>
              </div>
              <PieChart className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Margin Level</p>
                <p className="text-2xl font-bold">{portfolioData.marginLevel}%</p>
                <p className="text-sm opacity-80">Risk Assessment</p>
              </div>
              <Target className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioData.holdings.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-lg mb-2">No holdings yet</p>
                  <p className="text-sm">Start trading to build your portfolio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolioData.holdings.map((holding: any, index: number) => {
                    const stock = holding.stock || {};
                    const symbol = stock.symbol || holding.symbol || "N/A";
                    const currentPrice = parseFloat(stock.currentPrice || holding.currentPrice || "0");
                    const averagePrice = parseFloat(holding.averagePrice || "0");
                    const quantity = holding.quantity || 0;
                    const marketValue = currentPrice * quantity;
                    const totalCost = parseFloat(holding.totalCost || "0");
                    const pnl = marketValue - totalCost;
                    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">
                                {symbol.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{symbol}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {quantity.toLocaleString()} shares @ {formatCurrency(averagePrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(marketValue)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              pnl >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                            </span>
                            <Badge variant={pnl >= 0 ? "default" : "destructive"} className="text-xs">
                              {formatPercentage(pnlPercent)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Metrics */}
        <div className="space-y-6">
          {/* Risk Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {portfolioData.riskLevel}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Margin Used:</span>
                <span className="font-medium">{formatCurrency(portfolioData.margin)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Equity:</span>
                <span className="font-medium">{formatCurrency(portfolioData.equity)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Margin Level:</span>
                <span className={`font-medium ${
                  portfolioData.marginLevel > 150 ? 'text-green-600' : 
                  portfolioData.marginLevel > 120 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {portfolioData.marginLevel}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Return:</span>
                  <span className={`font-bold ${
                    portfolioData.totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(portfolioData.totalPnLPercent)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total P&L:</span>
                  <span className={`font-bold ${
                    parseFloat(portfolioData.totalPnL) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(portfolioData.totalPnL)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Cost Basis:</span>
                  <span className="font-medium">{formatCurrency(portfolioData.totalCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                📊 Portfolio Analysis
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                📈 Performance Report
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                💰 Rebalance Portfolio
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                📋 Export Data
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
