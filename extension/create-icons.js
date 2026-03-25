// Run this once to generate placeholder icons: node create-icons.js
const fs = require('fs');
const { Buffer } = require('buffer');
const zlib = require('zlib');

function createPNG(size) {
  const raw = [];
  for (let y = 0; y < size; y++) {
    raw.push(0); // filter byte
    for (let x = 0; x < size; x++) {
      const cx = size / 2, cy = size / 2;
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy < (size * 0.4) ** 2) {
        raw.push(0x2C, 0x24, 0x18, 0xFF); // espresso color
      } else {
        raw.push(0x00, 0x00, 0x00, 0x00); // transparent
      }
    }
  }

  const rawBuf = Buffer.from(raw);
  const compressed = zlib.deflateSync(rawBuf);

  function writeU32BE(val) {
    const b = Buffer.alloc(4);
    b.writeUInt32BE(val, 0);
    return b;
  }

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const typeData = Buffer.concat([Buffer.from(type), data]);
    return Buffer.concat([
      writeU32BE(data.length),
      typeData,
      writeU32BE(crc32(typeData)),
    ]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG signature
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const dir = __dirname + '/icons';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

[16, 32, 48, 128].forEach(s => {
  fs.writeFileSync(`${dir}/icon${s}.png`, createPNG(s));
  console.log(`Created icon${s}.png`);
});

console.log('Done! You can delete this script now.');
