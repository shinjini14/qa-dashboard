// pages/api/notifications/discord.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    qaTaskId, 
    accountName, 
    driveUrl, 
    referenceUrl, 
    step1Results, 
    step2Results, 
    finalNotes,
    status 
  } = req.body;

  // Discord webhook URL - add this to your .env file
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!discordWebhookUrl) {
    console.error('[Discord] DISCORD_WEBHOOK_URL not configured');
    return res.status(500).json({ error: 'Discord webhook not configured' });
  }

  try {
    // Create Discord embed message
    const embed = {
      title: `🎬 QA Review ${status === 'completed' ? 'Completed' : 'Updated'}`,
      description: `QA Task #${qaTaskId} for **${accountName}**`,
      color: status === 'completed' ? 0x4CAF50 : 0x304FFE, // Green for completed, blue for in progress
      fields: [
        {
          name: '📊 Account',
          value: accountName,
          inline: true
        },
        {
          name: '📋 Status',
          value: status.charAt(0).toUpperCase() + status.slice(1),
          inline: true
        },
        {
          name: '🎯 Task ID',
          value: `#${qaTaskId}`,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    };

    // Add step results if available
    if (step1Results) {
      const step1Checks = step1Results.checks || {};
      const step1Count = Object.values(step1Checks).filter(Boolean).length;
      const step1Total = Object.keys(step1Checks).length;
      
      embed.fields.push({
        name: '✅ Step 1 Progress',
        value: `${step1Count}/${step1Total} items completed`,
        inline: true
      });
    }

    if (step2Results) {
      const step2Checks = step2Results.checks || {};
      const step2Count = Object.values(step2Checks).filter(Boolean).length;
      const step2Total = Object.keys(step2Checks).length;
      
      embed.fields.push({
        name: '✅ Step 2 Progress',
        value: `${step2Count}/${step2Total} items completed`,
        inline: true
      });
    }

    // Add links
    if (driveUrl) {
      embed.fields.push({
        name: '🎥 Drive Video',
        value: `[View Video](${driveUrl})`,
        inline: true
      });
    }

    if (referenceUrl) {
      embed.fields.push({
        name: '📺 Reference Video',
        value: `[View Reference](${referenceUrl})`,
        inline: true
      });
    }

    // Add final notes if completed
    if (status === 'completed' && finalNotes) {
      embed.fields.push({
        name: '📝 Final Notes',
        value: finalNotes.substring(0, 1000), // Discord field limit
        inline: false
      });
    }

    // Send to Discord
    const discordPayload = {
      embeds: [embed],
      username: 'QA Pipeline Bot',
      avatar_url: 'https://cdn.discordapp.com/emojis/🎬.png'
    };

    await axios.post(discordWebhookUrl, discordPayload);

    console.log(`[Discord] Notification sent for QA task ${qaTaskId}`);
    res.json({ success: true, message: 'Discord notification sent' });

  } catch (error) {
    console.error('[Discord] Failed to send notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send Discord notification',
      details: error.message 
    });
  }
}
