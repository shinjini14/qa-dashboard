import pool from '../utils/db';

import pool from '../../utils/db';
import { moveCard, addComment } from '../../utils/trello';
import { notifyDiscord } from '../../utils/discord';

export default async function handler(req, res) {
  const { qa_task_id, frame1, frame2, finalNotes } = req.body;
  if (
    !qa_task_id ||
    !frame1 || typeof frame1.checks !== 'object' ||
    !frame2 || typeof frame2.checks !== 'object'
  ) {
    return res.status(400).json({ success: false, error: 'Invalid payload.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Persist QA results & mark as done
    const { rows } = await client.query(
      `UPDATE qa_tasks
         SET step1_results = $1::jsonb,
             step2_results = $2::jsonb,
             final_notes   = $3,
             status        = 'done',
             updated_at    = NOW()
       WHERE id = $4
       RETURNING script_id`,
      [
        JSON.stringify({ checks: frame1.checks, comments: frame1.comments || '' }),
        JSON.stringify({ checks: frame2.checks, comments: frame2.comments || '' }),
        finalNotes || '',
        qa_task_id
      ]
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'QA task not found.' });
    }
    const scriptId = rows[0].script_id;

    // 2) Look up Trello card ID
    const { rows: srows } = await client.query(
      'SELECT trello_card_id FROM script WHERE id = $1',
      [scriptId]
    );
    if (!srows.length || !srows[0].trello_card_id) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Trello card not found.' });
    }
    const trelloCardId = srows[0].trello_card_id;

    // 3) Move the card into your "Done" list
    await moveCard(trelloCardId, process.env.TRELLO_DONE_LIST_ID);

    // 4) Post a summary comment
    let comment = '🛠️ **Manual QA Completed**\n\n• Frame 1:\n';
    for (const [k, v] of Object.entries(frame1.checks)) {
      const label = k
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      comment += `    • ${label}: ${v ? '✅' : '❌'}\n`;
    }
    if (frame1.comments) comment += `    • Comments: _${frame1.comments}_\n`;

    comment += '\n• Frame 2:\n';
    for (const [k, v] of Object.entries(frame2.checks)) {
      const label = k
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      comment += `    • ${label}: ${v ? '✅' : '❌'}\n`;
    }
    if (frame2.comments) comment += `    • Comments: _${frame2.comments}_\n`;

    comment += `\n**Final Notes:** ${finalNotes}\n`;
    await addComment(trelloCardId, comment);

    // 5) Notify Discord
    await notifyDiscord(`✅ QA completed for Trello card **${trelloCardId}**.`);

    // 6) Flip our flags so we don’t repeat these actions
    await client.query(
      `UPDATE qa_tasks
         SET trello_moved = TRUE,
             discord_notified = TRUE
       WHERE id = $1`,
      [qa_task_id]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in /api/qa/submit-final:', err);
    res.status(500).json({ success: false, error: err.toString() });
  } finally {
    client.release();
  }
}
