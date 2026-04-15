import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import StockChart from "./StockChart";
import TradePanel from "./TradePanel";
import OrderBook from "./OrderBook";
import PortfolioSummary from "./PortfolioSummary";
import type { Stock } from "@shared/schema";

interface TradingTabProps {
  stocks: Stock[];
  brokers: any[];
  portfolio: any;
  selectedStock: Stock | null;
  setSelectedStock: (stock: Stock | null) => void;
  selectedBroker: string;
  setSelectedBroker: (broker: string) => void;
}

export default function TradingTab({
  stocks,
  brokers,
  portfolio,
  selectedStock,
  setSelectedStock,
  selectedBroker,
  setSelectedBroker,
}: TradingTabProps) {
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `BWP ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatChange = (current: string, previous: string) => {
    const currentPrice = parseFloat(current);
    const previousPrice = parseFloat(previous || current);
    const change = currentPrice - previousPrice;
    const changePercent = ((change / previousPrice) * 100);
    
    return {
      change,
      changePercent,
      isPositive: change >= 0,
    };
  };

  return (
    <div className="space-y-6">
      {/* Broker Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Market / Broker
            </label>
            <Select value={selectedBroker} onValueChange={setSelectedBroker}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a broker..." />
              </SelectTrigger>
              <SelectContent>
                {brokers.map((broker: any) => (
                  <SelectItem key={broker.id} value={broker.id}>
                    {broker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Panel: Chart and Market Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Chart */}
          {selectedStock && <StockChart stock={selectedStock} />}

          {/* Market Overview */}
          <Card>
            <CardHeader>
              <CardTitle>BSE Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">BSE DCI</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">10,428.27</p>
                  <p className="text-xs text-green-600">+3.77%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">2.4M</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">BWP</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">654B</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">BWP</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Listed Co.</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">30+</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel: Stock Overview */}
        <div className="space-y-6">
          {/* Stock Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Stock Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStock && (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStock.symbol}
                    </h2>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(selectedStock.currentPrice)}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      {(() => {
                        const { change, changePercent, isPositive } = formatChange(
                          selectedStock.currentPrice,
                          selectedStock.previousClose || selectedStock.currentPrice
                        );
                        return (
                          <div className="flex justify-between items-center">
                            <div className="text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400">Change</p>
                              <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? '+' : ''}{change.toFixed(3)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">High</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400">% Change</p>
                              <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Low</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Stock Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Stock
                    </label>
                    <Select
                      value={selectedStock.id}
                      onValueChange={(value) => {
                        const stock = stocks.find((s: Stock) => s.id === value);
                        if (stock) setSelectedStock(stock);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stocks.map((stock: Stock) => (
                          <SelectItem key={stock.id} value={stock.id}>
                            {stock.symbol} - {formatCurrency(stock.currentPrice)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Company Info */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Sector:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">
                          {selectedStock.sector || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Market Cap:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">
                          {selectedStock.marketCap ? formatCurrency(selectedStock.marketCap) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">P/E Ratio:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">
                          {selectedStock.peRatio || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Dividend:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">
                          {selectedStock.dividendYield ? `${selectedStock.dividendYield}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Portfolio Summary */}
          <PortfolioSummary portfolio={portfolio} />
        </div>

        {/* Right Panel: Trading */}
        <div className="space-y-6">
          {/* Trade Panel */}
          {selectedStock && (
            <TradePanel 
              stock={selectedStock} 
              broker={selectedBroker}
              portfolio={portfolio}
            />
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                📊 Set Price Alert
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                📈 Technical Analysis
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                📰 Company News
              </button>
            </CardContent>
          </Card>

          {/* Market Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Market Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">BSE Status:</span>
                <Badge variant="outline" className="text-green-600 border-green-600">Open</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Trading Hours:</span>
                <span className="text-gray-900 dark:text-white">10:00 - 14:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time to Close:</span>
                <span className="text-gray-900 dark:text-white">2h 45m</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Orders and Portfolio */}
      <div className="mt-8">
        <OrderBook />
      </div>
    </div>
  );
}
