// pages/api/add-drive-link.js
import pool from './utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    console.log('[add-drive-link] Processing URL:', url);

    // Extract file ID from Google Drive/Docs URL
    let fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (!fileIdMatch) {
      fileIdMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    }
    if (!fileIdMatch) {
      fileIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    }
    if (!fileIdMatch) {
      fileIdMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    }
    
    if (!fileIdMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google Drive/Docs URL format. Please use a valid Google Drive file, Google Doc, Sheet, or Slides link.'
      });
    }

    const fileId = fileIdMatch[1];
    console.log('[add-drive-link] Extracted file ID:', fileId);

    // Check if this file ID already exists
    const existingCheck = await pool.query(
      'SELECT id FROM drive_links WHERE file_id = $1',
      [fileId]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This drive link already exists in the system'
      });
    }

    // Get table structure to understand what columns we can insert into
    const { rows: columnInfo } = await pool.query(`
      SELECT column_name, is_generated, column_default, data_type
      FROM information_schema.columns 
      WHERE table_name = 'drive_links'
      ORDER BY ordinal_position
    `);

    console.log('[add-drive-link] Table structure:', columnInfo);

    // Find insertable columns (not generated, not id)
    const insertableColumns = columnInfo.filter(col => 
      col.is_generated === 'NEVER' && 
      col.column_name !== 'id'
    );

    console.log('[add-drive-link] Insertable columns:', insertableColumns.map(c => c.column_name));

    // Build insert query based on available columns
    let insertColumns = ['file_id'];
    let insertValues = [fileId];
    let placeholders = ['$1'];

    // Add other columns if they exist and are insertable
    if (insertableColumns.find(c => c.column_name === 'created_at')) {
      insertColumns.push('created_at');
      insertValues.push('NOW()');
      placeholders.push('NOW()');
    }

    // If there's a url column (not full_url), use that
    const urlColumn = insertableColumns.find(c => 
      c.column_name === 'url' || 
      c.column_name === 'drive_url' || 
      c.column_name === 'link_url'
    );
    
    if (urlColumn) {
      insertColumns.push(urlColumn.column_name);
      insertValues.push(url);
      placeholders.push(`$${insertValues.length}`);
    }

    const insertQuery = `
      INSERT INTO drive_links (${insertColumns.join(', ')}) 
      VALUES (${placeholders.join(', ')}) 
      RETURNING *
    `;

    console.log('[add-drive-link] Insert query:', insertQuery);
    console.log('[add-drive-link] Insert values:', insertValues);

    const { rows } = await pool.query(insertQuery, insertValues.filter(v => v !== 'NOW()'));

    console.log('[add-drive-link] Insert result:', rows[0]);

    res.json({ 
      success: true, 
      message: 'Drive link added successfully',
      driveLink: rows[0] 
    });

  } catch (err) {
    console.error('[add-drive-link] Error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.toString(),
      message: 'Failed to add drive link'
    });
  }
}
