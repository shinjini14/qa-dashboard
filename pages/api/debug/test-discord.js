// pages/api/debug/test-discord.js
import { notifyDiscord } from '../utils/discord';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!botToken || !channelId) {
    return res.status(400).json({
      success: false,
      error: 'Discord bot token or channel ID not configured',
      config: {
        hasBotToken: !!botToken,
        hasChannelId: !!channelId,
        botTokenLength: botToken ? botToken.length : 0,
        channelId: channelId || 'Not set'
      }
    });
  }

  try {
    // Test simple message
    const testMessage = `🧪 **Discord Test Message**\n\nTimestamp: ${new Date().toISOString()}\nEnvironment: ${process.env.NODE_ENV}\nTest successful! ✅`;

    // Test embed message
    const testEmbed = {
      title: '🧪 Discord Integration Test',
      description: 'Testing Discord bot integration for QA Pipeline',
      color: 0x304FFE,
      fields: [
        {
          name: '🤖 Bot Status',
          value: 'Connected and working!',
          inline: true
        },
        {
          name: '📅 Timestamp',
          value: new Date().toLocaleString(),
          inline: true
        },
        {
          name: '🌍 Environment',
          value: process.env.NODE_ENV || 'development',
          inline: true
        }
      ],
      footer: {
        text: 'QA Pipeline Bot Test'
      },
      timestamp: new Date().toISOString()
    };

    await notifyDiscord(testMessage, testEmbed);

    res.json({
      success: true,
      message: 'Discord test message sent successfully!',
      config: {
        channelId: channelId,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Discord Test] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send Discord test message',
      details: error.message,
      config: {
        channelId: channelId,
        environment: process.env.NODE_ENV
      }
    });
  }
}
