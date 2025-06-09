import pool from '../../utils/db';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { qa_task_id, final_notes } = req.body;

  if (!qa_task_id) {
    return res.status(400).json({
      success: false,
      message: 'QA task ID is required'
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get QA task details with account information
    const taskQuery = await client.query(
      `SELECT qt.*, pa.account as account_name
       FROM qa_tasks qt
       LEFT JOIN posting_accounts pa ON qt.assigned_account = pa.id
       WHERE qt.id = $1`,
      [qa_task_id]
    );

    if (taskQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'QA task not found'
      });
    }

    const task = taskQuery.rows[0];

    // Update QA task to completed status
    await client.query(
      `UPDATE qa_tasks
       SET status = 'completed',
           final_notes = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [qa_task_id, final_notes || '']
    );

    await client.query('COMMIT');

    // Send notifications after successful DB update
    const notificationData = {
      qaTaskId: task.id,
      accountName: task.account_name,
      driveUrl: task.drive_url,
      referenceUrl: task.reference_url,
      step1Results: task.step1_results,
      step2Results: task.step2_results,
      finalNotes: final_notes,
      status: 'completed'
    };

    try {
      // Send Discord notification
      if (process.env.DISCORD_WEBHOOK_URL) {
        await axios.post(`${req.headers.origin || 'http://localhost:3000'}/api/notifications/discord`, notificationData);
        console.log(`[QA Complete] Discord notification sent for task ${qa_task_id}`);
      }

      // Send Trello notification
      if (process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN) {
        await axios.post(`${req.headers.origin || 'http://localhost:3000'}/api/notifications/trello`, notificationData);
        console.log(`[QA Complete] Trello notification sent for task ${qa_task_id}`);
      }

    } catch (notificationError) {
      console.error('Notification error (non-blocking):', notificationError);
      // Don't fail the API call if notifications fail
    }

    return res.json({
      success: true,
      message: 'QA task completed successfully',
      qa_task_id,
      task: {
        id: task.id,
        status: 'completed',
        account_name: task.account_name,
        final_notes: final_notes
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('QA Complete API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete QA task',
      error: error.message
    });
  } finally {
    client.release();
  }
}


