// pages/api/notifications/trello.js
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

  // Trello API credentials - add these to your .env file
  const trelloKey = process.env.TRELLO_API_KEY;
  const trelloToken = process.env.TRELLO_TOKEN;
  const trelloBoardId = process.env.TRELLO_BOARD_ID;
  const trelloListId = process.env.TRELLO_LIST_ID; // List where cards should be created

  if (!trelloKey || !trelloToken || !trelloBoardId || !trelloListId) {
    console.error('[Trello] Missing Trello configuration');
    return res.status(500).json({ error: 'Trello not configured' });
  }

  try {
    const trelloBaseUrl = 'https://api.trello.com/1';
    
    // Create card title and description
    const cardTitle = `QA Review #${qaTaskId} - ${accountName}`;
    
    let cardDescription = `**QA Review Task for ${accountName}**\n\n`;
    cardDescription += `**Status:** ${status.charAt(0).toUpperCase() + status.slice(1)}\n`;
    cardDescription += `**Task ID:** #${qaTaskId}\n\n`;

    // Add step results
    if (step1Results) {
      const step1Checks = step1Results.checks || {};
      const step1Count = Object.values(step1Checks).filter(Boolean).length;
      const step1Total = Object.keys(step1Checks).length;
      
      cardDescription += `**Step 1 Progress:** ${step1Count}/${step1Total} items completed\n`;
      
      if (step1Results.comments) {
        cardDescription += `**Step 1 Comments:** ${step1Results.comments}\n`;
      }
    }

    if (step2Results) {
      const step2Checks = step2Results.checks || {};
      const step2Count = Object.values(step2Checks).filter(Boolean).length;
      const step2Total = Object.keys(step2Checks).length;

      cardDescription += `**Step 2 Progress:** ${step2Count}/${step2Total} items completed\n`;

      if (step2Results.comments) {
        cardDescription += `**Step 2 Comments:** ${step2Results.comments}\n`;
      }
    }

    if (step3Results) {
      const step3Checks = step3Results.checks || {};
      const step3Count = Object.values(step3Checks).filter(Boolean).length;
      const step3Total = Object.keys(step3Checks).length;

      cardDescription += `**Step 3 Progress:** ${step3Count}/${step3Total} items completed\n`;

      if (step3Results.comments) {
        cardDescription += `**Step 3 Comments:** ${step3Results.comments}\n`;
      }
    }

    // Add links
    cardDescription += `\n**Links:**\n`;
    if (driveUrl) {
      cardDescription += `- [Drive Video](${driveUrl})\n`;
    }
    if (referenceUrl) {
      cardDescription += `- [Reference Video](${referenceUrl})\n`;
    }

    // Add final notes
    if (finalNotes) {
      cardDescription += `\n**Final Notes:**\n${finalNotes}\n`;
    }

    // Create or update Trello card
    const cardData = {
      name: cardTitle,
      desc: cardDescription,
      idList: trelloListId,
      key: trelloKey,
      token: trelloToken
    };

    // Add labels based on status
    if (status === 'completed') {
      cardData.idLabels = process.env.TRELLO_COMPLETED_LABEL_ID || '';
    } else if (status === 'in_progress') {
      cardData.idLabels = process.env.TRELLO_IN_PROGRESS_LABEL_ID || '';
    }

    // Check if card already exists for this QA task
    const existingCardsResponse = await axios.get(
      `${trelloBaseUrl}/lists/${trelloListId}/cards`,
      {
        params: {
          key: trelloKey,
          token: trelloToken,
          fields: 'id,name,desc'
        }
      }
    );

    const existingCard = existingCardsResponse.data.find(card => 
      card.name.includes(`#${qaTaskId}`)
    );

    let cardResponse;
    if (existingCard) {
      // Update existing card
      cardResponse = await axios.put(
        `${trelloBaseUrl}/cards/${existingCard.id}`,
        {
          name: cardTitle,
          desc: cardDescription,
          key: trelloKey,
          token: trelloToken
        }
      );
      console.log(`[Trello] Updated existing card ${existingCard.id} for QA task ${qaTaskId}`);
    } else {
      // Create new card
      cardResponse = await axios.post(
        `${trelloBaseUrl}/cards`,
        cardData
      );
      console.log(`[Trello] Created new card ${cardResponse.data.id} for QA task ${qaTaskId}`);
    }

    res.json({ 
      success: true, 
      message: existingCard ? 'Trello card updated' : 'Trello card created',
      cardId: cardResponse.data.id,
      cardUrl: cardResponse.data.shortUrl || cardResponse.data.url
    });

  } catch (error) {
    console.error('[Trello] Failed to create/update card:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create/update Trello card',
      details: error.message 
    });
  }
}
