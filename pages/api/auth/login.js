import { authenticateUser } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }

  try {
    console.log('[Login] Attempting authentication for user:', username);
    const result = await authenticateUser(username, password);
    console.log('[Login] Authentication result:', { success: result.success, message: result.message });

    if (result.success) {
      // Set HTTP-only cookie with production-friendly settings
      const isProduction = process.env.NODE_ENV === 'production';

      // More lenient cookie settings for production
      let cookieValue = `auth-token=${result.token}; HttpOnly; Path=/; Max-Age=86400`;

      if (isProduction) {
        // For production, use SameSite=Lax which is more compatible
        cookieValue += '; SameSite=Lax; Secure';
      } else {
        // For development
        cookieValue += '; SameSite=Strict';
      }

      res.setHeader('Set-Cookie', cookieValue);
      console.log('[Login] Cookie set with options:', cookieValue);

      return res.status(200).json({
        success: true,
        user: result.user,
        message: 'Login successful'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
