// pages/api/drive-links/bulk-import.js
import pool from '../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { urls, defaultPriority = 'normal' } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'URLs array is required'
      });
    }

    const results = {
      added: [],
      skipped: [],
      errors: []
    };

    // Process each URL
    for (const urlData of urls) {
      try {
        const url = typeof urlData === 'string' ? urlData : urlData.url;
        const title = typeof urlData === 'object' ? urlData.title : null;
        const priority = typeof urlData === 'object' ? urlData.priority || defaultPriority : defaultPriority;

        if (!url) {
          results.errors.push({
            url: url || 'undefined',
            error: 'URL is required'
          });
          continue;
        }

        // Extract file ID from Google Drive URL
        const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (!fileIdMatch) {
          results.errors.push({
            url,
            error: 'Invalid Google Drive URL format'
          });
          continue;
        }

        const fileId = fileIdMatch[1];

        // Check if this file ID already exists
        const existingCheck = await pool.query(
          'SELECT id, file_id FROM drive_links WHERE file_id = $1',
          [fileId]
        );

        if (existingCheck.rows.length > 0) {
          results.skipped.push({
            url,
            fileId,
            reason: 'Already exists'
          });
          continue;
        }

        // Insert new drive link
        const { rows } = await pool.query(
          `INSERT INTO drive_links (
            file_id, 
            full_url, 
            title,
            status, 
            priority,
            created_at, 
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
          RETURNING *`,
          [fileId, url, title || `Video ${fileId}`, 'pending', priority]
        );

        results.added.push({
          url,
          fileId,
          driveLink: rows[0]
        });

      } catch (error) {
        results.errors.push({
          url: typeof urlData === 'string' ? urlData : urlData?.url || 'unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed: ${results.added.length} added, ${results.skipped.length} skipped, ${results.errors.length} errors`,
      results
    });

  } catch (err) {
    console.error('[drive-links] Bulk import error:', err);
    res.status(500).json({
      success: false,
      error: err.toString(),
      message: 'Failed to process bulk import'
    });
  }
}
