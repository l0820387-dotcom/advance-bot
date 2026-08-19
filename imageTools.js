/**
 * Image Header Inspector & Format Classifier
 */
const fs = require('fs');

class ImageTools {
  static inspectImage(filePath) {
    const buffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    let format = 'Unknown';
    let width = 0;
    let height = 0;

    // PNG Signature: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      format = 'PNG';
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
    }
    // JPEG Signature: FF D8 FF
    else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      format = 'JPEG';
      width = 0; height = 0; // Header scan sample
    }
    // GIF Signature: GIF87a or GIF89a
    else if (buffer.toString('utf8', 0, 3) === 'GIF') {
      format = 'GIF';
      width = buffer.readUInt16LE(6);
      height = buffer.readUInt16LE(8);
    }

    return {
      format,
      width,
      height,
      sizeKB: (stats.size / 1024).toFixed(2),
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
    };
  }
}

module.exports = ImageTools;
