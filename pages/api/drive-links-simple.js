// pages/api/drive-links-simple.js
import pool from './utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all drive links
    try {
      const { rows } = await pool.query(
        `SELECT id, file_id, full_url, created_at
         FROM drive_links
         ORDER BY created_at DESC`
      );
      
      res.json({ 
        success: true, 
        driveLinks: rows,
        total: rows.length 
      });
    } catch (err) {
      console.error('[drive-links-simple] GET error:', err);
      res.status(500).json({ 
        success: false, 
        error: err.toString() 
      });
    }
  }
  
  else if (req.method === 'POST') {
    // Add new drive link
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required'
        });
      }

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

      // Since full_url is a generated column, we need to find out what columns we can actually insert into
      // Let's try different approaches

      let insertResult;

      try {
        // Try 1: Just file_id (if full_url is generated from file_id)
        insertResult = await pool.query(
          `INSERT INTO drive_links (file_id)
           VALUES ($1)
           RETURNING *`,
          [fileId]
        );
      } catch (err1) {
        console.log('Try 1 failed:', err1.message);

        try {
          // Try 2: file_id with created_at
          insertResult = await pool.query(
            `INSERT INTO drive_links (file_id, created_at)
             VALUES ($1, NOW())
             RETURNING *`,
            [fileId]
          );
        } catch (err2) {
          console.log('Try 2 failed:', err2.message);

          try {
            // Try 3: Check what columns we can actually insert into
            const { rows: columnInfo } = await pool.query(`
              SELECT column_name, is_generated, column_default
              FROM information_schema.columns
              WHERE table_name = 'drive_links'
              AND is_generated = 'NEVER'
              AND column_name != 'id'
            `);

            console.log('Available columns for insert:', columnInfo);

            // Try with just the basic required columns
            insertResult = await pool.query(
              `INSERT INTO drive_links (file_id)
               VALUES ($1)
               RETURNING *`,
              [fileId]
            );
          } catch (err3) {
            console.log('Try 3 failed:', err3.message);
            throw new Error(`Failed to insert: ${err3.message}`);
          }
        }
      }

      const rows = insertResult.rows;

      res.json({ 
        success: true, 
        message: 'Drive link added successfully',
        driveLink: rows[0] 
      });
    } catch (err) {
      console.error('[drive-links-simple] POST error:', err);
      res.status(500).json({ 
        success: false, 
        error: err.toString(),
        message: 'Failed to add drive link'
      });
    }
  }
  
  else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}
