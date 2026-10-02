import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function createPNG(width, height, r, g, b, innerR, innerG, innerB) {
  // Simple solid / concentric circle PNG generator
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 2; // Color type: 2 (RGB)
  ihdrData[10] = 0; // Compression method: 0
  ihdrData[11] = 0; // Filter method: 0
  ihdrData[12] = 0; // Interlace method: 0

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter type 0 (None) at the beginning of each scanline
  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * scanlineLength);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter byte: 0
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Simple icon drawing: gradient background, rounded mobile phone or icon in center
      if (dist < radius) {
        // Inner logo color
        rawData[pxOffset] = innerR;
        rawData[pxOffset + 1] = innerG;
        rawData[pxOffset + 2] = innerB;
      } else {
        // Background color
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 implementation
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) | 0;
}

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Colors: Primary indigo (79, 70, 229), Inner sky/white (255, 255, 255)
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, 79, 70, 229, 255, 255, 255));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, 79, 70, 229, 255, 255, 255));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 67, 56, 202, 240, 240, 255));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, 79, 70, 229, 255, 255, 255));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(32, 32, 79, 70, 229, 255, 255, 255));

console.log('PNG icons created successfully in /public');
