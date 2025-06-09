import pool from './utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // 1. First, let's check what tables exist
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('login', 'script', 'video', 'posting_accounts', 'qa_tasks')
    `);
    
    console.log('Existing tables:', tablesCheck.rows.map(r => r.table_name));

    // 2. Create login table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 3. Insert admin user for testing
    await pool.query(`
      INSERT INTO login (username, password, role) 
      VALUES ('admin', 'admin', 'admin') 
      ON CONFLICT (username) DO UPDATE SET 
        password = EXCLUDED.password,
        role = EXCLUDED.role
    `);

    // 4. Create posting_accounts table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posting_accounts (
        id SERIAL PRIMARY KEY,
        account VARCHAR(100) NOT NULL,
        platform VARCHAR(50) DEFAULT 'youtube',
        status VARCHAR(20) DEFAULT 'active',
        writer_id INTEGER,
        daily_limit INTEGER DEFAULT 10,
        daily_used INTEGER DEFAULT 0
      )
    `);

    // 5. Insert sample posting accounts
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

    // 6. Create script table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS script (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        google_doc_link TEXT,
        approval_status VARCHAR(50) DEFAULT 'Draft',
        ai_qa_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        trello_card_id VARCHAR(255),
        posting_date DATE,
        loom_url TEXT,
        account_id INTEGER,
        url TEXT,
        short_url TEXT,
        is_archived BOOLEAN DEFAULT false,
        writer_id INTEGER
      )
    `);

    // 7. Create video table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video (
        id SERIAL PRIMARY KEY,
        created TIMESTAMP DEFAULT NOW(),
        sponsor_id INTEGER,
        writer_id INTEGER,
        account_id INTEGER,
        url TEXT,
        needs_entry BOOLEAN DEFAULT false,
        video_type VARCHAR(30),
        script_title TEXT,
        trello_card_id VARCHAR(255),
        video_cat VARCHAR(30),
        project_id INTEGER,
        variable_id INTEGER
      )
    `);

    // 8. Create statistics_youtube_api table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS statistics_youtube_api (
        video_id VARCHAR(50) PRIMARY KEY,
        views_total INTEGER DEFAULT 0,
        likes_total INTEGER DEFAULT 0,
        comments_total INTEGER DEFAULT 0,
        title TEXT,
        preview TEXT,
        posted_date TIMESTAMP,
        sponsor_id VARCHAR(50),
        writer_id VARCHAR(50),
        updated_at TIMESTAMP DEFAULT NOW(),
        duration TIME
      )
    `);

    // 9. Create qa_tasks table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS qa_tasks (
        id SERIAL PRIMARY KEY,
        script_id INTEGER REFERENCES script(id),
        assigned_account INTEGER,
        status VARCHAR(20) DEFAULT 'awaiting',
        step1_results JSONB,
        step2_results JSONB,
        final_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 10. Insert sample test data for QA
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
      RETURNING id
    `);

    const scriptId = scriptResult.rows[0].id;

    // 11. Insert corresponding video data
    const videoResult = await pool.query(`
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
      RETURNING id
    `);

    const videoId = videoResult.rows[0].id;

    // 12. Insert statistics data
    await pool.query(`
      INSERT INTO statistics_youtube_api (
        video_id, 
        views_total, 
        likes_total, 
        comments_total, 
        title, 
        preview,
        posted_date
      ) 
      VALUES (
        $1, 
        1500, 
        45, 
        12, 
        'Test Script for QA Review', 
        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        NOW()
      )
      ON CONFLICT (video_id) DO UPDATE SET
        views_total = EXCLUDED.views_total,
        title = EXCLUDED.title
    `, [videoId]);

    return res.json({
      success: true,
      message: 'Test data setup complete!',
      data: {
        script_id: scriptId,
        video_id: videoId,
        admin_credentials: {
          username: 'admin',
          password: 'admin'
        }
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to setup test data',
      error: error.message
    });
  }
}
