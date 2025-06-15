// pages/api/add-step3-results.js
import pool from './utils/db';

export default async function handler(req, res) {
  try {
    console.log('[add-step3-results] Starting migration...');

    // Add step3_results column to qa_tasks table
    await pool.query(`
      ALTER TABLE qa_tasks 
      ADD COLUMN IF NOT EXISTS step3_results JSONB
    `);
    console.log('✅ Added step3_results JSONB column');

    // Get updated table structure
    const { rows: tableStructure } = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'qa_tasks' 
      AND column_name IN ('step1_results', 'step2_results', 'step3_results', 'final_notes')
      ORDER BY column_name
    `);

    res.json({
      success: true,
      message: 'Successfully added step3_results column',
      tableStructure: tableStructure
    });

  } catch (error) {
    console.error('[add-step3-results] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to add step3_results column'
    });
  }
}
