// pages/api/debug/check-accounts.js
import pool from '../utils/db';

export default async function handler(req, res) {
  try {
    // Check all posting accounts
    const accountsQuery = await pool.query(`
      SELECT id, account, status, platform, created_at 
      FROM posting_accounts 
      ORDER BY id
    `);

    // Check specific account 819
    const specificAccountQuery = await pool.query(`
      SELECT id, account, status, platform, created_at 
      FROM posting_accounts 
      WHERE id = $1
    `, [819]);

    // Check account statuses
    const statusCountQuery = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM posting_accounts 
      GROUP BY status
    `);

    // Check if table exists and structure
    const tableStructureQuery = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'posting_accounts'
      ORDER BY ordinal_position
    `);

    res.json({
      success: true,
      data: {
        allAccounts: accountsQuery.rows,
        account819: specificAccountQuery.rows,
        statusCounts: statusCountQuery.rows,
        tableStructure: tableStructureQuery.rows,
        totalAccounts: accountsQuery.rows.length,
        account819Exists: specificAccountQuery.rows.length > 0,
        account819Status: specificAccountQuery.rows[0]?.status || 'NOT_FOUND'
      }
    });

  } catch (error) {
    console.error('[Debug] Check accounts error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to check accounts'
    });
  }
}
