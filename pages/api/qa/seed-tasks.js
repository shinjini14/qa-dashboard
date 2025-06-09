import pool from '../../utils/db';

export default async function handler(req, res) {
  if (process.env.QUIET_MODE === 'true') {
    return res.status(403).json({ success: false, error: 'Disabled in production.' });
  }
  try {
    await pool.query(
      `INSERT INTO qa_tasks (script_id, status)
       SELECT id, 'awaiting'
       FROM script
       WHERE ai_qa_status = 'ready_for_manual_qa'
         AND id NOT IN (SELECT script_id FROM qa_tasks)`
    );
    res.json({ success: true, message: 'Seeded QA tasks.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.toString() });
  }
}

