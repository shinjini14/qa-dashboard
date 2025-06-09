// pages/api/drive-links.js
import pool from './utils/db';

export default async function handler(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, file_id, full_url
       FROM drive_links
       ORDER BY created_at DESC`
    );
    res.json({ success:true, driveLinks: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error:err.toString() });
  }
}
