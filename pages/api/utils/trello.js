// pages/api/utils/trello.js
import axios from 'axios';
import pool  from './db';

export async function getTrelloCredentials() {
  const { rows } = await pool.query(
    'SELECT api_key, token FROM settings ORDER BY id DESC LIMIT 1'
  );
  if (!rows.length) throw new Error('Trello credentials not found.');
  return rows[0]; // { api_key, token }
}

// Move a card to a new list
export async function moveCard(cardId, listId) {
  const { api_key, token } = await getTrelloCredentials();
  const url = `https://api.trello.com/1/cards/${cardId}`;
  await axios.put(url, null, {
    params: { key: api_key, token: token, idList: listId }
  });
}

// Add a comment to a card
export async function addComment(cardId, text) {
  const { api_key, token } = await getTrelloCredentials();
  const url = `https://api.trello.com/1/cards/${cardId}/actions/comments`;
  await axios.post(url, { text }, {
    params: { key: api_key, token: token }
  });
}
