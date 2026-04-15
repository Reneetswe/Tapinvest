import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Stock } from "@shared/schema";

interface TradePanelProps {
  stock: Stock;
  broker: string;
  portfolio: any;
}

export default function TradePanel({ stock, broker, portfolio }: TradePanelProps) {
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderStyle, setOrderStyle] = useState<'MARKET' | 'LIMIT' | 'STOP_LOSS'>('MARKET');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [useStopLoss, setUseStopLoss] = useState(false);
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `BWP ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Calculate order details
  const currentPrice = parseFloat(price || stock.currentPrice);
  const quantityNum = parseFloat(quantity) || 0;
  const totalValue = currentPrice * quantityNum;
  const commission = 2.50; // Default commission
  const totalCost = totalValue + commission;
  
  // Calculate margin requirements (assuming 50% margin requirement)
  const marginRequired = totalCost * 0.5;
  const availableMargin = parseFloat(portfolio?.cashBalance || "0");
  const marginLevel = availableMargin / marginRequired * 100;

  // Check if order is valid
  const isValidOrder = quantityNum > 0 && currentPrice > 0;
  const hasSufficientFunds = orderType === 'BUY' ? availableMargin >= totalCost : true;
  const hasSufficientShares = orderType === 'SELL' ? 
    (portfolio?.holdings?.find((h: any) => h.stockId === stock.id)?.quantity || 0) >= quantityNum : true;

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order Created",
        description: `${orderType} order for ${quantity} shares of ${stock.symbol} has been submitted.`,
        variant: "default",
      });
      
      // Reset form
      setQuantity('');
      setPrice('');
      setStopLoss('');
      setTakeProfit('');
      setConfirmOrder(false);
      
      // Refresh portfolio data
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitOrder = () => {
    if (!isValidOrder || !hasSufficientFunds || !hasSufficientShares) {
      return;
    }

    const orderData = {
      stockId: stock.id,
      broker: broker || 'stockbrokers-botswana',
      orderType,
      orderStyle,
      quantity: quantityNum,
      price: orderStyle === 'MARKET' ? undefined : currentPrice,
      stopLoss: useStopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: useTakeProfit ? parseFloat(takeProfit) : undefined,
    };

    createOrderMutation.mutate(orderData);
  };

  const handleQuickOrder = (qty: number) => {
    setQuantity(qty.toString());
    setPrice(stock.currentPrice);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trade {stock.symbol}</span>
          <Badge variant={orderType === 'BUY' ? 'default' : 'destructive'}>
            {orderType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
            variant={orderType === 'BUY' ? 'default' : 'outline'}
            onClick={() => setOrderType('BUY')}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>BUY</span>
            </Button>
            <Button
            variant={orderType === 'SELL' ? 'destructive' : 'outline'}
            onClick={() => setOrderType('SELL')}
            className="flex items-center space-x-2"
          >
            <TrendingDown className="h-4 w-4" />
            <span>SELL</span>
            </Button>
          </div>

        {/* Order Style */}
          <div className="space-y-2">
          <Label>Order Style</Label>
          <Select value={orderStyle} onValueChange={(value: any) => setOrderStyle(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MARKET">Market Order</SelectItem>
                <SelectItem value="LIMIT">Limit Order</SelectItem>
                <SelectItem value="STOP_LOSS">Stop Loss</SelectItem>
              </SelectContent>
            </Select>
          </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label>Quantity (Shares)</Label>
          <Input
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
          
          {/* Quick Quantity Buttons */}
          <div className="flex gap-2">
            {[100, 500, 1000, 5000].map((qty) => (
              <Button
                key={qty}
                variant="outline"
                size="sm"
                onClick={() => handleQuickOrder(qty)}
                className="flex-1"
              >
                {formatNumber(qty)}
              </Button>
            ))}
          </div>
        </div>

        {/* Price */}
        {orderStyle !== 'MARKET' && (
          <div className="space-y-2">
            <Label>Price (BWP)</Label>
            <Input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0.01"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current: {formatCurrency(stock.currentPrice)}
            </div>
          </div>
        )}

        {/* Stop Loss & Take Profit */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={useStopLoss}
              onCheckedChange={setUseStopLoss}
            />
            <Label>Stop Loss</Label>
          </div>
          
          {useStopLoss && (
            <Input
              type="number"
              placeholder="Stop Loss Price"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              step="0.01"
              min="0.01"
            />
          )}

          <div className="flex items-center space-x-2">
            <Switch
              checked={useTakeProfit}
              onCheckedChange={setUseTakeProfit}
            />
            <Label>Take Profit</Label>
          </div>
          
          {useTakeProfit && (
            <Input
              type="number"
              placeholder="Take Profit Price"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              step="0.01"
              min="0.01"
            />
          )}
        </div>

        <Separator />

          {/* Order Summary */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <Calculator className="h-4 w-4 mr-2" />
            Order Summary
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
              <span>{formatNumber(quantityNum)} shares</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Price:</span>
              <span>{formatCurrency(currentPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
              <span>{formatCurrency(totalValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Commission:</span>
              <span>{formatCurrency(commission)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total Cost:</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Margin Information */}
        {orderType === 'BUY' && (
          <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Margin Requirements
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Margin Required:</span>
                <span className="text-blue-900 dark:text-blue-100">{formatCurrency(marginRequired)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Available Margin:</span>
                <span className="text-blue-900 dark:text-blue-100">{formatCurrency(availableMargin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Margin Level:</span>
                <span className={`font-medium ${
                  marginLevel > 150 ? 'text-green-600' : 
                  marginLevel > 120 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {marginLevel.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

          {/* Validation Messages */}
        {!hasSufficientFunds && orderType === 'BUY' && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Insufficient Funds</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              You need {formatCurrency(totalCost)} but only have {formatCurrency(availableMargin)} available.
            </p>
            </div>
          )}
          
        {!hasSufficientShares && orderType === 'SELL' && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Insufficient Shares</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              You don't have enough shares to sell.
            </p>
            </div>
          )}

        {/* Order Confirmation */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={confirmOrder}
            onCheckedChange={setConfirmOrder}
          />
          <Label>I confirm this order</Label>
        </div>

        {/* Submit Button */}
          <Button
            className="w-full"
          size="lg"
          disabled={!isValidOrder || !hasSufficientFunds || !hasSufficientShares || !confirmOrder || createOrderMutation.isPending}
          onClick={handleSubmitOrder}
        >
          {createOrderMutation.isPending ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {orderType === 'BUY' ? (
                <TrendingUp className="h-4 w-4 mr-2" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-2" />
              )}
              {orderType} {stock.symbol}
            </>
          )}
          </Button>

        {/* Order Status */}
        {createOrderMutation.isSuccess && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Order Submitted Successfully</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your order has been submitted and is being processed.
            </p>
          </div>
        )}

        {/* Risk Warning */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Risk Warning</span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Trading involves risk. Past performance does not guarantee future results. 
            Please ensure you understand the risks before trading.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
