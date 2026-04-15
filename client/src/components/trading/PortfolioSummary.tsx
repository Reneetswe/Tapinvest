import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PortfolioSummaryProps {
  portfolio: any;
}

export default function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  if (!portfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 dark:text-gray-400">
            Loading portfolio data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate portfolio metrics
  const totalValue = parseFloat(portfolio.totalValue || "0");
  const totalCost = parseFloat(portfolio.totalCost || "0");
  const cashBalance = parseFloat(portfolio.cashBalance || "0");
  
  // Calculate current market value of holdings
  const currentMarketValue = portfolio.holdings?.reduce((total: number, holding: any) => {
    return total + (holding.quantity * parseFloat(holding.stock.currentPrice));
  }, 0) || 0;

  const totalPortfolioValue = currentMarketValue + cashBalance;
  const totalPL = currentMarketValue - totalCost;
  const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  // Mock day's P&L (would be calculated from price changes)
  const daysPL = totalPL * 0.1; // Simplified calculation
  const daysPLPercent = totalPortfolioValue > 0 ? (daysPL / totalPortfolioValue) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return `BWP ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Total Value</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalPortfolioValue)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Day's P&L</span>
          <span className={`font-bold ${daysPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {daysPL >= 0 ? '+' : ''}{formatCurrency(daysPL)} ({daysPLPercent.toFixed(2)}%)
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Total P&L</span>
          <span className={`font-bold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalPL >= 0 ? '+' : ''}{formatCurrency(totalPL)} ({totalPLPercent.toFixed(2)}%)
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Cash Balance</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {formatCurrency(cashBalance)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Invested Amount</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {formatCurrency(currentMarketValue)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
