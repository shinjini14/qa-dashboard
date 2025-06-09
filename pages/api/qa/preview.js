import pool from '../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { qa_task_id } = req.query;

  if (!qa_task_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'QA task ID is required' 
    });
  }

  try {
    // Get comprehensive QA task data with video statistics
    const query = `
      SELECT 
        qt.id as qa_task_id,
        qt.script_id,
        qt.status as qa_status,
        qt.step1_results,
        qt.step2_results,
        qt.final_notes,
        s.title as script_title,
        s.trello_card_id,
        s.google_doc_link,
        s.approval_status,
        s.account_id,
        s.writer_id,
        v.id as video_id,
        v.url as video_url,
        v.created as video_created,
        v.video_cat,
        sy.video_id as stats_video_id,
        sy.views_total,
        sy.likes_total,
        sy.comments_total,
        sy.title as video_title,
        sy.preview as preview_url,
        sy.posted_date,
        sy.sponsor_id,
        sy.writer_id as stats_writer_id,
        sy.updated_at as stats_updated,
        sy.duration,
        pa.account as posting_account,
        pa.platform,
        pa.status as account_status
      FROM qa_tasks qt
      JOIN script s ON qt.script_id = s.id
      LEFT JOIN video v ON s.trello_card_id = v.trello_card_id
      LEFT JOIN statistics_youtube_api sy ON sy.video_id = v.id
      LEFT JOIN posting_accounts pa ON s.account_id = pa.id
      WHERE qt.id = $1
    `;

    const { rows } = await pool.query(query, [qa_task_id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'QA task not found'
      });
    }

    const data = rows[0];

    // Format the response
    const response = {
      success: true,
      qa_task: {
        id: data.qa_task_id,
        script_id: data.script_id,
        status: data.qa_status,
        step1_results: data.step1_results,
        step2_results: data.step2_results,
        final_notes: data.final_notes
      },
      script: {
        title: data.script_title,
        trello_card_id: data.trello_card_id,
        google_doc_link: data.google_doc_link,
        approval_status: data.approval_status,
        account_id: data.account_id,
        writer_id: data.writer_id
      },
      video: {
        id: data.video_id,
        url: data.video_url,
        created: data.video_created,
        category: data.video_cat,
        preview_url: data.preview_url
      },
      statistics: {
        video_id: data.stats_video_id,
        views: data.views_total,
        likes: data.likes_total,
        comments: data.comments_total,
        title: data.video_title,
        posted_date: data.posted_date,
        duration: data.duration,
        last_updated: data.stats_updated
      },
      account: {
        id: data.account_id,
        name: data.posting_account,
        platform: data.platform,
        status: data.account_status
      }
    };

    return res.json(response);

  } catch (error) {
    console.error('QA Preview API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch QA preview data',
      error: error.message
    });
  }
}
