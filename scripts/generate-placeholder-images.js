const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const colors = [
  [124, 58, 237],
  [99, 102, 241],
  [14, 165, 233],
  [16, 185, 129],
];

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function createGradientPng(width, height, [r, g, b]) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const i = rowStart + 1 + x * 4;
      const t = y / height;
      raw[i] = Math.round(r + (255 - r) * t * 0.3);
      raw[i + 1] = Math.round(g + (255 - g) * t * 0.3);
      raw[i + 2] = Math.round(b + (255 - b) * t * 0.3);
      raw[i + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    createChunk("IHDR", ihdr),
    createChunk("IDAT", compressed),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
}

const destDir = path.join(process.cwd(), "app-data", "images");
fs.mkdirSync(destDir, { recursive: true });

for (let i = 0; i < 4; i++) {
  const png = createGradientPng(390, 844, colors[i]);
  fs.writeFileSync(path.join(destDir, `${i + 1}.png`), png);
}

console.log("Generated 4 placeholder PNG images in app-data/images/");
