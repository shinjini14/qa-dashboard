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
    step3Results,
    finalNotes,
    status
  } = req.body;

  // Discord bot token and channel ID - add these to your .env file
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!botToken || !channelId) {
    console.error('[Discord] DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID not configured');
    return res.status(500).json({ error: 'Discord bot credentials not configured' });
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

    if (step3Results) {
      const step3Checks = step3Results.checks || {};
      const step3Count = Object.values(step3Checks).filter(Boolean).length;
      const step3Total = Object.keys(step3Checks).length;

      embed.fields.push({
        name: '✅ Step 3 Progress',
        value: `${step3Count}/${step3Total} items completed`,
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

    // Send to Discord using bot API
    const discordApiUrl = `https://discord.com/api/v10/channels/${channelId}/messages`;

    const discordPayload = {
      embeds: [embed]
    };

    await axios.post(discordApiUrl, discordPayload, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    });

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
