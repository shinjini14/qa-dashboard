// pages/api/fix-drive-links-table.js
import pool from './utils/db';

export default async function handler(req, res) {
  try {
    console.log('Checking and fixing drive_links table structure...');

    // Add missing columns one by one
    const columnsToAdd = [
      { name: 'title', type: 'VARCHAR(500)', default: null },
      { name: 'status', type: 'VARCHAR(20)', default: "'pending'" },
      { name: 'priority', type: 'VARCHAR(20)', default: "'normal'" },
      { name: 'content_type', type: 'VARCHAR(20)', default: "'file'" },
      { name: 'qa_assigned_to', type: 'INTEGER', default: null },
      { name: 'qa_started_at', type: 'TIMESTAMP', default: null },
      { name: 'qa_completed_at', type: 'TIMESTAMP', default: null },
      { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()' },
      { name: 'created_by', type: 'INTEGER', default: null },
      { name: 'notes', type: 'TEXT', default: null }
    ];

    for (const column of columnsToAdd) {
      try {
        const defaultClause = column.default ? `DEFAULT ${column.default}` : '';
        await pool.query(`
          ALTER TABLE drive_links 
          ADD COLUMN IF NOT EXISTS ${column.name} ${column.type} ${defaultClause}
        `);
        console.log(`✅ Added/verified column: ${column.name}`);
      } catch (err) {
        console.log(`⚠️ Column ${column.name} might already exist:`, err.message);
      }
    }

    // Add constraints
    try {
      await pool.query(`
        DO $$ 
        BEGIN
          -- Add status constraint if it doesn't exist
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage 
            WHERE constraint_name = 'drive_links_status_check'
          ) THEN
            ALTER TABLE drive_links 
            ADD CONSTRAINT drive_links_status_check 
            CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'on_hold'));
          END IF;

          -- Add priority constraint if it doesn't exist
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage 
            WHERE constraint_name = 'drive_links_priority_check'
          ) THEN
            ALTER TABLE drive_links 
            ADD CONSTRAINT drive_links_priority_check 
            CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
          END IF;

          -- Add content_type constraint if it doesn't exist
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage 
            WHERE constraint_name = 'drive_links_content_type_check'
          ) THEN
            ALTER TABLE drive_links 
            ADD CONSTRAINT drive_links_content_type_check 
            CHECK (content_type IN ('file', 'document', 'spreadsheet', 'presentation'));
          END IF;
        END $$;
      `);
      console.log('✅ Added/verified constraints');
    } catch (err) {
      console.log('⚠️ Constraints might already exist:', err.message);
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_drive_links_status ON drive_links(status)',
      'CREATE INDEX IF NOT EXISTS idx_drive_links_priority ON drive_links(priority)',
      'CREATE INDEX IF NOT EXISTS idx_drive_links_created_at ON drive_links(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_drive_links_content_type ON drive_links(content_type)'
    ];

    for (const indexQuery of indexes) {
      try {
        await pool.query(indexQuery);
        console.log('✅ Created/verified index');
      } catch (err) {
        console.log('⚠️ Index might already exist:', err.message);
      }
    }

    // Get current table structure
    const { rows: tableInfo } = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'drive_links'
      ORDER BY ordinal_position
    `);

    // Get current data count
    const { rows: countResult } = await pool.query('SELECT COUNT(*) FROM drive_links');

    res.json({
      success: true,
      message: 'Drive links table structure fixed successfully',
      tableStructure: tableInfo,
      currentRecords: parseInt(countResult[0].count)
    });

  } catch (error) {
    console.error('[fix-drive-links-table] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fix drive links table structure'
    });
  }
}
