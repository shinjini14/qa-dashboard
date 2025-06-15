// pages/api/setup-drive-links-table.js
import pool from './utils/db';

export default async function handler(req, res) {
  try {
    // Enhanced drive_links table with better tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS drive_links (
        id SERIAL PRIMARY KEY,
        file_id VARCHAR(255) UNIQUE NOT NULL,
        full_url TEXT NOT NULL,
        title VARCHAR(500),
        status VARCHAR(20) DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'normal',
        content_type VARCHAR(20) DEFAULT 'file',
        qa_assigned_to INTEGER,
        qa_started_at TIMESTAMP,
        qa_completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        notes TEXT,

        -- Add indexes for better performance
        CONSTRAINT drive_links_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'on_hold')),
        CONSTRAINT drive_links_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        CONSTRAINT drive_links_content_type_check CHECK (content_type IN ('file', 'document', 'spreadsheet', 'presentation'))
      )
    `);

    // Add content_type column if it doesn't exist (for existing tables)
    await pool.query(`
      ALTER TABLE drive_links
      ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'file'
    `);

    // Add constraint if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
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

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_drive_links_status ON drive_links(status);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_drive_links_priority ON drive_links(priority);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_drive_links_created_at ON drive_links(created_at);
    `);

    // Add some sample data if table is empty
    const { rows: existingLinks } = await pool.query('SELECT COUNT(*) FROM drive_links');
    
    if (parseInt(existingLinks[0].count) === 0) {
      await pool.query(`
        INSERT INTO drive_links (file_id, full_url, title, status, priority, content_type) VALUES
        ('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view', 'Sample Video 1', 'pending', 'normal', 'file'),
        ('1okHhWuVMe0QNLQBNEqXJ5NH6I82S6EC0EbI9t80rOT4', 'https://docs.google.com/document/d/1okHhWuVMe0QNLQBNEqXJ5NH6I82S6EC0EbI9t80rOT4/edit', 'Sample Document', 'pending', 'normal', 'document'),
        ('1234567890abcdefghijklmnopqrstuvwxyz', 'https://drive.google.com/file/d/1234567890abcdefghijklmnopqrstuvwxyz/view', 'Sample Video 2', 'pending', 'high', 'file')
      `);
    }

    // Get current table structure
    const { rows: tableInfo } = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'drive_links'
      ORDER BY ordinal_position
    `);

    res.json({
      success: true,
      message: 'Drive links table setup completed successfully',
      tableStructure: tableInfo,
      sampleDataAdded: parseInt(existingLinks[0].count) === 0
    });

  } catch (error) {
    console.error('[setup-drive-links-table] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to setup drive links table'
    });
  }
}
