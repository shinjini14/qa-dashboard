// pages/api/debug/test-url-decode.js

export default async function handler(req, res) {
  const accountParam = req.query.account;
  const accountId = accountParam ? parseInt(accountParam, 10) : null;
  let driveUrl = req.query.drive;
  const originalDrive = req.query.drive;

  // Decode URL if it's encoded
  if (driveUrl) {
    try {
      driveUrl = decodeURIComponent(driveUrl);
    } catch (e) {
      console.log('[URL Test] Decode error:', e.message);
    }
  }

  res.json({
    success: true,
    data: {
      accountParam,
      accountId,
      originalDrive,
      decodedDrive: driveUrl,
      hasAccountId: !!accountId,
      hasDriveUrl: !!driveUrl,
      accountIdType: typeof accountId,
      driveUrlType: typeof driveUrl,
      validation: {
        accountIdValid: !!(accountId && !isNaN(accountId) && accountId > 0),
        driveUrlValid: !!driveUrl && driveUrl.length > 0,
        bothValid: (!!(accountId && !isNaN(accountId) && accountId > 0)) && (!!driveUrl && driveUrl.length > 0),
        wouldPassValidation: (!accountId || isNaN(accountId) || accountId <= 0 || !driveUrl) ? false : true
      }
    }
  });
}
