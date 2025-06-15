import pool from './utils/db';

export default async function handler(req, res) {
  try {
    // Get accounts with their reference URLs
    const { rows } = await pool.query(`
      SELECT
        pa.id,
        pa.account,
        pa.status,
        ru.url as reference_url
      FROM posting_accounts pa
      LEFT JOIN reference_url ru ON pa.account = ru.account_name
      WHERE pa.status NOT IN ('inactive', 'disabled', 'Inactive')
      ORDER BY pa.id
    `);

    // Convert reference URLs to embed format for preview
    const accountsWithEmbeds = rows.map(account => ({
      ...account,
      embed_url: account.reference_url ? convertToEmbedUrl(account.reference_url) : null
    }));

    res.json({
      success: true,
      accounts: accountsWithEmbeds
    });
  } catch (err) {
    console.error('Accounts API error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Failed to fetch accounts'
    });
  }
}

// Helper function to convert various video URLs to embed format
function convertToEmbedUrl(url) {
  if (!url) return null;

  try {
    // YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // Google Drive URLs
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    return url; // Return original if no conversion needed
  } catch (e) {
    console.error('Error converting URL to embed:', e);
    return url;
  }
}

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

