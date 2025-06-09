// Simple test to check environment variables
export default function handler(req, res) {
  console.log('🔍 Environment Variables Check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_PASS exists:', !!process.env.DB_PASS);
  console.log('DB_PASS length:', process.env.DB_PASS?.length);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

  return res.status(200).json({
    success: true,
    message: 'Environment variables check',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DB_USER: process.env.DB_USER,
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_PORT: process.env.DB_PORT,
      DB_PASS_EXISTS: !!process.env.DB_PASS,
      DB_PASS_LENGTH: process.env.DB_PASS?.length || 0,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
      // Show first and last 3 characters of password for debugging
      DB_PASS_PREVIEW: process.env.DB_PASS ? 
        `${process.env.DB_PASS.substring(0, 3)}...${process.env.DB_PASS.substring(process.env.DB_PASS.length - 3)}` : 
        'NOT SET'
    }
  });
}
