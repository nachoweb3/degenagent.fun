#!/usr/bin/env node

/**
 * Production Health Check
 * Verifica que todo esté funcionando en producción
 */

const https = require('https');

const BACKEND_URL = 'https://agent-fun.onrender.com';
const FRONTEND_URL = 'https://www.degenagent.fun';

console.log('🔍 Checking Production Status...\n');

// Check backend health
function checkBackend() {
  return new Promise((resolve) => {
    https.get(`${BACKEND_URL}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'ok') {
            console.log('✅ Backend: ONLINE');
            console.log(`   Network: ${json.network}`);
            console.log(`   Block: ${json.blockHeight}`);
            resolve(true);
          } else {
            console.log('❌ Backend: ERROR');
            console.log('   Response:', json);
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Backend: INVALID RESPONSE');
          console.log('   Data:', data);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ Backend: OFFLINE');
      console.log('   Error:', err.message);
      resolve(false);
    });
  });
}

// Check frontend
function checkFrontend() {
  return new Promise((resolve) => {
    https.get(FRONTEND_URL, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend: ONLINE');
        console.log(`   Status: ${res.statusCode}`);
        resolve(true);
      } else {
        console.log('❌ Frontend: ERROR');
        console.log(`   Status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log('❌ Frontend: OFFLINE');
      console.log('   Error:', err.message);
      resolve(false);
    });
  });
}

// Check CORS
function checkCORS() {
  return new Promise((resolve) => {
    const options = {
      method: 'OPTIONS',
      hostname: 'agent-fun.onrender.com',
      path: '/api/agent/create',
      headers: {
        'Origin': 'https://www.degenagent.fun',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    const req = https.request(options, (res) => {
      const corsHeader = res.headers['access-control-allow-origin'];
      if (corsHeader && corsHeader.includes('degenagent.fun')) {
        console.log('✅ CORS: CONFIGURED');
        console.log(`   Allowed: ${corsHeader}`);
        resolve(true);
      } else {
        console.log('⚠️  CORS: MAY HAVE ISSUES');
        console.log('   Header:', corsHeader || 'missing');
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log('❌ CORS: CHECK FAILED');
      console.log('   Error:', err.message);
      resolve(false);
    });

    req.end();
  });
}

// Run all checks
async function runChecks() {
  console.log('1️⃣ Checking Backend...');
  const backendOk = await checkBackend();
  console.log('');

  console.log('2️⃣ Checking Frontend...');
  const frontendOk = await checkFrontend();
  console.log('');

  console.log('3️⃣ Checking CORS...');
  const corsOk = await checkCORS();
  console.log('');

  console.log('='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));

  if (backendOk && frontendOk && corsOk) {
    console.log('✅ ALL SYSTEMS OPERATIONAL');
    console.log('');
    console.log('🎯 Ready to test agent creation:');
    console.log('   https://www.degenagent.fun/create');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ SOME SYSTEMS HAVE ISSUES');
    console.log('');
    console.log('🔧 Actions needed:');
    if (!backendOk) console.log('   - Check backend deployment on Render');
    if (!frontendOk) console.log('   - Check frontend deployment on Vercel');
    if (!corsOk) console.log('   - Verify CORS configuration in backend');
    console.log('');
    console.log('📖 See PRODUCTION_FIX.md for details');
    console.log('');
    process.exit(1);
  }
}

runChecks();
