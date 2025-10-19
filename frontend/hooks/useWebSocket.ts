import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebSocketClient } from '../lib/websocket';

interface UseWebSocketOptions {
  channels?: string[];
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  subscribe: (channel: string, handler: (data: any) => void) => void;
  unsubscribe: (channel: string, handler: (data: any) => void) => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler: (data: any) => void) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { channels = [], autoConnect = true, onConnect, onDisconnect } = options;
  const [isConnected, setIsConnected] = useState(false);
  const wsClient = useRef(getWebSocketClient());
  const handlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    const client = wsClient.current;

    // Connection handlers
    const handleConnect = () => {
      setIsConnected(true);
      onConnect?.();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      onDisconnect?.();
    };

    client.onConnect(handleConnect);
    client.onDisconnect(handleDisconnect);

    // Auto-connect
    if (autoConnect && !client.isConnected()) {
      client.connect().catch(error => {
        console.error('[useWebSocket] Connection failed:', error);
      });
    }

    // Subscribe to initial channels
    channels.forEach(channel => {
      client.subscribe(channel);
    });

    // Update connection status
    setIsConnected(client.isConnected());

    // Cleanup
    return () => {
      // Unsubscribe from channels
      channels.forEach(channel => {
        client.unsubscribe(channel);
      });

      // Remove all registered handlers
      handlersRef.current.forEach((handlers, event) => {
        handlers.forEach(handler => {
          client.off(event, handler);
        });
      });
      handlersRef.current.clear();
    };
  }, [autoConnect, onConnect, onDisconnect]);

  const subscribe = useCallback((channel: string, handler: (data: any) => void) => {
    wsClient.current.subscribe(channel, handler);

    // Track handler for cleanup
    if (!handlersRef.current.has(channel)) {
      handlersRef.current.set(channel, new Set());
    }
    handlersRef.current.get(channel)!.add(handler);
  }, []);

  const unsubscribe = useCallback((channel: string, handler: (data: any) => void) => {
    wsClient.current.unsubscribe(channel, handler);

    // Remove from tracked handlers
    const handlers = handlersRef.current.get(channel);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        handlersRef.current.delete(channel);
      }
    }
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    wsClient.current.on(event, handler);

    // Track handler for cleanup
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);
  }, []);

  const off = useCallback((event: string, handler: (data: any) => void) => {
    wsClient.current.off(event, handler);

    // Remove from tracked handlers
    const handlers = handlersRef.current.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        handlersRef.current.delete(event);
      }
    }
  }, []);

  return {
    isConnected,
    subscribe,
    unsubscribe,
    on,
    off,
  };
}

// Specialized hooks for common use cases

export function useAgentWebSocket(agentId: string) {
  const [priceData, setPriceData] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [graduation, setGraduation] = useState<any>(null);

  const { isConnected, subscribe, unsubscribe } = useWebSocket({
    channels: [`agent:${agentId}`],
  });

  useEffect(() => {
    const handlePriceUpdate = (message: any) => {
      if (message.data) {
        setPriceData(message.data);
      }
    };

    const handleTradeExecuted = (message: any) => {
      if (message.data) {
        setTrades(prev => [message.data, ...prev].slice(0, 50));
      }
    };

    const handleGraduation = (message: any) => {
      if (message.data) {
        setGraduation(message.data);
      }
    };

    subscribe(`agent:${agentId}`, (message) => {
      switch (message.type) {
        case 'price_update':
          handlePriceUpdate(message);
          break;
        case 'trade_executed':
          handleTradeExecuted(message);
          break;
        case 'graduation':
          handleGraduation(message);
          break;
      }
    });

    return () => {
      // Cleanup happens automatically via useWebSocket
    };
  }, [agentId, subscribe, unsubscribe]);

  return {
    isConnected,
    priceData,
    trades,
    graduation,
  };
}

export function usePricesWebSocket() {
  const [prices, setPrices] = useState<Map<string, any>>(new Map());

  const { isConnected, subscribe } = useWebSocket({
    channels: ['prices'],
  });

  useEffect(() => {
    const handlePriceUpdate = (message: any) => {
      if (message.data && message.data.agentId) {
        setPrices(prev => new Map(prev).set(message.data.agentId, message.data));
      }
    };

    subscribe('prices', handlePriceUpdate);
  }, [subscribe]);

  return {
    isConnected,
    prices,
  };
}

export function useTradesWebSocket() {
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  const { isConnected, subscribe } = useWebSocket({
    channels: ['trades'],
  });

  useEffect(() => {
    const handleTradeExecuted = (message: any) => {
      if (message.data) {
        setRecentTrades(prev => [message.data, ...prev].slice(0, 100));
      }
    };

    subscribe('trades', handleTradeExecuted);
  }, [subscribe]);

  return {
    isConnected,
    recentTrades,
  };
}

export function useActivitiesWebSocket() {
  const [activities, setActivities] = useState<any[]>([]);

  const { isConnected, subscribe } = useWebSocket({
    channels: ['activities'],
  });

  useEffect(() => {
    const handleActivity = (message: any) => {
      if (message.data) {
        setActivities(prev => [message.data, ...prev].slice(0, 100));
      }
    };

    subscribe('activities', handleActivity);
  }, [subscribe]);

  return {
    isConnected,
    activities,
  };
}
