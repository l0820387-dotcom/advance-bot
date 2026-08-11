/**
 * Main User Dashboard, Menu Routing & Support Ticket Handlers
 */
const db = require('../lib/db');
const config = require('../config');
const { t } = require('../lib/i18n');
const AdminHandler = require('./adminHandler');

class UserHandler {
  static getUserMenu(lang = 'en') {
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Web Tools', callback_data: 'cat_web' }, { text: '📦 APK Tools', callback_data: 'cat_apk' }],
          [{ text: '🔗 Shortener', callback_data: 'cat_shortener' }, { text: '🖼️ Image Tools', callback_data: 'cat_image' }],
          [{ text: '📄 File Tools', callback_data: 'cat_file' }, { text: '👨‍💻 Dev Tools', callback_data: 'cat_dev' }],
          [{ text: '🔍 Lookup Tools', callback_data: 'cat_lookup' }, { text: '🛡️ Security', callback_data: 'cat_security' }],
          [{ text: '👤 My Account', callback_data: 'account' }, { text: '💎 Premium', callback_data: 'premium_info' }],
          [{ text: '🎫 Support', callback_data: 'support_ticket' }, { text: '🎁 Referral', callback_data: 'referral_info' }]
        ]
      }
    };
  }

  static async handleStart(bot, msg, matchParam = '') {
    const chatId = msg.chat.id;
    const user = db.getUser(chatId);

    user.username = msg.from.username || '';
    user.firstName = msg.from.first_name || 'User';
    user.lastName = msg.from.last_name || '';

    // Handle Referral Link
    if (matchParam.startsWith('ref_') && !user.referredBy) {
      const referrerId = parseInt(matchParam.replace('ref_', ''), 10);
      if (referrerId && referrerId !== chatId) {
        user.referredBy = referrerId;
        const referrer = db.getUser(referrerId);
        referrer.credits += config.REFERRAL_REWARD_CREDITS;
        referrer.referralCount++;
        db.save();
        bot.sendMessage(referrerId, `🎁 <b>New Referral!</b> You received ${config.REFERRAL_REWARD_CREDITS} credits!`);
      }
    }

    db.save();

    if (chatId === config.ADMIN_CHAT_ID) {
      return bot.sendMessage(chatId, t(user.lang, 'admin_welcome'), AdminHandler.getAdminMenu());
    }

    const welcomeMsg = t(user.lang, 'welcome', { name: user.firstName });
    return bot.sendMessage(chatId, welcomeMsg, this.getUserMenu(user.lang));
  }

  static async handleCallback(bot, query) {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const user = db.getUser(chatId);
    const data = query.data;

    if (data === 'cat_web') {
      return bot.editMessageText(chatId, messageId, '🌐 <b>WEB TOOLS</b>\n\nSelect a tool:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 URL -> HTML File', callback_data: 'tool_url_html' }],
            [{ text: '🏷️ Title & Meta Checker', callback_data: 'tool_title_meta' }],
            [{ text: '⬅️ Back', callback_data: 'home' }]
          ]
        }
      });
    }

    if (data === 'cat_dev') {
      return bot.editMessageText(chatId, messageId, '👨‍💻 <b>DEVELOPER TOOLS</b>\n\nSelect a generator/utility:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔑 Password Generator', callback_data: 'dev_gen_pass' }],
            [{ text: '🆔 UUID Generator', callback_data: 'dev_gen_uuid' }],
            [{ text: '⬅️ Back', callback_data: 'home' }]
          ]
        }
      });
    }

    if (data === 'account') {
      const text = `👤 <b>MY ACCOUNT</b>\n\nID: <code>${user.userId}</code>\nCredits: <b>${user.credits}</b>\nStatus: <b>${user.isPremium ? '💎 Premium' : 'Free Tier'}</b>\nReferrals: <b>${user.referralCount}</b>`;
      return bot.editMessageText(chatId, messageId, text, {
        reply_markup: {
          inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'home' }]]
        }
      });
    }

    if (data === 'home') {
      return bot.editMessageText(chatId, messageId, t(user.lang, 'main_menu'), this.getUserMenu(user.lang));
    }

    bot.answerCallbackQuery(query.id);
  }
}

module.exports = UserHandler;
