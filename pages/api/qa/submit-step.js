import pool from '../utils/db';

export default async function handler(req, res) {
  const { qa_task_id, frame, checks, comments } = req.body;
  if (!qa_task_id || ![1,2,3].includes(frame) || typeof checks !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid payload.' });
  }

  try {
    if (frame === 1) {
      // Step 1: Save to step1_results
      await pool.query(
        `UPDATE qa_tasks
           SET step1_results = jsonb_build_object('checks', to_jsonb($2::jsonb), 'comments', $3::text),
               updated_at = NOW()
         WHERE id = $1`,
        [qa_task_id, checks, comments || '']
      );
    } else if (frame === 2) {
      // Step 2: Save to step2_results
      await pool.query(
        `UPDATE qa_tasks
           SET step2_results = jsonb_build_object('checks', to_jsonb($2::jsonb), 'comments', $3::text),
               updated_at = NOW()
         WHERE id = $1`,
        [qa_task_id, checks, comments || '']
      );
    } else if (frame === 3) {
      // Step 3: Save to final_notes (since there's no step3_results column)
      await pool.query(
        `UPDATE qa_tasks
           SET final_notes = $2,
               updated_at = NOW()
         WHERE id = $1`,
        [qa_task_id, comments || '']
      );
    }

    console.log(`[submit-step] Saved step ${frame} for task ${qa_task_id}:`, { checks: Object.keys(checks).length, comments: comments?.length || 0 });
    res.json({ success: true });
  } catch (err) {
    console.error(`[submit-step] Error saving step ${frame}:`, err);
    res.status(500).json({ success: false, error: err.toString() });
  }
}

