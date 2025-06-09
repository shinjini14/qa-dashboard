// pages/api/debug/auth-status.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookies = req.cookies;
    const authToken = cookies['auth-token'];
    
    const debugInfo = {
      environment: process.env.NODE_ENV,
      hasCookies: Object.keys(cookies).length > 0,
      cookieNames: Object.keys(cookies),
      hasAuthToken: !!authToken,
      authTokenLength: authToken ? authToken.length : 0,
      userAgent: req.headers['user-agent'],
      host: req.headers.host,
      protocol: req.headers['x-forwarded-proto'] || 'http',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
  }
}
