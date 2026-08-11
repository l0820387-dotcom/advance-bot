/**
 * Integrated Telegram Admin Panel Handler
 */
const db = require('../lib/db');
const config = require('../config');
const { t } = require('../i18n');

class AdminHandler {
  static verifyAdmin(chatId) {
    return chatId === config.ADMIN_CHAT_ID;
  }

  static getAdminMenu() {
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Statistics', callback_data: 'admin_stats' }, { text: '👥 Users', callback_data: 'admin_users' }],
          [{ text: '💎 Premium Plans', callback_data: 'admin_plans' }, { text: '🪙 Credit Manager', callback_data: 'admin_credits' }],
          [{ text: '🛠️ Tool Config', callback_data: 'admin_tools' }, { text: '📢 Broadcast', callback_data: 'admin_broadcast' }],
          [{ text: '📣 Force Channels', callback_data: 'admin_channels' }, { text: '🔧 Maintenance', callback_data: 'admin_toggle_maint' }],
          [{ text: '📋 System Logs', callback_data: 'admin_logs' }]
        ]
      }
    };
  }

  static async handleCallback(bot, query) {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (!this.verifyAdmin(chatId)) {
      return bot.answerCallbackQuery(query.id, 'Access denied.', true);
    }

    const data = query.data;

    if (data === 'admin_dashboard') {
      const text = `👑 <b>ADMINISTRATOR CONTROL PANEL</b>\n\nTotal Users: <b>${Object.keys(db.data.users).length}</b>\nMaintenance Mode: <code>${db.data.settings.maintenance ? 'ENABLED' : 'DISABLED'}</code>`;
      return bot.editMessageText(chatId, messageId, text, this.getAdminMenu());
    }

    if (data === 'admin_stats') {
      const users = Object.values(db.data.users);
      const totalUsers = users.length;
      const premiumUsers = users.filter(u => u.isPremium).length;
      const text = `📊 <b>BOT SYSTEM STATISTICS</b>\n\n👥 Total Users: ${totalUsers}\n💎 Premium Users: ${premiumUsers}\n🔗 Shortlinks Created: ${Object.keys(db.data.shortlinks).length}\n🎫 Support Tickets: ${Object.keys(db.data.tickets).length}`;
      return bot.editMessageText(chatId, messageId, text, {
        reply_markup: { inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'admin_dashboard' }]] }
      });
    }

    if (data === 'admin_toggle_maint') {
      db.data.settings.maintenance = !db.data.settings.maintenance;
      db.save();
      bot.answerCallbackQuery(query.id, `Maintenance mode set to ${db.data.settings.maintenance}`);
      return this.handleCallback(bot, { ...query, data: 'admin_dashboard' });
    }

    if (data === 'admin_logs') {
      const logs = (db.data.logs || []).slice(0, 10).map(l => `• [${l.type}] ${l.details}`).join('\n');
      const text = `📋 <b>RECENT SYSTEM LOGS</b>\n\n${logs || 'No logs recorded.'}`;
      return bot.editMessageText(chatId, messageId, text, {
        reply_markup: { inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'admin_dashboard' }]] }
      });
    }

    bot.answerCallbackQuery(query.id, 'Action acknowledged.');
  }
}

module.exports = AdminHandler;
