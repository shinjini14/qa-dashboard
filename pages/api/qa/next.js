// pages/api/qa/next.js
import pool from '../utils/db';

// same helper you used in reference-preview
function toEmbedUrl(watchUrl) {
  if (!watchUrl) return null;
  try {
    const m = watchUrl.match(/(?:youtu\.be\/|v=|shorts\/)([^?&/]+)/);
    if (m && m[1]) {
      const id = m[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
    }
  } catch (e) {
    console.error('Error in toEmbedUrl:', e);
  }
  return watchUrl;
}

export default async function handler(req, res) {
  const accountId = parseInt(req.query.account, 50);
  let driveUrl = req.query.drive;

  // Decode URL if it's encoded
  if (driveUrl) {
    try {
      driveUrl = decodeURIComponent(driveUrl);
    } catch (e) {
      console.log('[/api/qa/next] URL decode error (using original):', e.message);
    }
  }

  console.log('[/api/qa/next] received:', { accountId, driveUrl, originalDrive: req.query.drive });

  if (!accountId || !driveUrl) {
    return res.status(400).json({
      success: false,
      message: 'Please select both a Drive video and an account',
      debug: {
        accountId,
        driveUrl,
        originalDrive: req.query.drive,
        hasAccountId: !!accountId,
        hasDriveUrl: !!driveUrl
      }
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if there's already an in-progress task for this account
    const { rows: existingTasks } = await client.query(
      `SELECT qt.id AS qa_task_id, qt.drive_url, qt.reference_url
         FROM qa_tasks qt
        WHERE qt.assigned_account = $1
          AND qt.status = 'in_progress'
        LIMIT 1`,
      [accountId]
    );

    let qaTaskId, referenceUrl;

    if (existingTasks.length > 0) {
      // Use existing task
      qaTaskId = existingTasks[0].qa_task_id;
      referenceUrl = existingTasks[0].reference_url;
      console.log('[/api/qa/next] using existing task:', qaTaskId);
    } else {
      // Create new QA task

      // 1. Get account info - be more flexible with status checking
      const { rows: accountRows } = await client.query(
        `SELECT account, status FROM posting_accounts WHERE id = $1`,
        [accountId]
      );

      if (accountRows.length === 0) {
        await client.query('ROLLBACK');
        console.log(`[/api/qa/next] Account ${accountId} not found in posting_accounts table`);
        return res.status(400).json({
          success: false,
          message: `Account ID ${accountId} not found`
        });
      }

      const account = accountRows[0];

      // Check if account is inactive (only reject if explicitly inactive)
      if (account.status === 'inactive' || account.status === 'disabled' || account.status === 'Inactive' ) {
        await client.query('ROLLBACK');
        console.log(`[/api/qa/next] Account ${accountId} is ${account.status}`);
        return res.status(400).json({
          success: false,
          message: `Account is ${account.status}`
        });
      }

      const accountName = account.account;
      console.log(`[/api/qa/next] Using account: ${accountName} (ID: ${accountId}, Status: ${account.status || 'null'})`);

      // Get reference video for storage (even though frontend uses localStorage)
      const { rows: refRows } = await client.query(
        `SELECT v.url AS video_url
           FROM video v
          WHERE v.account_id = $1
            AND v.url IS NOT NULL
            AND v.url ILIKE '%shorts/%'
          ORDER BY v.created DESC
          LIMIT 1`,
        [accountId]
      );

      if (refRows.length > 0) {
        referenceUrl = refRows[0].video_url;
      } else {
        // Fallback to regular videos
        const { rows: fallbackRows } = await client.query(
          `SELECT v.url AS video_url
             FROM video v
            WHERE v.account_id = $1
              AND v.url IS NOT NULL
            ORDER BY v.created DESC
            LIMIT 1`,
          [accountId]
        );
        if (fallbackRows.length > 0) {
          referenceUrl = fallbackRows[0].video_url;
        } else {
          referenceUrl = null;
        }
      }

      // 3. Create QA task (using the actual schema columns)
      const { rows: taskRows } = await client.query(
        `INSERT INTO qa_tasks (
          assigned_account,
          drive_url,
          reference_url,
          status,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, 'in_progress', NOW(), NOW())
         RETURNING id`,
        [accountId, driveUrl, referenceUrl]
      );
      qaTaskId = taskRows[0].id;

      console.log('[/api/qa/next] created new task:', qaTaskId, 'for account:', accountName);
    }

    await client.query('COMMIT');

    // Return task data structure expected by FrameQA component
    const task = {
      qa_task_id: qaTaskId,
      title: `QA Review Task`,
      drive_url: driveUrl,
      reference_url: referenceUrl,
      reference_embed_url: referenceUrl ? toEmbedUrl(referenceUrl) : null,
      account_id: accountId
    };

    console.log('[/api/qa/next] returning task:', task);

    return res.json({
      success: true,
      task: task
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[/api/qa/next] error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to claim QA task. Please try again.'
    });
  } finally {
    client.release();
  }
}