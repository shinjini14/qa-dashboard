// pages/api/debug-drive-links.js
import pool from './utils/db';

export default async function handler(req, res) {
  try {
    // Get all data from drive_links table
    const { rows: allData } = await pool.query('SELECT * FROM drive_links ORDER BY id DESC');
    
    // Get table structure
    const { rows: tableStructure } = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'drive_links'
      ORDER BY ordinal_position
    `);

    // Get count
    const { rows: countResult } = await pool.query('SELECT COUNT(*) FROM drive_links');

    // Check for the specific file ID
    const specificFileId = '1okHhWuVMe0QNLQBNEqXJ5NH6I82S6EC0EbI9t80rOT4';
    const { rows: specificRecord } = await pool.query(
      'SELECT * FROM drive_links WHERE file_id = $1',
      [specificFileId]
    );

    res.json({
      success: true,
      totalRecords: parseInt(countResult[0].count),
      tableStructure,
      allData,
      specificRecord,
      searchedFileId: specificFileId
    });

  } catch (error) {
    console.error('[debug-drive-links] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
