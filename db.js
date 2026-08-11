/**
 * Thread-safe JSON Database Engine with Atomic Writes
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');

class LocalDB {
  constructor() {
    this.dbPath = path.join(config.DATA_DIR, 'database.json');
    this.ensureDirectory();
    this.data = this.load();
  }

  ensureDirectory() {
    if (!fs.existsSync(config.DATA_DIR)) fs.mkdirSync(config.DATA_DIR, { recursive: true });
    if (!fs.existsSync(config.TEMP_DIR)) fs.mkdirSync(config.TEMP_DIR, { recursive: true });
    if (!fs.existsSync(config.STORAGE_DIR)) fs.mkdirSync(config.STORAGE_DIR, { recursive: true });
  }

  load() {
    if (!fs.existsSync(this.dbPath)) {
      const initialSchema = {
        users: {},
        tools: {
          'url_html': { enabled: true, cost: 2, freeLimit: 10 },
          'apk_info': { enabled: true, cost: 5, freeLimit: 5 },
          'shortener': { enabled: true, cost: 1, freeLimit: 20 },
          'image_tools': { enabled: true, cost: 1, freeLimit: 20 },
          'file_tools': { enabled: true, cost: 1, freeLimit: 20 },
          'dev_tools': { enabled: true, cost: 0, freeLimit: 100 },
          'lookup_tools': { enabled: true, cost: 1, freeLimit: 30 },
          'security_tools': { enabled: true, cost: 1, freeLimit: 30 }
        },
        shortlinks: {},
        transactions: [],
        tickets: {},
        channels: [],
        plans: {
          'pro': { name: 'Pro Developer', price: '$5.00', durationDays: 30, credits: 500 },
          'vip': { name: 'VIP Unlimited', price: '$15.00', durationDays: 30, credits: 99999 }
        },
        shortenerProviders: [
          { id: 'internal', name: 'Internal Bot Shortener', enabled: true, priority: 1 },
          { id: 'tinyurl', name: 'TinyURL Public API', enabled: true, priority: 2 }
        ],
        logs: [],
        settings: {
          maintenance: false,
          forceJoinGlobal: false,
          welcomeMsg: 'Welcome to Premium Developer Hub!'
        }
      };
      this.save(initialSchema);
      return initialSchema;
    }
    try {
      return JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
    } catch (e) {
      return {};
    }
  }

  save(dataToSave = this.data) {
    const tempPath = `${this.dbPath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf8');
    fs.renameSync(tempPath, this.dbPath);
  }

  getUser(userId) {
    const id = String(userId);
    if (!this.data.users[id]) {
      this.data.users[id] = {
        chatId: userId,
        userId: userId,
        username: '',
        firstName: 'User',
        lastName: '',
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        lang: config.DEFAULT_LANGUAGE,
        credits: config.DEFAULT_FREE_CREDITS,
        isPremium: false,
        premiumExpiry: null,
        referredBy: null,
        referralCount: 0,
        usage: { total: 0, daily: 0 },
        isBanned: false,
        state: null,
        stateData: {}
      };
      this.save();
    }
    return this.data.users[id];
  }

  updateUser(userId, fields) {
    const user = this.getUser(userId);
    Object.assign(user, fields);
    user.lastActive = new Date().toISOString();
    this.save();
    return user;
  }

  addLog(type, details) {
    if (!this.data.logs) this.data.logs = [];
    this.data.logs.unshift({
      id: Date.now().toString(36),
      type,
      details,
      timestamp: new Date().toISOString()
    });
    if (this.data.logs.length > 500) this.data.logs.pop();
    this.save();
  }

  logTransaction(userId, type, amount, reason, balanceBefore) {
    const user = this.getUser(userId);
    if (!this.data.transactions) this.data.transactions = [];
    this.data.transactions.unshift({
      id: 'TX-' + Math.random().toString(36).substr(2, 7).toUpperCase(),
      userId,
      type,
      amount,
      balanceBefore,
      balanceAfter: user.credits,
      reason,
      timestamp: new Date().toISOString()
    });
    this.save();
  }
}

module.exports = new LocalDB();
