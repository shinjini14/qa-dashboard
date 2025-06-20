// pages/api/qa/download-report.js
import pool from '../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { qa_task_id } = req.query;

  if (!qa_task_id) {
    return res.status(400).json({ error: 'QA task ID is required' });
  }

  try {
    // Get QA task details with account information
    const { rows } = await pool.query(`
      SELECT 
        qt.*,
        pa.account as account_name
      FROM qa_tasks qt
      LEFT JOIN posting_accounts pa ON qt.assigned_account = pa.id
      WHERE qt.id = $1
    `, [qa_task_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'QA task not found' });
    }

    const task = rows[0];
    
    // Generate report content
    const reportContent = generateReportContent(task);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="QA_Report_${qa_task_id}_${task.account_name || 'Unknown'}.txt"`);
    
    res.status(200).send(reportContent);

  } catch (error) {
    console.error('[Download Report] Error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

function generateReportContent(task) {
  const now = new Date().toISOString();
  
  let report = `QA REVIEW REPORT
==========================================

Report Generated: ${now}
Task ID: #${task.id}
Account: ${task.account_name || 'Unknown'}
Status: ${task.status}
Created: ${task.created_at}
Updated: ${task.updated_at}

==========================================
LINKS AND RESOURCES
==========================================

Drive Video URL: ${task.drive_url || 'Not provided'}
Reference Video URL: ${task.reference_url || 'Not provided'}

==========================================
STEP 1 RESULTS
==========================================
`;

  if (task.step1_results) {
    const step1 = task.step1_results;
    
    if (step1.checks) {
      report += `\nChecklist Items:\n`;
      Object.entries(step1.checks).forEach(([key, checked]) => {
        const label = getChecklistLabel(key, 1);
        report += `  ${checked ? '✅' : '❌'} ${label}\n`;
      });
      
      const completedCount = Object.values(step1.checks).filter(Boolean).length;
      const totalCount = Object.keys(step1.checks).length;
      report += `\nStep 1 Progress: ${completedCount}/${totalCount} items completed\n`;
    }
    
    if (step1.comments) {
      report += `\nStep 1 Comments:\n${step1.comments}\n`;
    }
  } else {
    report += `\nNo Step 1 results available.\n`;
  }

  report += `\n==========================================
STEP 2 RESULTS
==========================================
`;

  if (task.step2_results) {
    const step2 = task.step2_results;
    
    if (step2.checks) {
      report += `\nChecklist Items:\n`;
      Object.entries(step2.checks).forEach(([key, checked]) => {
        const label = getChecklistLabel(key, 2);
        report += `  ${checked ? '✅' : '❌'} ${label}\n`;
      });
      
      const completedCount = Object.values(step2.checks).filter(Boolean).length;
      const totalCount = Object.keys(step2.checks).length;
      report += `\nStep 2 Progress: ${completedCount}/${totalCount} items completed\n`;
    }
    
    if (step2.comments) {
      report += `\nStep 2 Comments:\n${step2.comments}\n`;
    }
  } else {
    report += `\nNo Step 2 results available.\n`;
  }

  report += `\n==========================================
STEP 3 RESULTS
==========================================
`;

  if (task.step3_results) {
    const step3 = task.step3_results;

    if (step3.checks) {
      report += `\nChecklist Items:\n`;
      Object.entries(step3.checks).forEach(([key, checked]) => {
        const label = getChecklistLabel(key, 3);
        report += `  ${checked ? '✅' : '❌'} ${label}\n`;
      });

      const completedCount = Object.values(step3.checks).filter(Boolean).length;
      const totalCount = Object.keys(step3.checks).length;
      report += `\nStep 3 Progress: ${completedCount}/${totalCount} items completed\n`;
    }

    if (step3.comments) {
      report += `\nStep 3 Comments:\n${step3.comments}\n`;
    }
  } else {
    report += `\nNo Step 3 results available.\n`;
  }


  report += `\n==========================================
STEP 4 RESULTS
==========================================
`;

if (task.step4_results) {
  const step4 = task.step4_results;

  if (step4.checks) {
    report += `\nChecklist Items:\n`;
    Object.entries(step4.checks).forEach(([key, checked]) => {
      const label = getChecklistLabel(key, 4);
      report += `  ${checked ? '✅' : '❌'} ${label}\n`;
    });

    const completedCount = Object.values(step4.checks).filter(Boolean).length;
    const totalCount = Object.keys(step4.checks).length;
    report += `\nStep 4 Progress: ${completedCount}/${totalCount} items completed\n`;
  }

  if (step4.comments) {
    report += `\nStep 4 Comments:\n${step4.comments}\n`;
  }
} else {
  report += `\nNo Step 4 results available.\n`;
}

report += `\n==========================================
STEP 5 RESULTS
==========================================
`;

if (task.step5_results) {
  const step5 = task.step5_results;

  if (step5.checks) {
    report += `\nChecklist Items:\n`;
    Object.entries(step5.checks).forEach(([key, checked]) => {
      const label = getChecklistLabel(key, 5);
      report += `  ${checked ? '✅' : '❌'} ${label}\n`;
    });

    const completedCount = Object.values(step5.checks).filter(Boolean).length;
    const totalCount = Object.keys(step5.checks).length;
    report += `\nStep 5 Progress: ${completedCount}/${totalCount} items completed\n`;
  }

  if (step5.comments) {
    report += `\nStep 5 Comments:\n${step5.comments}\n`;
  }
} else {
  report += `\nNo Step 5 results available.\n`;
}


  if (task.final_notes) {
    report += `\n==========================================
FINAL NOTES
==========================================

`;

    // Handle both old TEXT format and new JSONB format
    if (typeof task.final_notes === 'string') {
      // Old TEXT format
      report += task.final_notes;
    } else if (typeof task.final_notes === 'object') {
      // New JSONB format
      if (task.final_notes.comments) {
        report += task.final_notes.comments;
      }
      if (task.final_notes.completed_at) {
        report += `\n\nCompleted At: ${task.final_notes.completed_at}`;
      }
      if (task.final_notes.completed_by) {
        report += `\nCompleted By: ${task.final_notes.completed_by}`;
      }
    }

    report += `\n`;
  }

  report += `\n==========================================
SUMMARY
==========================================

Overall Status: ${task.status}
`;

  // Calculate overall completion percentage
  let totalItems = 0;
  let completedItems = 0;

  if (task.step1_results?.checks) {
    const step1Checks = Object.values(task.step1_results.checks);
    totalItems += step1Checks.length;
    completedItems += step1Checks.filter(Boolean).length;
  }

  if (task.step2_results?.checks) {
    const step2Checks = Object.values(task.step2_results.checks);
    totalItems += step2Checks.length;
    completedItems += step2Checks.filter(Boolean).length;
  }

  if (task.step3_results?.checks) {
    const step3Checks = Object.values(task.step3_results.checks);
    totalItems += step3Checks.length;
    completedItems += step3Checks.filter(Boolean).length;
  }

  if (task.step4_results?.checks) {
  const step4Checks = Object.values(task.step4_results.checks);
  totalItems += step4Checks.length;
  completedItems += step4Checks.filter(Boolean).length;
}

if (task.step5_results?.checks) {
  const step5Checks = Object.values(task.step5_results.checks);
  totalItems += step5Checks.length;
  completedItems += step5Checks.filter(Boolean).length;
}


  if (totalItems > 0) {
    const percentage = Math.round((completedItems / totalItems) * 100);
    report += `Overall Completion: ${completedItems}/${totalItems} items (${percentage}%)\n`;
  }

  report += `\n==========================================
END OF REPORT
==========================================`;

  return report;
}

function getChecklistLabel(key, step) {
  const labels = {
    1: {
      'correctTitleCardAccount': 'Correct title card account',
      'correctBeginningAnimation': 'Correct beginning animation',
      'correctEndingAnimation': 'Correct ending animation',
      'correctBackgroundFootage': 'Correct background footage',
      'audioQuality': 'Audio quality is clear',
      'videoQuality': 'Video quality is acceptable'
    },
    2: {
      'captionFont27': 'Font 27 - BalloonFont-Regular.otf',
      'captionFontSize160': 'Font size 160',
      'captionStroke14': 'Stroke 14 outer',
      'captionBumpAnimation': 'Bump Animation 1 .prfpset',
      'titleCardDownload': 'Download title card',
      'titleCardPlacementMiddle': 'Title card placement Middle',
      'titleCardPreset': 'Title card preset',
      'startAnimationPopIn': 'Start animation pop in',
      'endAnimationZoomOut': 'End animation Zoom out',
      'lastSentenceYellow': 'Last sentence yellow',
      'redArrowCapcut': 'Red arrow added'
    },
    3: {
      'backgroundAiSatisfying': 'AI Satisfying background',
      'backgroundOddlySatisfying': 'Oddly Satisfying background',
      'backgroundClip1': 'Clip 1 - AI Satisfying',
      'backgroundClip2': 'Clip 2 - Oddly',
      'backgroundClip3': 'Clip 3 - AI Satisfying',
      'backgroundClip4': 'Clip 4 - Oddly',
      'backgroundClip5': 'Clip 5 - AI Satisfying',
      'backgroundRestOddly': 'Rest clips Oddly Satisfying',
      'backgroundMusicAdded': 'Background music added'
    }
  };
  
  return labels[step]?.[key] || key;
}
