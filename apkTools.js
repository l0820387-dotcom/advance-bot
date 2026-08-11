/**
 * Native Pure Node.js APK & ZIP Binary Inspector
 */
const fs = require('fs');
const crypto = require('crypto');

class ApkTools {
  static analyzeApk(filePath) {
    const stats = fs.statSync(filePath);
    const buffer = fs.readFileSync(filePath);

    // Calculate Cryptographic Hashes
    const md5 = crypto.createHash('md5').update(buffer).digest('hex');
    const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // Parse ZIP Archive Central Directory
    const files = [];
    let isApkValid = false;
    let hasManifest = false;
    let hasDex = false;
    let nativeLibs = new Set();

    // End of Central Directory signature: 0x06054b50
    for (let i = buffer.length - 22; i >= 0; i--) {
      if (buffer.readUInt32LE(i) === 0x06054b50) {
        isApkValid = true;
        const cdEntries = buffer.readUInt16LE(i + 10);
        const cdOffset = buffer.readUInt32LE(i + 16);

        let ptr = cdOffset;
        for (let j = 0; j < cdEntries && ptr < i; j++) {
          if (buffer.readUInt32LE(ptr) !== 0x02014b50) break;
          const fileNameLen = buffer.readUInt16LE(ptr + 28);
          const extraLen = buffer.readUInt16LE(ptr + 30);
          const commentLen = buffer.readUInt16LE(ptr + 32);

          const fileName = buffer.toString('utf8', ptr + 46, ptr + 46 + fileNameLen);
          files.push(fileName);

          if (fileName === 'AndroidManifest.xml') hasManifest = true;
          if (fileName.endsWith('.dex')) hasDex = true;
          if (fileName.startsWith('lib/')) {
            const arch = fileName.split('/')[1];
            if (arch) nativeLibs.add(arch);
          }

          ptr += 46 + fileNameLen + extraLen + commentLen;
        }
        break;
      }
    }

    return {
      isValidApk: isApkValid && hasManifest && hasDex,
      sizeBytes: stats.size,
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
      hashes: { md5, sha1, sha256 },
      fileCount: files.length,
      hasManifest,
      hasDex,
      architectures: Array.from(nativeLibs),
      sampleFiles: files.slice(0, 8)
    };
  }
}

module.exports = ApkTools;
