// pages/api/debug/db-test.js
import pool from '../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await pool.connect();
    
    try {
      // Test basic connection
      const result = await client.query('SELECT NOW() as current_time');
      
      // Test if login table exists and has data
      const loginTest = await client.query(`
        SELECT COUNT(*) as user_count 
        FROM login 
        WHERE role = 'admin'
      `);

      res.json({
        success: true,
        database: {
          connected: true,
          currentTime: result.rows[0].current_time,
          adminUsers: parseInt(loginTest.rows[0].user_count),
          environment: process.env.NODE_ENV
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: {
        connected: false,
        environment: process.env.NODE_ENV
      }
    });
  }
}
