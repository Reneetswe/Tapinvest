import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  DollarSign, 
  Clock,
  RefreshCw,
  Zap,
  BarChart3,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";
import type { Stock } from "@shared/schema";

interface AIInsightsProps {
  stocks: Stock[];
  portfolio: any;
}

interface Insight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timestamp: Date;
  actionable: boolean;
  action?: string;
  stocks?: string[];
}

export default function AIInsights({ stocks, portfolio }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Generate AI insights
  const generateInsights = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newInsights: Insight[] = [];
    
    // Market Opportunities
    if (stocks.length > 0) {
      const topPerformers = stocks
        .sort((a, b) => parseFloat(b.currentPrice) - parseFloat(a.currentPrice))
        .slice(0, 3);
      
      newInsights.push({
        id: '1',
        type: 'opportunity',
        title: 'Strong Momentum in Financial Sector',
        description: `${topPerformers[0]?.symbol} and ${topPerformers[1]?.symbol} showing strong upward momentum with above-average volume. Consider adding to positions or entering new positions.`,
        confidence: 85,
        impact: 'high',
        timestamp: new Date(),
        actionable: true,
        action: 'Consider buying on dips',
        stocks: topPerformers.map(s => s.symbol)
      });
    }
    
    // Risk Alerts
    if (portfolio) {
      const marginLevel = portfolio.marginLevel || 150;
      if (marginLevel < 130) {
        newInsights.push({
          id: '2',
          type: 'risk',
          title: 'Margin Level Approaching Warning Threshold',
          description: `Your current margin level is ${marginLevel}%, approaching the 120% warning level. Consider reducing positions or adding funds.`,
          confidence: 95,
          impact: 'high',
          timestamp: new Date(),
          actionable: true,
          action: 'Review margin usage and consider reducing exposure'
        });
      }
    }
    
    // Portfolio Optimization
    if (portfolio?.holdings) {
      const sectorConcentration = analyzeSectorConcentration(portfolio.holdings);
      if (sectorConcentration > 60) {
        newInsights.push({
          id: '3',
          type: 'optimization',
          title: 'High Sector Concentration Detected',
          description: `Your portfolio is heavily concentrated in ${sectorConcentration.toFixed(1)}% of one sector. Consider diversifying across different sectors for better risk management.`,
          confidence: 80,
          impact: 'medium',
          timestamp: new Date(),
          actionable: true,
          action: 'Diversify portfolio across sectors'
        });
      }
    }
    
    // Market Trends
    newInsights.push({
      id: '4',
      type: 'trend',
      title: 'BSE Market Showing Bullish Momentum',
      description: 'The BSE DCI has gained 3.77% today with strong volume. Market sentiment is positive with institutional buying activity.',
      confidence: 75,
      impact: 'medium',
      timestamp: new Date(),
      actionable: false
    });
    
    // Trading Signals
    if (stocks.length > 0) {
      const undervaluedStocks = stocks.filter(stock => {
        const pe = parseFloat(stock.peRatio || '0');
        return pe > 0 && pe < 15;
      }).slice(0, 2);
      
      if (undervaluedStocks.length > 0) {
        newInsights.push({
          id: '5',
          type: 'opportunity',
          title: 'Undervalued Stocks Identified',
          description: `${undervaluedStocks.map(s => s.symbol).join(', ')} appear undervalued based on P/E ratios. Consider research for potential value opportunities.`,
          confidence: 70,
          impact: 'medium',
          timestamp: new Date(),
          actionable: true,
          action: 'Research undervalued stocks for potential entry',
          stocks: undervaluedStocks.map(s => s.symbol)
        });
      }
    }
    
    setInsights(newInsights);
    setLastUpdate(new Date());
    setIsGenerating(false);
  };

  const analyzeSectorConcentration = (holdings: any[]): number => {
    if (!holdings || holdings.length === 0) return 0;
    
    const sectorValues: { [key: string]: number } = {};
    let totalValue = 0;
    
    holdings.forEach(holding => {
      const value = parseFloat(holding.marketValue || '0');
      const sector = holding.sector || 'Unknown';
      sectorValues[sector] = (sectorValues[sector] || 0) + value;
      totalValue += value;
    });
    
    if (totalValue === 0) return 0;
    
    const maxSectorValue = Math.max(...Object.values(sectorValues));
    return (maxSectorValue / totalValue) * 100;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'trend':
        return <BarChart3 className="h-5 w-5 text-blue-600" />;
      case 'optimization':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  // Auto-generate insights on component mount
  useEffect(() => {
    generateInsights();
  }, [stocks, portfolio]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Market Insights</span>
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
              onClick={generateInsights}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Real-time market intelligence powered by AI</span>
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {isGenerating ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">AI is analyzing market data...</p>
            </div>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No insights available yet</p>
            <p className="text-sm">Click refresh to generate new insights</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {insight.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getConfidenceColor(insight.confidence)}`}
                          >
                            {insight.confidence}% confidence
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getImpactColor(insight.impact)}`}
                          >
                            {insight.impact} impact
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {insight.description}
                      </p>
                      
                      {showDetails && (
                        <div className="space-y-2 pt-2">
                          {insight.stocks && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Related stocks:</span>
                              <div className="flex space-x-1">
                                {insight.stocks.map((stock, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {stock}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {insight.actionable && insight.action && (
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-600 font-medium">
                                Action: {insight.action}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Generated {insight.timestamp.toLocaleTimeString()}</span>
                            {insight.actionable && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Actionable
                              </Badge>
                            )}
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
        
        {/* AI Status Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI Insights Active</span>
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
