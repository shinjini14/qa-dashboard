import pool from '../utils/db';
import { moveCard, addComment } from '../utils/trello';
import { notifyDiscord } from '../utils/discord';

export default async function handler(req, res) {
  const {
    qa_task_id,
    frame1,
    frame2,
    frame3,
    frame4,
    frame5,
    finalNotes,
    scriptId
  } = req.body;

  // Validate required data
  if (
    !qa_task_id ||
    !frame1 || typeof frame1.checks !== 'object' ||
    !frame2 || typeof frame2.checks !== 'object' ||
    !frame3 || typeof frame3.checks !== 'object' ||
    !frame4 || typeof frame4.checks !== 'object' ||
    !frame5 || typeof frame5.checks !== 'object'
  ) {
    return res.status(400).json({ success: false, error: 'Invalid payload.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update qa_tasks with all steps + final notes
    const { rows } = await client.query(
      `UPDATE qa_tasks
         SET step1_results = $1::jsonb,
             step2_results = $2::jsonb,
             step3_results = $3::jsonb,
             step4_results = $4::jsonb,
             step5_results = $5::jsonb,
             final_notes    = $6,
             status         = 'completed',
             updated_at     = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        JSON.stringify({ checks: frame1.checks, comments: frame1.comments || '' }),
        JSON.stringify({ checks: frame2.checks, comments: frame2.comments || '' }),
        JSON.stringify({ checks: frame3.checks, comments: frame3.comments || '' }),
        JSON.stringify({ checks: frame4.checks, comments: frame4.comments || '' }),
        JSON.stringify({ checks: frame5.checks, comments: frame5.comments || '' }),
        finalNotes || '',
        qa_task_id
      ]
    );

    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'QA task not found.' });
    }

    const task = rows[0];

    // Trello integration
    const { rows: srows } = await client.query(
      'SELECT trello_card_id FROM script WHERE id = $1',
      [scriptId]
    );
    if (!srows.length || !srows[0].trello_card_id) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Trello card not found.' });
    }
    const trelloCardId = srows[0].trello_card_id;

    // Move card to "Done"
    await moveCard(trelloCardId, process.env.TRELLO_DONE_LIST_ID);

    // Build Trello summary comment
    const formatFrame = (frame, number) => {
      let comment = `• Frame ${number}:\n`;
      for (const [k, v] of Object.entries(frame.checks)) {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        comment += `    • ${label}: ${v ? '✅' : '❌'}\n`;
      }
      if (frame.comments) comment += `    • Comments: _${frame.comments}_\n`;
      return comment;
    };

    let comment = '🛠️ **Manual QA Completed**\n\n';
    comment += formatFrame(frame1, 1);
    comment += '\n' + formatFrame(frame2, 2);
    comment += '\n' + formatFrame(frame3, 3);
    comment += '\n' + formatFrame(frame4, 4);
    comment += '\n' + formatFrame(frame5, 5);
    comment += `\n**Final Notes:** ${finalNotes || 'None'}\n`;

    await addComment(trelloCardId, comment);

    // Discord notification
    await notifyDiscord(`✅ QA completed for Trello card **${trelloCardId}**.`);

    // Flip flags
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
