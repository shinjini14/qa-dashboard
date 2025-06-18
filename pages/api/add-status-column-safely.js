// pages/api/add-status-column-safely.js
import pool from './utils/db';

export default async function handler(req, res) {
  try {
    console.log('[add-status-column-safely] Checking existing table structure...');

    // Check if drive_links table exists
    const { rows: tableExists } = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'drive_links'
      );
    `);

    if (!tableExists[0].exists) {
      return res.status(400).json({
        success: false,
        message: 'drive_links table does not exist. Please run setup-drive-links-table first.'
      });
    }

    // Get current columns
    const { rows: columns } = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'drive_links'
      ORDER BY ordinal_position
    `);

    const existingColumns = columns.map(c => c.column_name);
    console.log('[add-status-column-safely] Existing columns:', existingColumns);

    const changes = [];

    // Only add columns that don't exist
    const columnsToAdd = [
      { name: 'status', sql: 'ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'pending\'' },
      { name: 'qa_started_at', sql: 'ADD COLUMN IF NOT EXISTS qa_started_at TIMESTAMP' },
      { name: 'qa_completed_at', sql: 'ADD COLUMN IF NOT EXISTS qa_completed_at TIMESTAMP' },
      { name: 'updated_at', sql: 'ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()' }
    ];

    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        await pool.query(`ALTER TABLE drive_links ${col.sql}`);
        changes.push(`Added column: ${col.name}`);
        console.log(`[add-status-column-safely] Added column: ${col.name}`);
      } else {
        console.log(`[add-status-column-safely] Column ${col.name} already exists`);
      }
    }

    // Add indexes if they don't exist
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_drive_links_status ON drive_links(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_drive_links_updated_at ON drive_links(updated_at)`);

    // Get updated table structure
    const { rows: updatedColumns } = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'drive_links'
      ORDER BY ordinal_position
    `);

    // Get current data count
    const { rows: dataCount } = await pool.query(`SELECT COUNT(*) FROM drive_links`);

    res.json({
      success: true,
      message: 'Safely updated drive_links table structure',
      changes: changes,
      tableStructure: updatedColumns,
      dataPreserved: true,
      recordCount: parseInt(dataCount[0].count)
    });

  } catch (error) {
    console.error('[add-status-column-safely] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update table structure safely',
      error: error.message
    });
  }
}
