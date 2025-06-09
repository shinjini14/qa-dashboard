export default async function handler(_req, res) {
  return res.status(200).json({
    success: true,
    message: 'No database initialization needed - using existing login table'
  });
}
