import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Lightbulb, 
  AlertTriangle,
  Brain,
  MessageSquare,
  Zap,
  Target,
  DollarSign,
  Clock
} from "lucide-react";
import { useStockPrice } from "@/hooks/useWebSocket";
import type { Stock } from "@shared/schema";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    stock?: string;
    analysis?: any;
    recommendations?: any[];
  };
}

interface AIAssistantProps {
  selectedStock: Stock | null;
  portfolio: any;
}

export default function AIAssistant({ selectedStock, portfolio }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI trading assistant. I can help you with:\n\n• Market analysis and stock insights\n• Trading recommendations\n• Portfolio optimization\n• Risk assessment\n• Technical analysis\n\nWhat would you like to know about today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'analysis' | 'insights'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Response Generation
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Stock Analysis
    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis') || lowerMessage.includes('stock')) {
      if (selectedStock) {
        return generateStockAnalysis(selectedStock);
      } else {
        return "I'd be happy to analyze a stock for you! Please select a stock from the trading interface first, then ask me to analyze it.";
      }
    }
    
    // Portfolio Analysis
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('holdings') || lowerMessage.includes('performance')) {
      return generatePortfolioAnalysis(portfolio);
    }
    
    // Trading Recommendations
    if (lowerMessage.includes('buy') || lowerMessage.includes('sell') || lowerMessage.includes('recommend')) {
      return generateTradingRecommendations(selectedStock, portfolio);
    }
    
    // Risk Assessment
    if (lowerMessage.includes('risk') || lowerMessage.includes('safe') || lowerMessage.includes('dangerous')) {
      return generateRiskAssessment(selectedStock, portfolio);
    }
    
    // Technical Analysis
    if (lowerMessage.includes('technical') || lowerMessage.includes('chart') || lowerMessage.includes('indicator')) {
      return generateTechnicalAnalysis(selectedStock);
    }
    
    // Market Overview
    if (lowerMessage.includes('market') || lowerMessage.includes('bse') || lowerMessage.includes('trend')) {
      return generateMarketOverview();
    }
    
    // General Help
    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
      return generateHelpResponse();
    }
    
    // Default response
    return generateDefaultResponse(userMessage);
  };

  const generateStockAnalysis = (stock: Stock): string => {
    const price = parseFloat(stock.currentPrice);
    const change = price - parseFloat(stock.previousClose || stock.currentPrice);
    const changePercent = (change / parseFloat(stock.previousClose || stock.currentPrice)) * 100;
    
    let sentiment = "neutral";
    let recommendation = "HOLD";
    
    if (changePercent > 2) {
      sentiment = "bullish";
      recommendation = "BUY";
    } else if (changePercent < -2) {
      sentiment = "bearish";
      recommendation = "SELL";
    }
    
    return `📊 **${stock.symbol} Analysis**\n\n**Current Price**: BWP ${price.toFixed(2)}\n**Change**: ${change >= 0 ? '+' : ''}${change.toFixed(3)} (${changePercent.toFixed(2)}%)\n**Sentiment**: ${sentiment.toUpperCase()}\n**Recommendation**: ${recommendation}\n\n**Key Insights**:\n• ${stock.sector || 'N/A'} sector stock\n• Market cap: ${stock.marketCap ? `BWP ${parseFloat(stock.marketCap).toLocaleString()}` : 'N/A'}\n• P/E Ratio: ${stock.peRatio || 'N/A'}\n• Dividend Yield: ${stock.dividendYield ? `${stock.dividendYield}%` : 'N/A'}\n\n**Trading Volume**: Moderate activity suggests healthy market interest.`;
  };

  const generatePortfolioAnalysis = (portfolio: any): string => {
    if (!portfolio) {
      return "I don't have access to your portfolio data yet. Please ensure your portfolio is loaded to receive personalized analysis.";
    }
    
    const totalValue = parseFloat(portfolio.totalValue || "0");
    const totalPnL = parseFloat(portfolio.totalPnL || "0");
    const pnlPercent = parseFloat(portfolio.totalPnLPercent || "0");
    
    let portfolioHealth = "Excellent";
    if (pnlPercent < 0) portfolioHealth = "Needs Attention";
    else if (pnlPercent < 5) portfolioHealth = "Good";
    else if (pnlPercent < 10) portfolioHealth = "Very Good";
    
    return `💼 **Portfolio Analysis**\n\n**Total Value**: BWP ${totalValue.toLocaleString()}\n**Total P&L**: ${totalPnL >= 0 ? '+' : ''}BWP ${totalPnL.toLocaleString()}\n**Return**: ${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%\n**Health**: ${portfolioHealth}\n\n**Key Metrics**:\n• Cash Balance: BWP ${parseFloat(portfolio.cashBalance || "0").toLocaleString()}\n• Margin Level: ${portfolio.marginLevel || 0}%\n• Risk Level: ${portfolio.riskLevel || 'Moderate'}\n\n**Recommendations**:\n• ${pnlPercent < 0 ? 'Consider rebalancing to reduce losses' : 'Portfolio performing well, maintain current strategy'}\n• Monitor margin levels for risk management\n• Diversify across different sectors if heavily concentrated`;
  };

  const generateTradingRecommendations = (stock: Stock | null, portfolio: any): string => {
    if (!stock) {
      return "To provide trading recommendations, please select a stock first. I can then analyze its current position and suggest optimal entry/exit points.";
    }
    
    const price = parseFloat(stock.currentPrice);
    const change = price - parseFloat(stock.previousClose || stock.currentPrice);
    const changePercent = (change / parseFloat(stock.previousClose || stock.currentPrice)) * 100;
    
    let action = "HOLD";
    let reasoning = "";
    
    if (changePercent > 3) {
      action = "SELL";
      reasoning = "Stock has shown strong upward momentum, consider taking profits";
    } else if (changePercent < -3) {
      action = "BUY";
      reasoning = "Stock has declined significantly, potential buying opportunity";
    } else if (changePercent > 0) {
      action = "HOLD/BUY";
      reasoning = "Moderate upward trend, consider small position or hold existing";
    } else {
      action = "HOLD/SELL";
      reasoning = "Moderate decline, evaluate if you want to cut losses or wait for recovery";
    }
    
    return `🎯 **Trading Recommendation for ${stock.symbol}**\n\n**Action**: ${action}\n**Current Price**: BWP ${price.toFixed(2)}\n**Price Change**: ${changePercent.toFixed(2)}%\n\n**Reasoning**:\n${reasoning}\n\n**Risk Considerations**:\n• Set stop-loss at BWP ${(price * 0.95).toFixed(2)} (5% below current)\n• Take profit target: BWP ${(price * 1.08).toFixed(2)} (8% above current)\n• Monitor volume for confirmation of trend\n\n**Portfolio Impact**:\n• Consider position sizing based on your risk tolerance\n• Ensure portfolio diversification is maintained`;
  };

  const generateRiskAssessment = (stock: Stock | null, portfolio: any): string => {
    if (!stock) {
      return "I need a stock selection to provide risk assessment. Please choose a stock and I'll analyze its risk profile for you.";
    }
    
    const price = parseFloat(stock.currentPrice);
    const volatility = Math.random() * 20 + 10; // Simulated volatility
    const beta = 0.8 + Math.random() * 0.4; // Simulated beta
    
    let riskLevel = "Low";
    if (volatility > 25) riskLevel = "High";
    else if (volatility > 18) riskLevel = "Medium";
    
    let marketRisk = "Low";
    if (beta > 1.1) marketRisk = "High";
    else if (beta > 0.9) marketRisk = "Medium";
    
    return `⚠️ **Risk Assessment for ${stock.symbol}**\n\n**Overall Risk Level**: ${riskLevel}\n**Price**: BWP ${price.toFixed(2)}\n\n**Risk Metrics**:\n• **Volatility**: ${volatility.toFixed(1)}% (Industry avg: 15%)\n• **Beta**: ${beta.toFixed(2)} (Market sensitivity)\n• **Market Risk**: ${marketRisk}\n\n**Risk Factors**:\n• ${stock.sector || 'N/A'} sector exposure\n• Market correlation: ${beta > 1 ? 'Higher than market' : 'Lower than market'}\n• Liquidity: ${volatility < 15 ? 'Good' : 'Moderate'}\n\n**Risk Mitigation**:\n• Use stop-loss orders\n• Position size: ${riskLevel === 'High' ? 'Small (1-2% of portfolio)' : 'Moderate (3-5% of portfolio)'}\n• Monitor market conditions\n• Diversify across sectors`;
  };

  const generateTechnicalAnalysis = (stock: Stock | null): string => {
    if (!stock) {
      return "Please select a stock to receive technical analysis. I'll provide insights on support/resistance levels, trends, and technical indicators.";
    }
    
    const price = parseFloat(stock.currentPrice);
    const support1 = price * 0.95;
    const support2 = price * 0.90;
    const resistance1 = price * 1.05;
    const resistance2 = price * 1.10;
    
    return `📈 **Technical Analysis for ${stock.symbol}**\n\n**Current Price**: BWP ${price.toFixed(2)}\n\n**Support Levels**:\n• Support 1: BWP ${support1.toFixed(2)} (5% below)\n• Support 2: BWP ${support2.toFixed(2)} (10% below)\n\n**Resistance Levels**:\n• Resistance 1: BWP ${resistance1.toFixed(2)} (5% above)\n• Resistance 2: BWP ${resistance2.toFixed(2)} (10% above)\n\n**Technical Indicators**:\n• **RSI**: 65.4 (Neutral - not overbought/oversold)\n• **MACD**: 0.023 (Bullish momentum building)\n• **Moving Averages**:\n  - MA20: BWP ${(price * 0.98).toFixed(2)} (Price above MA20 - bullish)\n  - MA50: BWP ${(price * 0.95).toFixed(2)} (Price above MA50 - strong trend)\n\n**Chart Pattern**: Uptrend with consolidation\n**Volume**: Above average, supporting price action\n\n**Trading Signals**:\n• Buy on dips near support levels\n• Take profits at resistance levels\n• Monitor volume for trend confirmation`;
  };

  const generateMarketOverview = (): string => {
    return `🌍 **BSE Market Overview**\n\n**Market Status**: Open\n**BSE DCI**: 10,428.27 (+3.77%)\n**Trading Volume**: 2.4M BWP\n**Market Cap**: 654B BWP\n\n**Sector Performance**:\n• **Financials**: +2.8% (Letshego, ABSA leading)\n• **Consumer Services**: +1.5% (Chobe Holdings stable)\n• **Oil & Gas**: +0.8% (Engen Botswana)\n\n**Market Sentiment**:\n• Overall: Bullish\n• Volume: Above average\n• Volatility: Moderate\n\n**Key Drivers**:\n• Strong corporate earnings\n• Positive economic outlook\n• Foreign investment flows\n\n**Trading Opportunities**:\n• Focus on financial sector momentum\n• Consider defensive stocks for stability\n• Monitor volume for entry/exit timing`;
  };

  const generateHelpResponse = (): string => {
    return `🤖 **How I Can Help You**\n\n**Trading Analysis**:\n• Ask me to "analyze [stock symbol]" for detailed insights\n• Get trading recommendations with "should I buy/sell [stock]?"\n• Request risk assessment with "what's the risk of [stock]?"\n\n**Portfolio Management**:\n• Ask "analyze my portfolio" for performance insights\n• Get optimization suggestions\n• Risk assessment and diversification advice\n\n**Market Intelligence**:\n• Ask "market overview" for BSE trends\n• Sector analysis and performance\n• Economic impact on stocks\n\n**Technical Analysis**:\n• Request "technical analysis of [stock]"\n• Support/resistance levels\n• Chart patterns and indicators\n\n**Quick Commands**:\n• "Help" - Show this guide\n• "Analysis" - Stock analysis\n• "Portfolio" - Portfolio insights\n• "Market" - Market overview\n• "Risk" - Risk assessment`;
  };

  const generateDefaultResponse = (userMessage: string): string => {
    const responses = [
      "I understand you're asking about trading. Could you be more specific? I can help with stock analysis, portfolio management, or market insights.",
      "That's an interesting question about the market. To provide the best assistance, could you clarify what specific aspect you'd like me to focus on?",
      "I'm here to help with your trading decisions. Would you like me to analyze a specific stock, review your portfolio, or provide market insights?",
      "I want to make sure I give you the most relevant information. Are you looking for trading advice, risk assessment, or general market information?",
      "Let me help you make informed trading decisions. What specific stock or market aspect would you like me to analyze?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      const aiResponse = await generateAIResponse(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSendMessage();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 shadow-none">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>AI Trading Assistant</span>
          <Badge variant="secondary" className="ml-auto">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("Analyze my portfolio")}
            className="text-xs"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Portfolio
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("Market overview")}
            className="text-xs"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Market
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("Risk assessment")}
            className="text-xs"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Risk
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("Trading recommendations")}
            className="text-xs"
          >
            <Target className="h-3 w-3 mr-1" />
            Trade
          </Button>
        </div>

        {/* Chat Messages - Scrollable */}
        <div className="flex-1 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 overflow-y-auto min-h-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex space-x-2 flex-shrink-0">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me about trading, stocks, or portfolio..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Status */}
        <div className="flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>AI Assistant Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>Powered by Advanced AI</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
