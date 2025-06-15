// pages/api/qa-config.js
export default async function handler(req, res) {
  try {
    // Return QA configuration links from environment variables
    const qaConfig = {
      // Step 2: Caption Text Preset and Caption Animation
      balloonFontUrl: process.env.QA_BALLOON_FONT_URL,
      bumpAnimationUrl: process.env.QA_BUMP_ANIMATION_URL,
      
      // Step 2: Title Card Link and Title card preset
      titleCardDownloadUrl: process.env.QA_TITLE_CARD_DOWNLOAD_URL,
      titleCardPresetUrl: process.env.QA_TITLE_CARD_PRESET_URL,
      startAnimationUrl: process.env.QA_START_ANIMATION_URL,
      endAnimationUrl: process.env.QA_END_ANIMATION_URL,
      
      // Step 3: Background For short and regular
      aiSatisfyingFolderUrl: process.env.QA_AI_SATISFYING_FOLDER_URL,
      oddlySatisfyingFolderUrl: process.env.QA_ODDLY_SATISFYING_FOLDER_URL,
      
      // Step 3: Add background music to it
      musicProcessDocUrl: process.env.QA_MUSIC_PROCESS_DOC_URL
    };

    // Filter out undefined values
    const filteredConfig = Object.fromEntries(
      Object.entries(qaConfig).filter(([key, value]) => value !== undefined)
    );

    res.json({
      success: true,
      config: filteredConfig
    });

  } catch (error) {
    console.error('[qa-config] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
