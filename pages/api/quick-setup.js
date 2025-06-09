import pool from './utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting quick setup...');

    // 1. Insert sample posting accounts
    await pool.query(`
      INSERT INTO posting_accounts (id, account, platform, status) 
      VALUES 
        (1, 'Test Account 1', 'youtube', 'active'),
        (2, 'Test Account 2', 'youtube', 'active'),
        (3, 'Inactive Account', 'youtube', 'inactive')
      ON CONFLICT (id) DO UPDATE SET 
        account = EXCLUDED.account,
        status = EXCLUDED.status
    `);
    console.log('✅ Posting accounts created');

    // 2. Insert a test script that's ready for QA
    const scriptResult = await pool.query(`
      INSERT INTO script (
        title, 
        google_doc_link, 
        approval_status, 
        ai_qa_status, 
        trello_card_id, 
        account_id,
        writer_id
      ) 
      VALUES (
        'Test Script for QA Review', 
        'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
        'Posted', 
        'pending', 
        'test-card-123', 
        1,
        1
      ) 
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    console.log('✅ Test script created');

    let scriptId;
    if (scriptResult.rows.length > 0) {
      scriptId = scriptResult.rows[0].id;
    } else {
      // Script already exists, get its ID
      const existingScript = await pool.query(`
        SELECT id FROM script WHERE trello_card_id = 'test-card-123'
      `);
      scriptId = existingScript.rows[0]?.id;
    }

    // 3. Insert corresponding video data
    if (scriptId) {
      await pool.query(`
        INSERT INTO video (
          url, 
          script_title, 
          trello_card_id, 
          account_id, 
          writer_id,
          video_cat
        ) 
        VALUES (
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
          'Test Script for QA Review', 
          'test-card-123', 
          1, 
          1,
          'long'
        ) 
        ON CONFLICT DO NOTHING
      `);
      console.log('✅ Test video created');
    }

    // 4. Check what we have
    const accountsCheck = await pool.query(`
      SELECT id, account, status FROM posting_accounts WHERE status = 'active'
    `);

    const scriptsCheck = await pool.query(`
      SELECT s.id, s.title, s.approval_status, s.ai_qa_status, v.url
      FROM script s
      LEFT JOIN video v ON s.trello_card_id = v.trello_card_id
      WHERE s.approval_status = 'Posted' AND s.ai_qa_status = 'pending'
    `);

    return res.json({
      success: true,
      message: 'Quick setup complete!',
      data: {
        active_accounts: accountsCheck.rows,
        ready_for_qa: scriptsCheck.rows,
        instructions: {
          step1: 'Go to http://localhost:3000',
          step2: 'Select "Test Account 1" from dropdown',
          step3: 'Click "Start QA Review"',
          step4: 'You should see the test script ready for review'
        }
      }
    });

  } catch (error) {
    console.error('Quick setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to setup test data',
      error: error.message
    });
  }
}
