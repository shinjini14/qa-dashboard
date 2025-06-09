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
    const result = await authenticateUser(username, password);
    
    if (result.success) {
      // Set HTTP-only cookie for security
      res.setHeader('Set-Cookie', [
        `auth-token=${result.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${
          process.env.NODE_ENV === 'production' ? '; Secure' : ''
        }`
      ]);

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
