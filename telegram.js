/**
 * Native Telegram Bot API Client (Pure Node.js https)
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class TelegramBot {
  constructor(token) {
    this.token = token;
    this.apiBase = `https://api.telegram.org/bot${token}`;
  }

  request(method, payload = {}) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);
      const url = new URL(`${this.apiBase}/${method}`);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.ok) resolve(parsed.result);
            else reject(new Error(parsed.description || 'Telegram API Error'));
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  async sendMessage(chatId, text, extra = {}) {
    return this.request('sendMessage', {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra
    });
  }

  async editMessageText(chatId, messageId, text, extra = {}) {
    return this.request('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra
    });
  }

  async answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
    return this.request('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text: text,
      show_alert: showAlert
    });
  }

  async getChatMember(chatId, userId) {
    return this.request('getChatMember', {
      chat_id: chatId,
      user_id: userId
    });
  }

  async sendDocument(chatId, filePath, caption = '', extra = {}) {
    return new Promise((resolve, reject) => {
      const boundary = '----TelegramBoundary' + Math.random().toString(16).substring(2);
      const filename = path.basename(filePath);
      const fileStream = fs.readFileSync(filePath);

      const header = `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="parse_mode"\r\n\r\nHTML\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="document"; filename="${filename}"\r\n` +
        `Content-Type: application/octet-stream\r\n\r\n`;

      const footer = `\r\n--${boundary}--\r\n`;

      const req = https.request({
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${this.token}/sendDocument`,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(header) + fileStream.length + Buffer.byteLength(footer)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.ok) resolve(parsed.result);
            else reject(new Error(parsed.description || 'Failed to send document'));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(header);
      req.write(fileStream);
      req.write(footer);
      req.end();
    });
  }

  async getFile(fileId) {
    return this.request('getFile', { file_id: fileId });
  }

  async downloadFile(filePath, saveDestination) {
    const fileUrl = `https://api.telegram.org/file/bot${this.token}/${filePath}`;
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(saveDestination);
      https.get(fileUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        fs.unlink(saveDestination, () => {});
        reject(err);
      });
    });
  }
}

module.exports = TelegramBot;
