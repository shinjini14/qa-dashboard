// pages/api/debug-tables.js
import pool from './utils/db';

export default async function handler(req, res) {
  try {
    // Check which tables exist
    const { rows: tables } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tableInfo = {};

    // Get info for each table
    for (const table of tables) {
      const tableName = table.table_name;
      
      try {
        // Get column info
        const { rows: columns } = await pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);

        // Get row count
        const { rows: countResult } = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
        
        tableInfo[tableName] = {
          columns: columns,
          rowCount: parseInt(countResult[0].count),
          exists: true
        };
      } catch (err) {
        tableInfo[tableName] = {
          error: err.message,
          exists: false
        };
      }
    }

    // Specific checks for our key tables
    const keyTables = ['drive_links', 'qa_tasks', 'posting_accounts', 'login'];
    const keyTableStatus = {};

    for (const tableName of keyTables) {
      try {
        const { rows: exists } = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          );
        `, [tableName]);
        
        keyTableStatus[tableName] = {
          exists: exists[0].exists,
          info: tableInfo[tableName] || null
        };
      } catch (err) {
        keyTableStatus[tableName] = {
          exists: false,
          error: err.message
        };
      }
    }

    res.json({
      success: true,
      allTables: tables.map(t => t.table_name),
      tableDetails: tableInfo,
      keyTables: keyTableStatus,
      summary: {
        totalTables: tables.length,
        driveLinksExists: keyTableStatus.drive_links?.exists || false,
        qaTasksExists: keyTableStatus.qa_tasks?.exists || false,
        postingAccountsExists: keyTableStatus.posting_accounts?.exists || false,
        loginExists: keyTableStatus.login?.exists || false
      }
    });

  } catch (error) {
    console.error('[debug-tables] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug tables',
      error: error.message
    });
  }
}
