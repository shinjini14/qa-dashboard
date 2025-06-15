// pages/api/check-table-structure.js
import pool from './utils/db';

export default async function handler(req, res) {
  try {
    // Get detailed table structure including generated columns
    const { rows: tableStructure } = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        is_generated,
        generation_expression
      FROM information_schema.columns 
      WHERE table_name = 'drive_links'
      ORDER BY ordinal_position
    `);

    // Get constraints
    const { rows: constraints } = await pool.query(`
      SELECT 
        constraint_name, 
        constraint_type,
        column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'drive_links'
    `);

    // Get sample data
    const { rows: sampleData } = await pool.query(`
      SELECT * FROM drive_links LIMIT 5
    `);

    res.json({
      success: true,
      tableStructure,
      constraints,
      sampleData,
      totalRecords: sampleData.length
    });

  } catch (error) {
    console.error('[check-table-structure] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
