/**
 * TLS/SSL Certificate Inspector & Phishing Pattern Auditing
 */
const tls = require('tls');

class SecurityTools {
  static async inspectSsl(domain) {
    return new Promise((resolve, reject) => {
      const socket = tls.connect(443, domain, { servername: domain }, () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        if (!cert || Object.keys(cert).length === 0) {
          return reject(new Error('No certificate details found'));
        }
        resolve({
          subject: cert.subject.CN,
          issuer: cert.issuer.O,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          fingerprint: cert.fingerprint
        });
      });
      socket.on('error', reject);
      socket.setTimeout(8000, () => { socket.destroy(); reject(new Error('SSL Inspection Timeout')); });
    });
  }

  static checkPhishingRisk(urlStr) {
    const risks = [];
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol !== 'https:') risks.push('Insecure HTTP protocol');
      if (/\d+\.\d+\.\d+\.\d+/.test(parsed.hostname)) risks.push('Hostname uses raw IP address');
      if (parsed.hostname.length > 30) risks.push('Excessively long domain name');
      if (parsed.hostname.includes('@')) risks.push('Contains credentials in URL host');
    } catch (e) {
      risks.push('Invalid URL structure');
    }
    return risks;
  }
}

module.exports = SecurityTools;
