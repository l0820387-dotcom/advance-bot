/**
 * Native File Converters, Base64 & Format Processors
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');

class FileTools {
  static txtToHtml(textContent, title = 'Document') {
    const escaped = textContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>body { font-family: monospace; padding: 20px; background: #f4f4f9; color: #333; }</style>
</head>
<body>
  <pre>${escaped}</pre>
</body>
</html>`;
  }

  static formatJson(jsonString) {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  }

  static minifyJson(jsonString) {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  }

  static encodeBase64(str) {
    return Buffer.from(str, 'utf8').toString('base64');
  }

  static decodeBase64(str) {
    return Buffer.from(str, 'base64').toString('utf8');
  }
}

module.exports = FileTools;
