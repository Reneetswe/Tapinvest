import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Activity, Target, Settings, Download, Share2 } from "lucide-react";
import StockChart from "./StockChart";
import type { Stock } from "@shared/schema";

interface ChartsTabProps {
  stocks: Stock[];
  selectedStock: Stock | null;
  setSelectedStock: (stock: Stock | null) => void;
}

export default function ChartsTab({
  stocks,
  selectedStock,
  setSelectedStock,
}: ChartsTabProps) {
  const [timeframe, setTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("candlestick");
  const [indicators, setIndicators] = useState<string[]>(["MA", "RSI"]);

  const timeframes = [
    { value: "1D", label: "1 Day" },
    { value: "1W", label: "1 Week" },
    { value: "1M", label: "1 Month" },
    { value: "3M", label: "3 Months" },
    { value: "6M", label: "6 Months" },
    { value: "1Y", label: "1 Year" },
    { value: "5Y", label: "5 Years" },
  ];

  const chartTypes = [
    { value: "candlestick", label: "Candlestick" },
    { value: "line", label: "Line" },
    { value: "area", label: "Area" },
    { value: "bar", label: "Bar" },
  ];

  const availableIndicators = [
    { value: "MA", label: "Moving Average" },
    { value: "RSI", label: "RSI" },
    { value: "MACD", label: "MACD" },
    { value: "BB", label: "Bollinger Bands" },
    { value: "VOL", label: "Volume" },
    { value: "ATR", label: "ATR" },
  ];

  const toggleIndicator = (indicator: string) => {
    setIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `BWP ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Stock Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Select Stock
              </label>
              <Select
                value={selectedStock?.id || ""}
                onValueChange={(value) => {
                  const stock = stocks.find((s: Stock) => s.id === value);
                  if (stock) setSelectedStock(stock);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a stock..." />
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

            {/* Timeframe Selector */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Timeframe
              </label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chart Type Selector */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Chart Type
              </label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Chart */}
      {selectedStock && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{selectedStock.symbol} Chart</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedStock.name} • {timeframe} • {chartType}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedStock.currentPrice)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <StockChart stock={selectedStock} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select indicators to display on the chart
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {availableIndicators.map((indicator) => (
              <Button
                key={indicator.value}
                variant={indicators.includes(indicator.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator(indicator.value)}
                className="justify-start"
              >
                {indicators.includes(indicator.value) && (
                  <div className="w-2 h-2 bg-white rounded-full mr-2" />
                )}
                {indicator.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Technical Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">RSI</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">65.4</p>
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                  Neutral
                </Badge>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">MACD</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">0.023</p>
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                  Bullish
                </Badge>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">MA 20</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">1.12</p>
                <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                  Above
                </Badge>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">MA 50</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">1.08</p>
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                  Above
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support & Resistance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Support & Resistance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Resistance 3:</span>
                <span className="font-medium text-red-600">1.25</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Resistance 2:</span>
                <span className="font-medium text-red-600">1.20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Resistance 1:</span>
                <span className="font-medium text-red-600">1.18</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Current Price:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {selectedStock ? formatCurrency(selectedStock.currentPrice) : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Support 1:</span>
                <span className="font-medium text-green-600">1.02</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Support 2:</span>
                <span className="font-medium text-green-600">0.98</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Support 3:</span>
                <span className="font-medium text-green-600">0.95</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Chart Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Chart Theme
              </label>
              <Select defaultValue="auto">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Grid Lines
              </label>
              <Select defaultValue="show">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="show">Show</SelectItem>
                  <SelectItem value="hide">Hide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Price Scale
              </label>
              <Select defaultValue="right">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
