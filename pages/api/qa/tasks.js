// pages/api/qa/tasks.js
import pool from '../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // First check if qa_tasks table exists
    const { rows: tableExists } = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'qa_tasks'
      );
    `);

    let tasks = [];

    if (tableExists[0].exists) {
      // Get QA tasks with drive link information
      const { rows: qaTasksData } = await pool.query(`
        SELECT
          qt.id as qa_task_id,
          qt.assigned_account,
          qt.status as qa_status,
          qt.step1_results,
          qt.step2_results,
          qt.step3_results,
          qt.final_notes,
          qt.drive_url,
          qt.reference_url,
          qt.created_at as qa_created_at,
          qt.updated_at as qa_updated_at,
          dl.id as drive_link_id,
          dl.file_id,
          dl.full_url,
          dl.status as drive_status,
          dl.created_at as drive_created_at,
          pa.account as account_name
        FROM qa_tasks qt
        LEFT JOIN drive_links dl ON qt.drive_url = dl.full_url
        LEFT JOIN posting_accounts pa ON qt.assigned_account = pa.id
        ORDER BY qt.created_at DESC
      `);
      tasks = qaTasksData;
    }

    // Also get drive links that don't have QA tasks yet
    let pendingLinksQuery = `
      SELECT
        dl.id,
        dl.file_id,
        dl.full_url,
        dl.status,
        dl.created_at,
        NULL as qa_task_id,
        NULL as qa_status
      FROM drive_links dl
      ORDER BY dl.created_at DESC
    `;

    // If qa_tasks table exists, exclude links that already have QA tasks
    if (tableExists[0].exists) {
      pendingLinksQuery = `
        SELECT
          dl.id,
          dl.file_id,
          dl.full_url,
          dl.status,
          dl.created_at,
          NULL as qa_task_id,
          NULL as qa_status
        FROM drive_links dl
        LEFT JOIN qa_tasks qt ON dl.full_url = qt.drive_url
        WHERE qt.id IS NULL
        ORDER BY dl.created_at DESC
      `;
    }

    const { rows: pendingLinks } = await pool.query(pendingLinksQuery);

    // Combine and format the data
    const allTasks = [
      ...tasks.map(task => ({
        qa_task_id: task.qa_task_id,
        assigned_account: task.assigned_account,
        account_name: task.account_name,
        qa_status: task.qa_status,
        drive_link_id: task.drive_link_id,
        file_id: task.file_id,
        drive_url: task.drive_url || task.full_url,
        drive_status: task.drive_status,
        step1_results: task.step1_results,
        step2_results: task.step2_results,
        step3_results: task.step3_results,
        final_notes: task.final_notes,
        qa_created_at: task.qa_created_at,
        qa_updated_at: task.qa_updated_at,
        drive_created_at: task.drive_created_at,
        type: 'qa_task'
      })),
      ...pendingLinks.map(link => ({
        qa_task_id: null,
        assigned_account: null,
        account_name: null,
        qa_status: null,
        drive_link_id: link.id,
        file_id: link.file_id,
        drive_url: link.full_url,
        drive_status: link.status || 'pending',
        step1_results: null,
        step2_results: null,
        step3_results: null,
        final_notes: null,
        qa_created_at: null,
        qa_updated_at: null,
        drive_created_at: link.created_at,
        type: 'pending_link'
      }))
    ];

    res.json({
      success: true,
      tasks: allTasks,
      summary: {
        total: allTasks.length,
        with_qa: tasks.length,
        pending: pendingLinks.length,
        completed: tasks.filter(t => t.qa_status === 'completed').length,
        in_progress: tasks.filter(t => t.qa_status === 'in_progress').length
      }
    });

  } catch (error) {
    console.error('[QA Tasks API] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QA tasks',
      error: error.message
    });
  }
}
