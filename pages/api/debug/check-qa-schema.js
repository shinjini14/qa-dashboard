// pages/api/debug/check-qa-schema.js
import pool from '../utils/db';

export default async function handler(req, res) {
  try {
    // Check qa_tasks table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'qa_tasks'
      ORDER BY ordinal_position
    `);

    // Check if step3_results column exists
    const hasStep3 = tableStructure.rows.some(row => row.column_name === 'step3_results');

    // If step3_results doesn't exist, add it
    if (!hasStep3) {
      console.log('[Debug] Adding step3_results column to qa_tasks table...');
      await pool.query(`
        ALTER TABLE qa_tasks 
        ADD COLUMN step3_results JSONB DEFAULT '{}'::jsonb
      `);
      console.log('[Debug] step3_results column added successfully');
    }

    // Get updated table structure
    const updatedStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'qa_tasks'
      ORDER BY ordinal_position
    `);

    res.json({
      success: true,
      data: {
        hadStep3Before: hasStep3,
        tableStructure: updatedStructure.rows,
        message: hasStep3 ? 'step3_results column already exists' : 'step3_results column added successfully'
      }
    });

  } catch (error) {
    console.error('[Debug] QA schema check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to check/update QA schema'
    });
  }
}
