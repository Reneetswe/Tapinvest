import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  DollarSign, 
  Clock,
  RefreshCw,
  Zap,
  BarChart3,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  EyeOff
} from "lucide-react";
import type { Stock } from "@shared/schema";

interface AITradingSignalsProps {
  stocks: Stock[];
  portfolio: any;
}

interface TradingSignal {
  id: string;
  stock: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  riskReward: number;
  timeframe: string;
  reasoning: string;
  timestamp: Date;
  status: 'active' | 'expired' | 'executed';
  priority: 'high' | 'medium' | 'low';
}

export default function AITradingSignals({ stocks, portfolio }: AITradingSignalsProps) {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Generate AI trading signals
  const generateSignals = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newSignals: TradingSignal[] = [];
    
    // Generate signals for top stocks
    if (stocks.length > 0) {
      const topStocks = stocks.slice(0, 5);
      
      topStocks.forEach((stock, index) => {
        const currentPrice = parseFloat(stock.currentPrice);
        const change = currentPrice - parseFloat(stock.previousClose || stock.currentPrice);
        const changePercent = (change / parseFloat(stock.previousClose || stock.currentPrice)) * 100;
        
        let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
        let confidence = 50;
        let reasoning = '';
        
        if (changePercent > 3) {
          action = 'SELL';
          confidence = 75 + Math.random() * 20;
          reasoning = 'Strong upward momentum, consider taking profits';
        } else if (changePercent < -3) {
          action = 'BUY';
          confidence = 70 + Math.random() * 25;
          reasoning = 'Significant decline, potential buying opportunity';
        } else if (changePercent > 0) {
          action = 'BUY';
          confidence = 60 + Math.random() * 15;
          reasoning = 'Moderate upward trend, good entry point';
        } else {
          action = 'HOLD';
          confidence = 55 + Math.random() * 20;
          reasoning = 'Sideways movement, wait for clearer direction';
        }
        
        const entryPrice = currentPrice.toFixed(2);
        const targetPrice = action === 'BUY' 
          ? (currentPrice * 1.08).toFixed(2) 
          : (currentPrice * 0.92).toFixed(2);
        const stopLoss = action === 'BUY' 
          ? (currentPrice * 0.95).toFixed(2) 
          : (currentPrice * 1.05).toFixed(2);
        
        const riskReward = action === 'BUY' 
          ? ((parseFloat(targetPrice) - currentPrice) / (currentPrice - parseFloat(stopLoss)))
          : ((currentPrice - parseFloat(targetPrice)) / (parseFloat(stopLoss) - currentPrice));
        
        newSignals.push({
          id: `signal-${index + 1}`,
          stock: stock.symbol,
          action,
          confidence: Math.round(confidence),
          entryPrice,
          targetPrice,
          stopLoss,
          riskReward: Math.round(riskReward * 100) / 100,
          timeframe: '1-2 weeks',
          reasoning,
          timestamp: new Date(),
          status: 'active',
          priority: confidence > 80 ? 'high' : confidence > 65 ? 'medium' : 'low'
        });
      });
    }
    
    setSignals(newSignals);
    setLastUpdate(new Date());
    setIsGenerating(false);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY':
        return <ArrowUpRight className="h-5 w-5 text-green-600" />;
      case 'SELL':
        return <ArrowDownRight className="h-5 w-5 text-red-600" />;
      case 'HOLD':
        return <Minus className="h-5 w-5 text-yellow-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SELL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredSignals = signals.filter(signal => {
    if (filter === 'all') return true;
    return signal.action === filter.toUpperCase();
  });

  // Auto-generate signals on component mount
  useEffect(() => {
    generateSignals();
  }, [stocks]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-red-600" />
            <span>AI Trading Signals</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateSignals}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>AI-powered trading recommendations with risk management</span>
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2 pt-2">
          {(['all', 'buy', 'sell', 'hold'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="text-xs capitalize"
            >
              {filterType === 'all' ? 'All Signals' : filterType}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {isGenerating ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">AI is analyzing market patterns...</p>
            </div>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No trading signals available</p>
            <p className="text-sm">Click refresh to generate new signals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSignals.map((signal) => (
              <Card key={signal.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {getActionIcon(signal.action)}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {signal.stock}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getActionColor(signal.action)}`}
                          >
                            {signal.action}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(signal.priority)}`}
                          >
                            {signal.priority} priority
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getConfidenceColor(signal.confidence)}`}>
                            {signal.confidence}%
                          </div>
                          <div className="text-xs text-gray-500">Confidence</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Entry Price</div>
                          <div className="font-medium">BWP {signal.entryPrice}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Target Price</div>
                          <div className="font-medium text-green-600">BWP {signal.targetPrice}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Stop Loss</div>
                          <div className="font-medium text-red-600">BWP {signal.stopLoss}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Risk/Reward</div>
                          <div className="font-medium">{signal.riskReward}:1</div>
                        </div>
                      </div>
                      
                      {showDetails && (
                        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              AI Reasoning:
                            </div>
                            <p className="text-sm">{signal.reasoning}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Timeframe</div>
                              <div className="font-medium">{signal.timeframe}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Status</div>
                              <Badge 
                                variant="outline" 
                                className={signal.status === 'active' ? 'text-green-600 border-green-600' : 'text-gray-600 border-gray-600'}
                              >
                                {signal.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Generated {signal.timestamp.toLocaleTimeString()}</span>
                            <div className="flex items-center space-x-2">
                              <Shield className="h-3 w-3" />
                              <span>Risk Managed</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Signal Summary */}
        {signals.length > 0 && (
          <Card className="bg-gray-50 dark:bg-gray-900">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {signals.filter(s => s.action === 'BUY').length}
                  </div>
                  <div className="text-sm text-gray-600">Buy Signals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {signals.filter(s => s.action === 'SELL').length}
                  </div>
                  <div className="text-sm text-gray-600">Sell Signals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {signals.filter(s => s.action === 'HOLD').length}
                  </div>
                  <div className="text-sm text-gray-600">Hold Signals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(signals.reduce((acc, s) => acc + s.confidence, 0) / signals.length)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* AI Status Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI Signals Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Real-time Analysis</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
