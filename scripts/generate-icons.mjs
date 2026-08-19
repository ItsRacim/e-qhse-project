import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function encodePng(width, height, pixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function segmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  let t = l2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function renderIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const w = size;
  const h = size;
  const cx = w / 2;
  const y0 = h * 0.16;
  const yb = h * 0.88;
  const halfTop = w * 0.34;
  const halfBottom = w * 0.12;
  const thickness = w * 0.05;

  const p1 = [cx - w * 0.11, h * 0.46];
  const p2 = [cx, h * 0.58];
  const p3 = [cx + w * 0.16, h * 0.32];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const px = x + 0.5;
      const py = y + 0.5;
      let inShield = false;
      if (py >= y0 && py <= yb) {
        const t = (py - y0) / (yb - y0);
        const hw = halfTop - (halfTop - halfBottom) * t;
        inShield = Math.abs(px - cx) <= hw;
      }
      if (inShield) {
        const d1 = segmentDistance(px, py, ...p1, ...p2);
        const d2 = segmentDistance(px, py, ...p2, ...p3);
        if (Math.min(d1, d2) <= thickness) {
          pixels[i] = 255;
          pixels[i + 1] = 255;
          pixels[i + 2] = 255;
        } else {
          pixels[i] = 15;
          pixels[i + 1] = 23;
          pixels[i + 2] = 42;
        }
      } else {
        pixels[i] = 245;
        pixels[i + 1] = 158;
        pixels[i + 2] = 11;
      }
      pixels[i + 3] = 255;
    }
  }
  return pixels;
}

const outDir = join(__dirname, "..", "public");
for (const size of [192, 512, 180]) {
  const png = encodePng(size, size, renderIcon(size));
  const out = join(outDir, `icon-${size}.png`);
  writeFileSync(out, png);
  console.log(`Wrote ${out}`);
}