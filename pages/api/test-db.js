// Test database connection
export default async function handler(req, res) {
  try {
    // Log environment variables (without password)
    console.log('Environment check:');
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_PASS length:', process.env.DB_PASS?.length);
    console.log('DB_PASS type:', typeof process.env.DB_PASS);
    console.log('DB_PASS first 3 chars:', process.env.DB_PASS?.substring(0, 3));
    console.log('DB_PASS last 3 chars:', process.env.DB_PASS?.substring(process.env.DB_PASS.length - 3));

    // Test basic connection without pool
    const { Client } = require('pg');
    
    const client = new Client({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'postgres',
      password: String(process.env.DB_PASS || ''),
      port: parseInt(process.env.DB_PORT || '5432', 10),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    await client.connect();
    const result = await client.query('SELECT NOW()');
    await client.end();

    return res.status(200).json({
      success: true,
      message: 'Database connection successful',
      timestamp: result.rows[0].now,
      config: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        passwordLength: process.env.DB_PASS?.length
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      config: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        passwordLength: process.env.DB_PASS?.length
      }
    });
  }
}
