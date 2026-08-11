/**
 * Rate Limiting, Cooldowns & Flood Control
 */
const config = require('../config');

class Limiter {
  constructor() {
    this.userLastAction = new Map();
    this.userActionCounts = new Map();
  }

  isRateLimited(userId) {
    const now = Date.now();
    const last = this.userLastAction.get(userId) || 0;

    if (now - last < config.RATE_LIMIT_COOLDOWN_MS) {
      return true;
    }
    this.userLastAction.set(userId, now);
    return false;
  }

  checkFlood(userId) {
    const now = Date.now();
    const record = this.userActionCounts.get(userId) || { count: 0, resetTime: now + 60000 };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + 60000;
    } else {
      record.count++;
    }

    this.userActionCounts.set(userId, record);
    return record.count > config.FLOOD_THRESHOLD_COUNT;
  }
}

module.exports = new Limiter();
