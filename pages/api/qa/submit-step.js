import pool from '../utils/db';

export default async function handler(req, res) {
  const { qa_task_id, frame, checks, comments } = req.body;
  if (!qa_task_id || ![1,2].includes(frame) || typeof checks !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid payload.' });
  }

  const col = frame === 1 ? 'step1_results' : 'step2_results';
  try {
    await pool.query(
      `UPDATE qa_tasks
         SET ${col} = jsonb_build_object('checks', to_jsonb($2::jsonb), 'comments', $3::text),
             updated_at = NOW()
       WHERE id = $1`,
      [qa_task_id, checks, comments || '']
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.toString() });
  }
}

