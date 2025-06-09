import { getUserFromToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const token = req.cookies['auth-token'];
    console.log('[Auth/Me] Token present:', !!token);

    if (!token) {
      console.log('[Auth/Me] No token found in cookies');
      return res.status(401).json({
        success: false,
        message: 'No authentication token found'
      });
    }

    const user = await getUserFromToken(token);
    console.log('[Auth/Me] User from token:', user ? 'Found' : 'Not found');

    if (!user) {
      console.log('[Auth/Me] Invalid or expired token');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
