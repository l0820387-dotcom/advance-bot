/**
 * Master Bot Entrypoint with Polling Engine & Task Dispatcher
 */
const config = require('./config');
const TelegramBot = require('./lib/telegram');
const db = require('./lib/db');
const limiter = require('./lib/limiter');
const UserHandler = require('./handlers/userHandler');
const AdminHandler = require('./handlers/adminHandler');
const WebTools = require('./tools/webTools');
const ApkTools = require('./tools/apkTools');
const DevTools = require('./tools/devTools');

const bot = new TelegramBot(config.BOT_TOKEN);
let updateOffset = 0;

console.log(`🤖 Starting ${config.BOT_NAME}...`);

async function processUpdate(update) {
  try {
    // 1. Handle Inline Keyboards Callback Queries
    if (update.callback_query) {
      const query = update.callback_query;
      const chatId = query.message.chat.id;

      if (limiter.isRateLimited(chatId)) {
        return bot.answerCallbackQuery(query.id, 'Slow down! Please wait.', true);
      }

      if (chatId === config.ADMIN_CHAT_ID && query.data.startsWith('admin_')) {
        return await AdminHandler.handleCallback(bot, query);
      } else {
        return await UserHandler.handleCallback(bot, query);
      }
    }

    // 2. Handle Text Messages & Commands
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text || '';

      if (limiter.checkFlood(chatId)) {
        return bot.sendMessage(chatId, '⚠️ Flood limit exceeded. Please wait a minute.');
      }

      const user = db.getUser(chatId);

      if (config.MAINTENANCE_MODE && chatId !== config.ADMIN_CHAT_ID) {
        return bot.sendMessage(chatId, '🔧 The bot is currently in maintenance mode.');
      }

      // Command Router
      if (text.startsWith('/start')) {
        const param = text.split(' ')[1] || '';
        return await UserHandler.handleStart(bot, msg, param);
      }

      if (text === '/admin' && chatId === config.ADMIN_CHAT_ID) {
        return await bot.sendMessage(chatId, '👑 Admin Interface', AdminHandler.getAdminMenu());
      }

      // Active Tool State Manager
      if (user.state === 'AWAITING_URL_HTML') {
        user.state = null;
        db.save();
        bot.sendMessage(chatId, '⏳ Fetching webpage and rendering HTML file...');
        try {
          const result = await WebTools.urlToHtmlFile(text);
          await bot.sendDocument(chatId, result.filepath, `✅ Extracted HTML source (${result.statusCode})`);
        } catch (e) {
          bot.sendMessage(chatId, `❌ Extraction failed: ${e.message}`);
        }
        return;
      }

      // Handle File Uploads (e.g. APKs)
      if (msg.document) {
        const doc = msg.document;
        if (doc.file_name.endsWith('.apk')) {
          bot.sendMessage(chatId, '📦 APK file received. Analyzing ZIP/Binary structure...');
          const fileInfo = await bot.getFile(doc.file_id);
          const localPath = `${config.TEMP_DIR}/${doc.file_name}`;
          await bot.downloadFile(fileInfo.file_path, localPath);

          const apkData = ApkTools.analyzeApk(localPath);
          const report = `📦 <b>APK ANALYSIS REPORT</b>\n\nSize: <b>${apkData.sizeMB} MB</b>\nHashes:\n• MD5: <code>${apkData.hashes.md5}</code>\n• SHA256: <code>${apkData.hashes.sha256}</code>\n\nValid ZIP: <b>${apkData.isValidApk}</b>\nArchitectures: <code>${apkData.architectures.join(', ') || 'None'}</code>`;
          return bot.sendMessage(chatId, report);
        }
      }
    }
  } catch (err) {
    console.error('Update processing error:', err);
  }
}

// Long Polling Loop
async function poll() {
  try {
    const updates = await bot.request('getUpdates', { offset: updateOffset, timeout: 30 });
    for (const update of updates) {
      updateOffset = update.update_id + 1;
      await processUpdate(update);
    }
  } catch (err) {
    console.error('Polling error:', err.message);
    await new Promise(r => setTimeout(r, 3000));
  }
  setImmediate(poll);
}

poll();
