/**
 * Developer Utilities: UUID, Hashes, Color, Random Generators, Password
 */
const crypto = require('crypto');

class DevTools {
  static generateUuid() {
    return crypto.randomUUID();
  }

  static generatePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let pass = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      pass += chars[bytes[i] % chars.length];
    }
    return pass;
  }

  static generateHashes(text) {
    return {
      md5: crypto.createHash('md5').update(text).digest('hex'),
      sha1: crypto.createHash('sha1').update(text).digest('hex'),
      sha256: crypto.createHash('sha256').update(text).digest('hex'),
      sha512: crypto.createHash('sha512').update(text).digest('hex')
    };
  }

  static convertTimestamp(ts) {
    const date = new Date(isNaN(ts) ? ts : parseInt(ts, 10));
    return {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      unixSec: Math.floor(date.getTime() / 1000)
    };
  }
}

module.exports = DevTools;
