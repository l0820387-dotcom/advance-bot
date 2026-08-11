/**
 * Bot Configuration
 * Never expose BOT_TOKEN or sensitive API keys inside messages.
 */
const path = require('path');

module.exports = {
  // Telegram Bot Credentials
  BOT_TOKEN: process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE',
  ADMIN_CHAT_ID: parseInt(process.env.ADMIN_CHAT_ID || '123456789', 10),
  BOT_USERNAME: process.env.BOT_USERNAME || 'DevUtilityHubBot',
  BOT_NAME: 'Premium Developer Hub',
  SUPPORT_USERNAME: process.env.SUPPORT_USERNAME || 'DevSupportAdmin',
  OWNER_USERNAME: process.env.OWNER_USERNAME || 'DevBotOwner',

  // Directory Paths
  DATA_DIR: path.join(__dirname, 'data'),
  TEMP_DIR: path.join(__dirname, 'temp'),
  STORAGE_DIR: path.join(__dirname, 'storage'),

  // Processing Limits
  MAX_UPLOAD_SIZE_MB: 20,
  PROCESSING_TIMEOUT_MS: 45000,
  TEMP_FILE_TTL_MS: 300000, // 5 Minutes

  // User Default Limits
  DEFAULT_FREE_CREDITS: 50,
  DEFAULT_PREMIUM_CREDITS: 500,
  REFERRAL_REWARD_CREDITS: 20,
  DEFAULT_CURRENCY: 'USD',

  // Rate Limiting
  RATE_LIMIT_COOLDOWN_MS: 2000, // 2 seconds between actions
  FLOOD_THRESHOLD_COUNT: 10,

  // Global Settings
  MAINTENANCE_MODE: false,
  DEFAULT_LANGUAGE: 'en'
};
