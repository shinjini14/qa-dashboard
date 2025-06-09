// pages/api/debug/login-test.js
import { authenticateUser } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }

  try {
    console.log('[LoginTest] Testing authentication for:', username);
    
    const result = await authenticateUser(username, password);
    console.log('[LoginTest] Authentication result:', result);

    if (result.success) {
      // Test cookie setting
      const isProduction = process.env.NODE_ENV === 'production';
      let cookieValue = `test-auth-token=${result.token}; HttpOnly; Path=/; Max-Age=86400`;
      
      if (isProduction) {
        cookieValue += '; SameSite=Lax; Secure';
      } else {
        cookieValue += '; SameSite=Strict';
      }

      res.setHeader('Set-Cookie', cookieValue);
      console.log('[LoginTest] Cookie set:', cookieValue);

      return res.status(200).json({
        success: true,
        message: 'Authentication test successful',
        user: result.user,
        environment: process.env.NODE_ENV,
        cookieSet: true
      });
    } else {
      return res.status(401).json({
        success: false,
        message: result.message,
        environment: process.env.NODE_ENV
      });
    }
  } catch (error) {
    console.error('[LoginTest] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication test failed',
      error: error.message,
      environment: process.env.NODE_ENV
    });
  }
}
