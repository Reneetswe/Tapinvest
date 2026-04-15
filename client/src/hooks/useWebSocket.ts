import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  symbol?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  timestamp?: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    onMessage,
    onConnect,
    onDisconnect,
    autoReconnect = true,
    reconnectInterval = 5000,
  } = options;

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        onConnect?.();
        console.log('WebSocket connected to BSE trading feed');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();
        console.log('WebSocket disconnected from BSE trading feed');
        
        // Auto-reconnect if enabled
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
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
  }, [onConnect, onDisconnect, onMessage, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const subscribeToSymbol = useCallback((symbol: string) => {
    sendMessage({
      type: 'subscribe',
      symbols: [symbol],
    });
  }, [sendMessage]);

  const unsubscribeFromSymbol = useCallback((symbol: string) => {
    sendMessage({
      type: 'unsubscribe',
      symbols: [symbol],
    });
  }, [sendMessage]);

  // Connect on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribeToSymbol,
    unsubscribeFromSymbol,
    connect,
    disconnect,
  };
}

// Specialized hook for stock price updates
export function useStockPrice(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number>(0);
  const [changePercent, setChangePercent] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'priceUpdate' && message.symbol === symbol) {
      if (message.price !== undefined) {
        setPrice(prevPrice => {
          if (prevPrice !== null) {
            const priceChange = message.price! - prevPrice;
            const priceChangePercent = (priceChange / prevPrice) * 100;
            setChange(priceChange);
            setChangePercent(priceChangePercent);
          }
          return message.price!;
        });
        setLastUpdate(new Date());
      }
    }
  }, [symbol]);

  const { isConnected, subscribeToSymbol, unsubscribeFromSymbol } = useWebSocket({
    onMessage: handleMessage,
  });

  useEffect(() => {
    if (isConnected && symbol) {
      subscribeToSymbol(symbol);
      
      return () => {
        unsubscribeFromSymbol(symbol);
      };
    }
  }, [isConnected, symbol, subscribeToSymbol, unsubscribeFromSymbol]);

  return {
    price,
    change,
    changePercent,
    lastUpdate,
    isConnected,
  };
}

// Hook for portfolio updates
export function usePortfolioUpdates() {
  const [portfolioUpdate, setPortfolioUpdate] = useState<any>(null);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'portfolioUpdate') {
      setPortfolioUpdate(message);
    }
  }, []);

  const { isConnected } = useWebSocket({
    onMessage: handleMessage,
  });

  return {
    portfolioUpdate,
    isConnected,
  };
}

// Hook for order updates
export function useOrderUpdates() {
  const [orderUpdate, setOrderUpdate] = useState<any>(null);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'orderUpdate') {
      setOrderUpdate(message);
    }
  }, []);

  const { isConnected } = useWebSocket({
    onMessage: handleMessage,
  });

  return {
    orderUpdate,
    isConnected,
  };
}
