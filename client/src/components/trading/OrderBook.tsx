import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function OrderBook() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all orders
  const { data: allOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Fetch portfolio for holdings
  const { data: portfolio } = useQuery({
    queryKey: ["/api/portfolio"],
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiRequest("PATCH", `/api/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Cancel Failed",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `BWP ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'PENDING': { variant: 'secondary', label: 'Pending' },
      'PARTIAL': { variant: 'outline', label: 'Partial' },
      'FILLED': { variant: 'default', label: 'Filled' },
      'CANCELLED': { variant: 'destructive', label: 'Cancelled' },
    };

    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const openOrders = allOrders.filter((order: any) => 
    order.status === 'PENDING' || order.status === 'PARTIAL'
  );

  const completedOrders = allOrders.filter((order: any) => 
    order.status === 'FILLED' || order.status === 'CANCELLED'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Orders Section */}
      <Card>
        <Tabs defaultValue="open" className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="open">Open Orders ({openOrders.length})</TabsTrigger>
              <TabsTrigger value="history">Trade History ({completedOrders.length})</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="open" className="p-4">
            {ordersLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading orders...
              </div>
            ) : openOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No open orders
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Stock</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Type</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Qty</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Price</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openOrders.map((order: any) => (
                      <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 text-gray-900 dark:text-white font-medium">
                          {order.stock?.symbol || 'Unknown'}
                        </td>
                        <td className="py-3">
                          <span className={`${order.orderType === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                            {order.orderType}
                          </span>
                        </td>
                        <td className="py-3 text-gray-900 dark:text-white">{order.quantity}</td>
                        <td className="py-3 text-gray-900 dark:text-white">
                          {formatCurrency(order.price || order.stock?.currentPrice || 0)}
                        </td>
                        <td className="py-3">{getStatusBadge(order.status)}</td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelMutation.mutate(order.id)}
                            disabled={cancelMutation.isPending}
                            className="text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="p-4">
            {ordersLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading order history...
              </div>
            ) : completedOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No completed orders
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Stock</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Type</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Qty</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Price</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedOrders.map((order: any) => (
                      <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 text-gray-900 dark:text-white font-medium">
                          {order.stock?.symbol || 'Unknown'}
                        </td>
                        <td className="py-3">
                          <span className={`${order.orderType === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                            {order.orderType}
                          </span>
                        </td>
                        <td className="py-3 text-gray-900 dark:text-white">
                          {order.executedQuantity || order.quantity}
                        </td>
                        <td className="py-3 text-gray-900 dark:text-white">
                          {formatCurrency(order.executedPrice || order.price || 0)}
                        </td>
                        <td className="py-3">{getStatusBadge(order.status)}</td>
                        <td className="py-3 text-gray-900 dark:text-white">
                          {new Date(order.executedAt || order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Portfolio Holdings */}
      <Card>
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Holdings</h3>
        </div>
        
        <CardContent className="p-4">
          {!portfolio ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading portfolio...
            </div>
          ) : !portfolio.holdings || portfolio.holdings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No holdings yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Stock</th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Qty</th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Avg Price</th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Current</th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding: any) => {
                    const currentPrice = parseFloat(holding.stock.currentPrice);
                    const averagePrice = parseFloat(holding.averagePrice);
                    const quantity = holding.quantity;
                    const currentValue = currentPrice * quantity;
                    const totalCost = parseFloat(holding.totalCost);
                    const pl = currentValue - totalCost;
                    const plPercent = totalCost > 0 ? (pl / totalCost) * 100 : 0;
                    
                    return (
                      <tr key={holding.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 text-gray-900 dark:text-white font-medium">
                          {holding.stock.symbol}
                        </td>
                        <td className="py-3 text-gray-900 dark:text-white">{quantity}</td>
                        <td className="py-3 text-gray-900 dark:text-white">
                          {formatCurrency(averagePrice)}
                        </td>
                        <td className="py-3 text-gray-900 dark:text-white">
                          {formatCurrency(currentPrice)}
                        </td>
                        <td className="py-3">
                          <span className={`${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {pl >= 0 ? '+' : ''}{formatCurrency(pl)} ({plPercent.toFixed(2)}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
