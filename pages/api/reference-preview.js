// pages/api/reference-preview.js
import pool from './utils/db';   // ← fixed path

// Helper: convert various video URLs to embed format
function toEmbedUrl(url) {
  if (!url) return null;

  try {
    // YouTube URLs (watch, shorts, youtu.be)
    const youtubeMatch = url.match(/(?:youtu\.be\/|v=|shorts\/)([^?&/]+)/);
    if (youtubeMatch && youtubeMatch[1]) {
      const id = youtubeMatch[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
    }

    // Google Drive URLs
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    return url; // Return original if no conversion needed
  } catch (e) {
    console.error('Error converting URL to embed:', e);
    return url;
  }
}

export default async function handler(req, res) {
  const accountId = parseInt(req.query.account, 10);
  console.log('[/api/reference-preview] received accountId:', accountId);

  if (!accountId) {
    return res.status(400).json({ success: false, error: 'Missing account parameter.' });
  }

  try {
    // Get account name and reference URL from the new reference_url table
    const { rows: accountRows } = await pool.query(
      `SELECT
         pa.account,
         ru.url as reference_url
       FROM posting_accounts pa
       LEFT JOIN reference_url ru ON pa.account = ru.account_name
       WHERE pa.id = $1`,
      [accountId]
    );

    if (accountRows.length === 0) {
      console.log(`[/api/reference-preview] Account ${accountId} not found`);
      return res.json({ success: true, preview: null });
    }

    const account = accountRows[0];
    const accountName = account.account;
    const referenceUrl = account.reference_url;

    console.log(`[/api/reference-preview] Account: ${accountName}, Reference URL: ${referenceUrl}`);

    if (referenceUrl) {
      console.log(`[/api/reference-preview] Using reference URL from reference_url table:`, referenceUrl);
      return res.json({
        success: true,
        preview: {
          video_url: referenceUrl,
          embed_url: toEmbedUrl(referenceUrl)
        }
      });
    }

    // Fallback: if no reference URL in the table, try the old method
    console.log(`[/api/reference-preview] No reference URL found for ${accountName}, trying fallback...`);

    // Try to find the latest video from the video table as fallback
    const { rows: fallbackRows } = await pool.query(
      `SELECT v.url AS video_url
         FROM video v
        WHERE v.account_id = $1
          AND v.url IS NOT NULL
        ORDER BY v.created DESC
        LIMIT 1;`,
      [accountId]
    );

    if (fallbackRows.length) {
      const url = fallbackRows[0].video_url;
      console.log(`[/api/reference-preview] Using fallback video:`, url);
      return res.json({
        success: true,
        preview: {
          video_url: url,
          embed_url: toEmbedUrl(url)
        }
      });
    }

    // No reference video found at all
    console.log('[/api/reference-preview] No reference video found for account.');
    return res.json({ success: true, preview: null });
  } catch (err) {
    console.error('[/api/reference-preview] error', err);
    return res
      .status(500)
      .json({ success: false, error: 'Database error fetching reference.' });
  }
}
