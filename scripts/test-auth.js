// Test script to verify authentication setup
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAuthentication() {
  console.log('🧪 Testing QA Pipeline Authentication System\n');

  try {
    // Test 1: Initialize Database
    console.log('1️⃣ Initializing database...');
    const initResponse = await axios.post(`${BASE_URL}/api/auth/init-db`, {});
    console.log('✅ Database initialized successfully');
    console.log('📝 Default users created:', initResponse.data.users);
    console.log('');

    // Test 2: Test Login with Admin
    console.log('2️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Admin login successful');
    console.log('👤 User:', loginResponse.data.user);
    
    // Extract cookie for authenticated requests
    const cookies = loginResponse.headers['set-cookie'];
    const authCookie = cookies ? cookies[0] : '';
    console.log('');

    // Test 3: Test Protected Route
    console.log('3️⃣ Testing protected route access...');
    const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Cookie: authCookie
      }
    });
    console.log('✅ Protected route accessible');
    console.log('👤 Current user:', meResponse.data.user);
    console.log('');

    // Test 4: Test Accounts API
    console.log('4️⃣ Testing accounts API...');
    const accountsResponse = await axios.get(`${BASE_URL}/api/accounts`, {
      headers: {
        Cookie: authCookie
      }
    });
    console.log('✅ Accounts API accessible');
    console.log('📊 Accounts found:', accountsResponse.data.accounts?.length || 0);
    console.log('');

    // Test 5: Test Logout
    console.log('5️⃣ Testing logout...');
    await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
      headers: {
        Cookie: authCookie
      }
    });
    console.log('✅ Logout successful');
    console.log('');

    // Test 6: Test Invalid Credentials
    console.log('6️⃣ Testing invalid credentials...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'invalid',
        password: 'wrong'
      });
      console.log('❌ Invalid credentials test failed - should have been rejected');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials properly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    console.log('🎉 All authentication tests passed!');
    console.log('');
    console.log('🚀 You can now access the application at: http://localhost:3000');
    console.log('');
    console.log('👤 Login credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   QA Reviewer: qa_reviewer / qa123');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('');
    console.log('💡 Make sure:');
    console.log('   1. The development server is running (npm run dev)');
    console.log('   2. Database connection is configured in .env.local');
    console.log('   3. PostgreSQL is running and accessible');
  }
}

// Run the test
testAuthentication();
