// pages/api/migrate-final-notes.js
import pool from './utils/db';

export default async function handler(req, res) {
  try {
    console.log('[migrate-final-notes] Starting migration...');

    // Step 1: Add a new JSONB column for final_notes
    await pool.query(`
      ALTER TABLE qa_tasks 
      ADD COLUMN IF NOT EXISTS final_notes_jsonb JSONB
    `);
    console.log('✅ Added final_notes_jsonb column');

    // Step 2: Migrate existing TEXT data to JSONB format
    const { rows: existingData } = await pool.query(`
      SELECT id, final_notes 
      FROM qa_tasks 
      WHERE final_notes IS NOT NULL AND final_notes != ''
    `);

    console.log(`Found ${existingData.length} records with final_notes to migrate`);

    // Step 3: Convert existing text to JSONB format
    for (const row of existingData) {
      const jsonbData = {
        comments: row.final_notes,
        timestamp: new Date().toISOString()
      };

      await pool.query(`
        UPDATE qa_tasks 
        SET final_notes_jsonb = $1 
        WHERE id = $2
      `, [JSON.stringify(jsonbData), row.id]);
    }

    console.log('✅ Migrated existing data to JSONB format');

    // Step 4: Drop the old TEXT column
    await pool.query(`
      ALTER TABLE qa_tasks 
      DROP COLUMN IF EXISTS final_notes
    `);
    console.log('✅ Dropped old final_notes TEXT column');

    // Step 5: Rename the new column to final_notes
    await pool.query(`
      ALTER TABLE qa_tasks 
      RENAME COLUMN final_notes_jsonb TO final_notes
    `);
    console.log('✅ Renamed final_notes_jsonb to final_notes');

    // Step 6: Get updated table structure
    const { rows: tableStructure } = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'qa_tasks' AND column_name = 'final_notes'
    `);

    res.json({
      success: true,
      message: 'Successfully migrated final_notes from TEXT to JSONB',
      migratedRecords: existingData.length,
      newColumnStructure: tableStructure[0]
    });

  } catch (error) {
    console.error('[migrate-final-notes] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to migrate final_notes column'
    });
  }
}
