import axios from 'axios';

export async function notifyDiscord(message, embed = null) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!botToken || !channelId) {
    console.warn('Discord bot token or channel ID not configured');
    return;
  }

  const url = `https://discord.com/api/v10/channels/${channelId}/messages`;

  const payload = {
    content: message
  };

  if (embed) {
    payload.embeds = [embed];
  }

  try {
    await axios.post(url, payload, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('[Discord] Message sent successfully');
  } catch (error) {
    console.error('[Discord] Failed to send message:', error.response?.data || error.message);
    throw error;
  }
}

