# QA Pipeline Deployment Guide

## 🚀 Vercel Deployment

### Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **PostgreSQL Database**: Set up a cloud PostgreSQL database (recommended: Supabase, Railway, or Neon)

### Step 1: Prepare Your Database
1. Create a PostgreSQL database in the cloud
2. Run the database schema (create tables: `qa_tasks`, `posting_accounts`, etc.)
3. Note down your database connection details

### Step 2: Set Up Discord Webhook (Optional)
1. Go to your Discord server settings
2. Navigate to Integrations → Webhooks
3. Create a new webhook and copy the URL

### Step 3: Set Up Trello Integration (Optional)
1. Get your Trello API key: https://trello.com/app-key
2. Generate a token: https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&name=QA-Pipeline&key=YOUR_API_KEY
3. Get your Board ID and List IDs from Trello URLs

### Step 4: Deploy to Vercel
1. **Connect Repository**:
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Or deploy via Vercel dashboard
   # Go to vercel.com → New Project → Import from GitHub
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   ```
   DB_USER=your_postgres_username
   DB_HOST=your_postgres_host
   DB_NAME=your_database_name
   DB_PORT=5432
   DB_PASS=your_postgres_password
   
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   
   TRELLO_API_KEY=your_trello_api_key
   TRELLO_TOKEN=your_trello_token
   TRELLO_BOARD_ID=your_board_id
   TRELLO_LIST_ID=your_default_list_id
   
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   ```

3. **Deploy**:
   - Vercel will automatically deploy when you push to your main branch
   - Or click "Deploy" in the Vercel dashboard

### Step 5: Test Your Deployment
1. Visit your Vercel URL
2. Test the login functionality
3. Test the QA workflow
4. Verify Discord/Trello notifications work

## 🔧 Configuration Details

### Required Environment Variables
- `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PORT`, `DB_PASS`: Database connection
- `JWT_SECRET`: For authentication (generate a strong random string)

### Optional Environment Variables
- `DISCORD_WEBHOOK_URL`: For Discord notifications
- `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID`, `TRELLO_LIST_ID`: For Trello integration

### Database Schema
Make sure your database has these tables:
```sql
-- QA Tasks table
CREATE TABLE qa_tasks (
  id SERIAL PRIMARY KEY,
  assigned_account INTEGER,
  drive_url TEXT,
  reference_url TEXT,
  status VARCHAR(20) DEFAULT 'in_progress',
  step1_results JSONB,
  step2_results JSONB,
  final_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posting Accounts table (if not exists)
CREATE TABLE posting_accounts (
  id SERIAL PRIMARY KEY,
  account VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active'
);
```

## 📱 Features Included

### ✅ QA Workflow
- Two-step QA process with customizable checklists
- Real-time saving of progress
- Video comparison (reference vs QA video)
- Comments and notes

### ✅ Notifications
- **Discord**: Rich embed notifications with progress and links
- **Trello**: Automatic card creation/updates with QA results

### ✅ Report Generation
- Downloadable text reports with all QA details
- Includes links, checklist results, and comments
- Formatted for easy sharing

### ✅ Video Support
- YouTube video embedding for reference videos
- Google Drive video preview for QA videos
- Fallback options if embedding fails

## 🛠️ Troubleshooting

### Common Issues
1. **Database Connection**: Ensure your database allows connections from Vercel IPs
2. **Environment Variables**: Double-check all required variables are set in Vercel
3. **Video Playback**: Some Google Drive videos may not embed due to privacy settings
4. **Notifications**: Test webhook URLs manually to ensure they work

### Support
- Check Vercel deployment logs for errors
- Test API endpoints individually
- Verify database connectivity

## 🔄 Updates
To update your deployment:
1. Push changes to your GitHub repository
2. Vercel will automatically redeploy
3. Check deployment status in Vercel dashboard
