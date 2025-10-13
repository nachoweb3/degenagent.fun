import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001/api';

export async function fetchActiveAgents() {
  try {
    const response = await axios.get(`${BACKEND_URL}/agent/all`);
    return response.data.agents || [];
  } catch (error) {
    console.error('Error fetching active agents:', error);
    return [];
  }
}

export async function fetchAgentState(agentPubkey: string) {
  try {
    const response = await axios.get(`${BACKEND_URL}/agent/${agentPubkey}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching agent state for ${agentPubkey}:`, error);
    return null;
  }
}
