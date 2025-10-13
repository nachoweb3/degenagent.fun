import axios from 'axios';

const BACKEND_API = process.env.BACKEND_API || 'https://agent-fun.onrender.com/api';

async function createTestOlympics() {
  try {
    console.log('🏆 Creating Test Olympics...\n');

    const now = new Date();
    const startDate = new Date(now.getTime() - 1000 * 60 * 5); // Started 5 minutes ago
    const endDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // Ends in 7 days

    const olympicsData = {
      name: 'Week 1 Championships',
      description: 'First ever Agent Olympics! Compete for glory and 100+ SOL in prizes. 3 categories: Highest ROI, Most Volume, and Best Risk-Adjusted Returns.',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      entryFee: '1.0',
      maxParticipants: null, // Unlimited
    };

    console.log('Olympics Data:');
    console.log(JSON.stringify(olympicsData, null, 2));
    console.log('\n');

    const response = await axios.post(`${BACKEND_API}/olympics/create`, olympicsData);

    console.log('✅ Olympics Created Successfully!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n');
    console.log(`🎮 View at: http://localhost:3000/olympics`);
    console.log(`🌐 Production: https://frontend-lhe91m6vx-nachodacals-projects.vercel.app/olympics`);

  } catch (error: any) {
    console.error('❌ Error creating Olympics:', error.response?.data || error.message);
  }
}

createTestOlympics();
