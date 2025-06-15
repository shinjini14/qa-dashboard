// pages/api/drive-links/[id].js
import pool from '../utils/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    // Update drive link status or other fields
    try {
      const { status, title, priority, qa_assigned_to } = req.body;
      
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (status) {
        updates.push(`status = $${paramCount}`);
        values.push(status);
        paramCount++;
      }

      if (title) {
        updates.push(`title = $${paramCount}`);
        values.push(title);
        paramCount++;
      }

      if (priority) {
        updates.push(`priority = $${paramCount}`);
        values.push(priority);
        paramCount++;
      }

      if (qa_assigned_to !== undefined) {
        updates.push(`qa_assigned_to = $${paramCount}`);
        values.push(qa_assigned_to);
        paramCount++;
      }

      // Add completion timestamp if status is completed
      if (status === 'completed') {
        updates.push(`qa_completed_at = NOW()`);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE drive_links 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const { rows } = await pool.query(query, values);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Drive link not found'
        });
      }

      res.json({
        success: true,
        message: 'Drive link updated successfully',
        driveLink: rows[0]
      });
    } catch (err) {
      console.error('[drive-links] PATCH error:', err);
      res.status(500).json({
        success: false,
        error: err.toString()
      });
    }
  }
  
  else if (req.method === 'DELETE') {
    // Delete drive link
    try {
      const { rows } = await pool.query(
        'DELETE FROM drive_links WHERE id = $1 RETURNING *',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Drive link not found'
        });
      }

      res.json({
        success: true,
        message: 'Drive link deleted successfully',
        deletedLink: rows[0]
      });
    } catch (err) {
      console.error('[drive-links] DELETE error:', err);
      res.status(500).json({
        success: false,
        error: err.toString()
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
