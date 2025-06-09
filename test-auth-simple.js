// Simple test script to check authentication
const https = require('https');
const http = require('http');

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAuth() {
  console.log('🧪 Testing QA Pipeline Authentication...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const serverTest = await makeRequest('http://localhost:3000/api/test-db');
    console.log('Server Status:', serverTest.status);
    console.log('Response:', serverTest.data);
    console.log('');

    // Test 2: Initialize database
    console.log('2️⃣ Initializing database...');
    const initResult = await makeRequest('http://localhost:3000/api/auth/init-db', 'POST', {});
    console.log('Init Status:', initResult.status);
    console.log('Init Response:', initResult.data);
    console.log('');

    // Test 3: Test login
    console.log('3️⃣ Testing login...');
    const loginResult = await makeRequest('http://localhost:3000/api/auth/login', 'POST', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('Login Status:', loginResult.status);
    console.log('Login Response:', loginResult.data);
    console.log('');

    if (loginResult.status === 200) {
      console.log('✅ Authentication system is working!');
      console.log('🚀 You can now access: http://localhost:3000/login');
      console.log('👤 Use credentials: admin / admin123');
    } else {
      console.log('❌ Authentication failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the development server is running: npm run dev');
  }
}

testAuth();
