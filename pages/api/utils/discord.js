import axios from 'axios';

export async function notifyDiscord(message) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    console.warn('No DISCORD_WEBHOOK_URL set.');
    return;
  }
  await axios.post(url, { content: message });
}

