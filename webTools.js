/**
 * Web & HTML Utilities
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const config = require('../config');

class WebTools {
  static async fetchUrlContent(targetUrl) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(targetUrl);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TelegramDeveloperBot/2.0'
        },
        timeout: 15000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Connection timed out')); });
    });
  }

  static async urlToHtmlFile(targetUrl) {
    const res = await this.fetchUrlContent(targetUrl);
    const host = new URL(targetUrl).hostname.replace(/[^a-z0-9]/gi, '_');
    const filename = `scraped_${host}_${Date.now()}.html`;
    const filepath = path.join(config.TEMP_DIR, filename);

    const formattedHtml = `<!-- Extracted by Premium Developer Bot -->\n<!-- Source: ${targetUrl} -->\n<!-- Status: ${res.statusCode} -->\n\n${res.body}`;
    fs.writeFileSync(filepath, formattedHtml, 'utf8');

    return { filepath, filename, statusCode: res.statusCode };
  }

  static async getTitleMeta(targetUrl) {
    const res = await this.fetchUrlContent(targetUrl);
    const body = res.body;

    const titleMatch = body.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'N/A';

    const metaTags = [];
    const metaRegex = /<meta\s+([^>]+)>/gi;
    let match;
    while ((match = metaRegex.exec(body)) !== null && metaTags.length < 15) {
      metaTags.push(match[1]);
    }

    return {
      title,
      statusCode: res.statusCode,
      metaCount: metaTags.length,
      sampleMeta: metaTags.slice(0, 5).join('\n')
    };
  }

  static minifyHtml(html) {
    return html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  static beautifyHtml(html) {
    let indent = 0;
    return html.replace(/<[^>]+>/g, (tag) => {
      if (tag.match(/^<\//)) indent = Math.max(0, indent - 1);
      const padding = '  '.repeat(indent);
      if (!tag.match(/^<\//) && !tag.match(/\/Check>/) && !tag.match(/<(img|br|hr|input|meta|link)/i)) {
        indent++;
      }
      return `\n${padding}${tag}`;
    });
  }
}

module.exports = WebTools;
