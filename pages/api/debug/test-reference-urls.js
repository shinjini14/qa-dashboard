// pages/api/debug/test-reference-urls.js
import pool from '../utils/db';

export default async function handler(req, res) {
  try {
    // Check reference_url table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'reference_url'
      ORDER BY ordinal_position
    `);

    // Get all reference URLs
    const allReferenceUrls = await pool.query(`
      SELECT * FROM reference_url ORDER BY id
    `);

    // Get accounts with their reference URLs
    const accountsWithRefs = await pool.query(`
      SELECT 
        pa.id, 
        pa.account,
        pa.status,
        ru.url as reference_url
      FROM posting_accounts pa
      LEFT JOIN reference_url ru ON pa.account = ru.account_name
      WHERE pa.status NOT IN ('inactive', 'disabled', 'Inactive')
      ORDER BY pa.id
    `);

    // Test specific account lookup
    const testAccountId = req.query.account || 816;
    const specificAccount = await pool.query(`
      SELECT 
        pa.id, 
        pa.account,
        pa.status,
        ru.url as reference_url
      FROM posting_accounts pa
      LEFT JOIN reference_url ru ON pa.account = ru.account_name
      WHERE pa.id = $1
    `, [testAccountId]);

    res.json({
      success: true,
      data: {
        tableStructure: tableStructure.rows,
        allReferenceUrls: allReferenceUrls.rows,
        accountsWithRefs: accountsWithRefs.rows,
        testAccount: {
          id: testAccountId,
          result: specificAccount.rows[0] || null
        },
        counts: {
          totalReferenceUrls: allReferenceUrls.rows.length,
          accountsWithRefs: accountsWithRefs.rows.filter(a => a.reference_url).length,
          accountsWithoutRefs: accountsWithRefs.rows.filter(a => !a.reference_url).length
        }
      }
    });

  } catch (error) {
    console.error('[Debug] Reference URLs test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to test reference URLs'
    });
  }
}
