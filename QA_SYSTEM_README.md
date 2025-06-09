# QA Pipeline System - Complete Integration Guide

## Overview

This QA system integrates with your existing video production workflow to provide manual quality assurance after videos are posted. The system automatically detects when videos are ready for QA and provides a streamlined interface for review.

## Database Integration

### Existing Tables Used
- **`script`** - Main script table with `ai_qa_status` column
- **`video`** - Video URLs and metadata
- **`statistics_youtube_api`** - Video statistics and preview data
- **`posting_accounts`** - Account information
- **`qa_tasks`** - New table for QA workflow management

### Workflow Integration

1. **Video Posted** → Your existing `/api/updateStatus` API updates script to `approval_status = "Posted"`
2. **Video Data** → Video URLs are inserted into `video` table
3. **QA Ready** → Script `ai_qa_status` remains `"pending"` until QA starts
4. **QA Process** → Manual review through QA interface
5. **QA Complete** → Notifications sent to Trello and Discord

## API Endpoints

### `/api/qa/next?account={account_id}`
**Purpose**: Get the next QA task for a specific account
**Method**: GET
**Response**: 
```json
{
  "success": true,
  "task": {
    "qa_task_id": 123,
    "script_id": 456,
    "title": "Script Title",
    "trello_card_id": "abc123",
    "video_url": "https://youtube.com/watch?v=...",
    "script_title": "Video Title",
    "account_id": 1
  }
}
```

### `/api/qa/preview?qa_task_id={task_id}`
**Purpose**: Get comprehensive QA task data with video statistics
**Method**: GET
**Response**: Detailed task, script, video, and statistics data

### `/api/qa/complete`
**Purpose**: Complete QA review with approval/rejection
**Method**: POST
**Body**:
```json
{
  "qa_task_id": 123,
  "status": "approved", // or "rejected"
  "step1_results": {...},
  "step2_results": {...},
  "final_notes": "Review notes"
}
```

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# Database (your existing config)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=your_database
DB_PASS=your_password
DB_PORT=5432

# Trello Integration (optional)
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token
TRELLO_APPROVED_LIST_ID=list_id_for_approved_cards
TRELLO_REJECTED_LIST_ID=list_id_for_rejected_cards

# Discord Integration (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url
```

## QA Workflow

### 1. Automatic Detection
- System monitors scripts with `approval_status = "Posted"`
- Only scripts with video URLs in `video` table are eligible
- Scripts must have `ai_qa_status = "pending"`

### 2. QA Assignment
- QA reviewers select their account
- System assigns next available script for that account
- Creates `qa_tasks` record with `status = "in_progress"`
- Updates script `ai_qa_status = "in_manual_qa"`

### 3. Two-Step Review Process
- **Step 1**: Initial quality checks (title card, animations, footage)
- **Step 2**: Final review (fonts, captions, final animations)
- Each step has customizable checklists and comment fields

### 4. Final Decision
- Reviewer can **Approve** or **Reject** the video
- Final notes are required for context
- Decision is recorded in `qa_tasks` table

### 5. Notifications
- **Trello**: Card moved to appropriate list, comment added
- **Discord**: Webhook notification with QA results
- **Database**: Script `ai_qa_status` updated to "approved" or "rejected"

## Data Flow Diagram

```
Script (Posted) → Video Table → QA Detection → Manual Review → Notifications
     ↓              ↓              ↓              ↓              ↓
ai_qa_status:   video.url     qa_tasks      Step 1 & 2     Trello + Discord
"pending"       populated     created       checklists     updates sent
```

## Integration with Your Existing System

### Your Current `/api/updateStatus` API
- **No changes needed** to your existing API
- System works with your current video posting workflow
- QA system detects when `approval_status = "Posted"`

### Database Schema Additions
Only one new table was added:
```sql
-- Already created in your database
CREATE TABLE qa_tasks (
  id SERIAL PRIMARY KEY,
  script_id INTEGER REFERENCES script(id),
  assigned_account INTEGER,
  status VARCHAR(20) DEFAULT 'awaiting',
  step1_results JSONB,
  step2_results JSONB,
  final_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Column Addition
```sql
-- Already added to your script table
ALTER TABLE script ADD COLUMN ai_qa_status VARCHAR(20) DEFAULT 'pending';
```

## Usage Instructions

1. **Start QA Session**
   - Navigate to QA dashboard
   - Select your posting account
   - Click "Start QA Review"

2. **Review Process**
   - View reference document (Google Doc)
   - Watch video preview
   - Complete quality checklists
   - Add comments for each step

3. **Final Decision**
   - Review all results
   - Add final notes
   - Choose "Approve" or "Reject"
   - System automatically notifies stakeholders

## Customization

### QA Checklists
Edit `qa-pipeline/components/FrameQA.js` to modify checklist items:
```javascript
const templates = {
  1: [
    { key:'correctTitleCardAccount', label:'Correct title card account' },
    // Add your custom checks here
  ],
  2: [
    { key:'correctFont', label:'Correct Font' },
    // Add your custom checks here
  ]
};
```

### Notification Templates
Modify `qa-pipeline/pages/api/qa/complete.js` to customize:
- Trello card movements
- Discord message format
- Additional notification channels

## Troubleshooting

### No Scripts Available for QA
- Check that scripts have `approval_status = "Posted"`
- Verify video URLs exist in `video` table
- Ensure `ai_qa_status = "pending"`

### Notifications Not Working
- Verify environment variables are set
- Check Trello API credentials
- Test Discord webhook URL

### Database Connection Issues
- Confirm database credentials in `.env.local`
- Ensure PostgreSQL is running
- Check table permissions

## Support

The QA system is designed to integrate seamlessly with your existing workflow while providing comprehensive quality assurance capabilities. All notifications and database updates happen automatically after QA completion.
