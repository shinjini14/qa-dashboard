import pool from './utils/db';

export default async function handler(req, res) {
  try {
    // Get only active accounts from your posting_accounts table
    const { rows } = await pool.query(
      `SELECT id, account FROM posting_accounts WHERE status = 'Active' ORDER BY id`
    );

    res.json({
      success: true,
      accounts: rows
    });
  } catch (err) {
    console.error('Accounts API error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Failed to fetch accounts'
    });
  }
}

