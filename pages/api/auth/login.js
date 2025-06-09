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

      // Use multiple cookie setting approaches for better compatibility
      const cookieOptions = [
        `auth-token=${result.token}`,
        'HttpOnly',
        'Path=/',
        'Max-Age=86400'
      ];

      if (isProduction) {
        // For production, use SameSite=None for better cross-origin compatibility
        cookieOptions.push('SameSite=None', 'Secure');
      } else {
        // For development, use Lax for better compatibility
        cookieOptions.push('SameSite=Lax');
      }

      const cookieValue = cookieOptions.join('; ');
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
