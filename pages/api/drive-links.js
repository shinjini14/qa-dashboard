// pages/api/drive-links.js
import pool from './utils/db';

export default async function handler(req, res) {
  try {
    // Try to get all available columns, with fallback ordering
    let query = `SELECT id, file_id, full_url`;

    // Check if additional columns exist and add them
    const { rows: columns } = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'drive_links'
    `);

    const columnNames = columns.map(col => col.column_name);

    if (columnNames.includes('status')) query += `, status`;
    if (columnNames.includes('content_type')) query += `, content_type`;
    if (columnNames.includes('title')) query += `, title`;
    if (columnNames.includes('priority')) query += `, priority`;
    if (columnNames.includes('created_at')) query += `, created_at`;
    if (columnNames.includes('updated_at')) query += `, updated_at`;

    query += ` FROM drive_links`;

    // Order by created_at if it exists, otherwise by id
    if (columnNames.includes('created_at')) {
      query += ` ORDER BY created_at DESC`;
    } else {
      query += ` ORDER BY id DESC`;
    }

    console.log('[drive-links] Executing query:', query);
    const { rows } = await pool.query(query);

    console.log('[drive-links] Found rows:', rows.length);
    res.json({ success: true, driveLinks: rows });
  } catch (err) {
    console.error('[drive-links] Error:', err);
    res.status(500).json({ success: false, error: err.toString() });
  }
}
