// API Types and Interfaces

export interface Agent {
  pubkey: string;
  name: string;
  symbol?: string;
  purpose: string;
  tokenMint: string;
  agentWallet: string;
  vaultBalance: number;
  totalTrades: string;
  totalVolume: string;
  revenuePool: string;
  status: string;
  createdAt?: string;
  performance?: {
    roi: number;
    winRate: number;
    totalPnL: number;
  };
  recentTrades?: Array<{
    signature: string;
    timestamp: number;
    slot: number;
  }>;
}

export interface CreateAgentRequest {
  name: string;
  symbol: string;
  purpose: string;
  creatorWallet: string;
  riskTolerance?: 'low' | 'medium' | 'high';
  tradingFrequency?: number;
  maxTradeSize?: number;
}

export interface CreateAgentResponse {
  success: boolean;
  agentPubkey: string;
  agentWallet: string;
  tokenMint: string;
  transaction: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

// API Client functions
export const api = {
  // Agent endpoints
  async createAgent(data: CreateAgentRequest): Promise<CreateAgentResponse> {
    const response = await fetch(`${API_URL}/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAgent(pubkey: string): Promise<Agent> {
    const response = await fetch(`${API_URL}/agent/${pubkey}`);
    return response.json();
  },

  async getAllAgents(): Promise<{ agents: Agent[] }> {
    const response = await fetch(`${API_URL}/agent`);
    return response.json();
  },

  // Commission endpoints
  async getCommissionStats() {
    const response = await fetch(`${API_URL}/commission/stats`);
    return response.json();
  },

  async getOwnerCommissions(address: string) {
    const response = await fetch(`${API_URL}/commission/owner/${address}`);
    return response.json();
  },

  // Referral endpoints
  async generateReferralCode(address: string) {
    const response = await fetch(`${API_URL}/referral/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    return response.json();
  },

  async getReferralStats(address: string) {
    const response = await fetch(`${API_URL}/referral/stats/${address}`);
    return response.json();
  },

  async getReferralLeaderboard(limit: number = 100) {
    const response = await fetch(`${API_URL}/referral/leaderboard?limit=${limit}`);
    return response.json();
  },
};

export default api;
