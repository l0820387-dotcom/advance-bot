/**
 * URL Shortener with Multi-Provider Fallback & Custom Alias System
 */
const db = require('../lib/db');
const https = require('https');

class ShortenerTools {
  static async createShortUrl(originalUrl, customAlias = null, userId = null) {
    const alias = customAlias || Math.random().toString(36).substring(2, 8);

    if (db.data.shortlinks[alias]) {
      throw new Error('Alias already in use. Please choose another.');
    }

    const shortCode = `s_${alias}`;
    const botShortUrl = `https://t.me/${require('../config').BOT_USERNAME}?start=${shortCode}`;

    db.data.shortlinks[alias] = {
      alias,
      originalUrl,
      ownerId: userId,
      shortUrl: botShortUrl,
      clicks: 0,
      createdAt: new Date().toISOString()
    };
    db.save();

    return db.data.shortlinks[alias];
  }

  static async getExternalShortener(targetUrl) {
    return new Promise((resolve) => {
      const api = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(targetUrl)}`;
      https.get(api, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body.trim()));
      }).on('error', () => resolve(null));
    });
  }

  static recordClick(alias) {
    if (db.data.shortlinks[alias]) {
      db.data.shortlinks[alias].clicks++;
      db.save();
      return db.data.shortlinks[alias].originalUrl;
    }
    return null;
  }
}

module.exports = ShortenerTools;
