import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { Stock } from "@shared/schema";

interface StockChartProps {
  stock: Stock;
}

export default function StockChart({ stock }: StockChartProps) {
  const [priceData, setPriceData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(stock.currentPrice);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `BWP ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Generate mock price data for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const data = [];
      const basePrice = parseFloat(stock.currentPrice);
      let currentPrice = basePrice;
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Simulate price movement
        const change = (Math.random() - 0.5) * 0.1; // -5% to +5%
        currentPrice = Math.max(0.01, currentPrice * (1 + change));
        
        data.push({
          date: date.toISOString().split('T')[0],
          price: currentPrice,
          volume: Math.floor(Math.random() * 1000) + 100,
          high: currentPrice * (1 + Math.random() * 0.05),
          low: currentPrice * (1 - Math.random() * 0.05),
          open: currentPrice * (1 + (Math.random() - 0.5) * 0.02),
        });
      }
      
      setPriceData(data);
    };

    generateMockData();
  }, [stock.currentPrice]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`ws://${window.location.host}/ws`);
        
        ws.onopen = () => {
          setIsConnected(true);
          console.log('WebSocket connected');
          
          // Subscribe to stock updates
          ws.send(JSON.stringify({
            type: 'subscribe',
            symbols: [stock.symbol]
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'priceUpdate' && data.symbol === stock.symbol) {
              const newPrice = data.price;
              const oldPrice = parseFloat(currentPrice);
              const change = newPrice - oldPrice;
              const changePercent = (change / oldPrice) * 100;
              
              setCurrentPrice(newPrice.toString());
              setPriceChange(change);
              setPriceChangePercent(changePercent);
              
              // Update price data
              setPriceData(prev => {
                const newData = [...prev];
                if (newData.length > 0) {
                  newData[newData.length - 1] = {
                    ...newData[newData.length - 1],
                    price: newPrice,
                    high: Math.max(newData[newData.length - 1].high, newPrice),
                    low: Math.min(newData[newData.length - 1].low, newPrice),
                  };
                }
                return newData;
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket disconnected');
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [stock.symbol, currentPrice]);

  // Calculate technical indicators
  const calculateMA = (period: number) => {
    if (priceData.length < period) return [];
    
    const ma = [];
    for (let i = period - 1; i < priceData.length; i++) {
      const sum = priceData.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.price, 0);
      ma.push(sum / period);
    }
    return ma;
  };

  const calculateRSI = (period: number = 14) => {
    if (priceData.length < period + 1) return [];
    
    const rsi = [];
    for (let i = period; i < priceData.length; i++) {
      let gains = 0;
      let losses = 0;
      
      for (let j = i - period + 1; j <= i; j++) {
        const change = priceData[j].price - priceData[j - 1].price;
        if (change > 0) gains += change;
        else losses -= change;
      }
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      
      rsi.push(rsiValue);
    }
    
    return rsi;
  };

  const ma20 = calculateMA(20);
  const ma50 = calculateMA(50);
  const rsi = calculateRSI(14);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{stock.symbol} Price Chart</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stock.name} • Real-time updates
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Live" : "Offline"}
            </Badge>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Price Display */}
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {formatCurrency(currentPrice)}
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-1 ${
              priceChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {priceChange >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange)}
              </span>
            </div>
            <Badge variant={priceChange >= 0 ? "default" : "destructive"}>
              {formatPercentage(priceChangePercent)}
            </Badge>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="relative h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <canvas
            ref={(canvas) => {
              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  // Clear canvas
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  
                  // Set canvas size
                  canvas.width = canvas.offsetWidth;
                  canvas.height = canvas.offsetHeight;
                  
                  // Draw price chart
                  if (priceData.length > 0) {
                    const width = canvas.width - 80;
                    const height = canvas.height - 40;
                    const padding = 20;
                    
                    // Find price range
                    const prices = priceData.map(d => d.price);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const priceRange = maxPrice - minPrice;
                    
                    // Draw price line
                    ctx.strokeStyle = '#3b82f6';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    
                    priceData.forEach((data, index) => {
                      const x = padding + (index / (priceData.length - 1)) * width;
                      const y = padding + height - ((data.price - minPrice) / priceRange) * height;
                      
                      if (index === 0) {
                        ctx.moveTo(x, y);
                      } else {
                        ctx.lineTo(x, y);
                      }
                    });
                    
                    ctx.stroke();
                    
                    // Draw MA lines
                    if (ma20.length > 0) {
                      ctx.strokeStyle = '#10b981';
                      ctx.lineWidth = 1;
                      ctx.beginPath();
                      
                      ma20.forEach((value, index) => {
                        const dataIndex = priceData.length - ma20.length + index;
                        const x = padding + (dataIndex / (priceData.length - 1)) * width;
                        const y = padding + height - ((value - minPrice) / priceRange) * height;
                        
                        if (index === 0) {
                          ctx.moveTo(x, y);
                        } else {
                          ctx.lineTo(x, y);
                        }
                      });
                      
                      ctx.stroke();
                    }
                    
                    // Draw volume bars
                    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
                    priceData.forEach((data, index) => {
                      const x = padding + (index / (priceData.length - 1)) * width;
                      const volumeHeight = (data.volume / 1000) * (height * 0.3);
                      const y = padding + height - volumeHeight;
                      
                      ctx.fillRect(x - 2, y, 4, volumeHeight);
                    });
                  }
                }
              }
            }}
            className="w-full h-full"
          />
          
          {/* Chart Legend */}
          <div className="absolute top-2 right-2 text-xs space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Price</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">MA20</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-300 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Volume</span>
            </div>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">RSI (14)</p>
            <p className={`text-lg font-bold ${
              rsi.length > 0 ? 
                (rsi[rsi.length - 1] > 70 ? 'text-red-600' : 
                 rsi[rsi.length - 1] < 30 ? 'text-green-600' : 'text-gray-900 dark:text-white') 
                : 'text-gray-900 dark:text-white'
            }`}>
              {rsi.length > 0 ? rsi[rsi.length - 1].toFixed(1) : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {rsi.length > 0 ? 
                (rsi[rsi.length - 1] > 70 ? 'Overbought' : 
                 rsi[rsi.length - 1] < 30 ? 'Oversold' : 'Neutral') 
                : 'N/A'
              }
            </p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">MA20</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {ma20.length > 0 ? formatCurrency(ma20[ma20.length - 1]) : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {ma20.length > 0 ? 
                (parseFloat(currentPrice) > ma20[ma20.length - 1] ? 'Above MA' : 'Below MA') 
                : 'N/A'
              }
            </p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">MA50</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {ma50.length > 0 ? formatCurrency(ma50[ma50.length - 1]) : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {ma50.length > 0 ? 
                (parseFloat(currentPrice) > ma50[ma50.length - 1] ? 'Above MA' : 'Below MA') 
                : 'N/A'
              }
            </p>
          </div>
        </div>
        
        {/* Market Data */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Open</p>
            <p className="font-medium">{formatCurrency(priceData[0]?.open || 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">High</p>
            <p className="font-medium">{formatCurrency(priceData[0]?.high || 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Low</p>
            <p className="font-medium">{formatCurrency(priceData[0]?.low || 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Volume</p>
            <p className="font-medium">{(priceData[0]?.volume || 0).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
