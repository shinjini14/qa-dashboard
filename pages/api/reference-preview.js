// pages/api/reference-preview.js
import pool from './utils/db';   // ← fixed path

// Helper: convert any YouTube watch or shorts URL into an embed URL
function toEmbedUrl(watchUrl) {
  const m = watchUrl.match(/(?:youtu\.be\/|v=|shorts\/)([^?&/]+)/);
  if (m && m[1]) {
    const id = m[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
  }
  return watchUrl;
}

export default async function handler(req, res) {
  const accountId = parseInt(req.query.account, 10);
  console.log('[/api/reference-preview] received accountId:', accountId);

  if (!accountId) {
    return res.status(400).json({ success: false, error: 'Missing account parameter.' });
  }

  try {
    // Fetch account name for logging
    const { rows: acctRows } = await pool.query(
      `SELECT account 
         FROM posting_accounts 
        WHERE id = $1`,
      [accountId]
    );
    const accountName = acctRows.length ? acctRows[0].account : 'UNKNOWN';
    console.log(`[/api/reference-preview] looking up for account name:`, accountName);

    // 1) Try to find the latest *Shorts* video for that account
    const { rows: shortRows } = await pool.query(
      `SELECT v.url AS video_url
         FROM video v
        WHERE v.account_id = $1
          AND v.url ILIKE '%shorts/%'
        ORDER BY v.created DESC
        LIMIT 1;`,
      [accountId]
    );
    if (shortRows.length) {
      const url = shortRows[0].video_url;
      console.log(`[/api/reference-preview] selected SHORTS video_url:`, url);
      return res.json({
        success: true,
        preview: {
          video_url: url,
          embed_url: toEmbedUrl(url)
        }
      });
    }

    // 2) Fallback: pick the most recent non-shorts video
    const { rows: fullRows } = await pool.query(
      `SELECT v.url AS video_url
         FROM video v
        WHERE v.account_id = $1
          AND v.url IS NOT NULL
        ORDER BY v.created DESC
        LIMIT 1;`,
      [accountId]
    );
    if (fullRows.length) {
      const url = fullRows[0].video_url;
      console.log(`[/api/reference-preview] selected FULL video_url:`, url);
      return res.json({
        success: true,
        preview: {
          video_url: url,
          embed_url: toEmbedUrl(url)
        }
      });
    }

    // 3) Nothing at all
    console.log('[/api/reference-preview] no videos found for account.');
    return res.json({ success: true, preview: null });
  } catch (err) {
    console.error('[/api/reference-preview] error', err);
    return res
      .status(500)
      .json({ success: false, error: 'Database error fetching reference.' });
  }
}
