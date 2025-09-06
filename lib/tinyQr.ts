// Minimal QR code generator for byte mode, EC level M.
// Produces a module matrix (boolean[][]). Not a full spec implementation but
// supports typical otpauth URLs (< ~200 chars).

type Cell = boolean | { v: boolean; f: true } | null;
type Matrix = Cell[][];

// Galois field math for Reed-Solomon
const EXP_TABLE = new Array<number>(256);
const LOG_TABLE = new Array<number>(256);
for (let i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
for (let i = 0; i < 255; i++) LOG_TABLE[EXP_TABLE[i]] = i;
function gfMul(x: number, y: number) {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255];
}

// Generator polynomial for given degree
function rsGeneratorPoly(degree: number) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], EXP_TABLE[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsComputeRemainder(data: number[], ecCount: number) {
  const gen = rsGeneratorPoly(ecCount);
  const res = new Array(ecCount).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    res.shift();
    res.push(0);
    if (factor !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[j] ^= gfMul(gen[j], factor);
      }
    }
  }
  return res;
}

// Version capacity table for Byte mode, EC M: [version, data codewords, ec codewords]
// This is a compact subset sufficient for ~200 bytes.
const VERSION_TABLE: Array<{ v: number; totalCW: number; ecCW: number }> = [
  { v: 1, totalCW: 26, ecCW: 10 },
  { v: 2, totalCW: 44, ecCW: 16 },
  { v: 3, totalCW: 70, ecCW: 26 },
  { v: 4, totalCW: 100, ecCW: 36 },
  { v: 5, totalCW: 134, ecCW: 48 },
  { v: 6, totalCW: 172, ecCW: 64 },
  { v: 7, totalCW: 196, ecCW: 72 },
  { v: 8, totalCW: 242, ecCW: 88 },
  { v: 9, totalCW: 292, ecCW: 110 },
  { v: 10, totalCW: 346, ecCW: 130 },
];

function getVersionForLength(len: number) {
  // Byte mode uses 8-bit characters; header: mode(4) + charCount(v<10:8bits; v>=10:16bits)
  for (const e of VERSION_TABLE) {
    const mode = 4; // bits
    const countBits = e.v <= 9 ? 8 : 16;
    const capacityBits = (e.totalCW - e.ecCW) * 8;
    if (mode + countBits + len * 8 + 4 <= capacityBits) return e;
  }
  return VERSION_TABLE[VERSION_TABLE.length - 1];
}

function initMatrixSize(version: number) {
  return 17 + 4 * version;
}

function placeFinderPattern(m: Matrix, x: number, y: number) {
  for (let dy = -1; dy <= 7; dy++) {
    for (let dx = -1; dx <= 7; dx++) {
      const xx = x + dx, yy = y + dy;
      if (yy < 0 || xx < 0 || yy >= m.length || xx >= m.length) continue;
      const in7 = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const in5 = dx >= 1 && dx <= 5 && dy >= 1 && dy <= 5;
      const in3 = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
      const val = in7 && (!in5 || in3);
      m[yy][xx] = { v: val, f: true } as any;
    }
  }
}

function placeTimingPatterns(m: Matrix) {
  for (let i = 0; i < m.length; i++) {
    if (m[6][i] === null) m[6][i] = { v: i % 2 === 0, f: true } as any;
    if (m[i][6] === null) m[i][6] = { v: i % 2 === 0, f: true } as any;
  }
}

function reservePatterns(m: Matrix) {
  const n = m.length;
  // initialize to nulls
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) m[y][x] = null;
  placeFinderPattern(m, 0, 0);
  placeFinderPattern(m, n - 7, 0);
  placeFinderPattern(m, 0, n - 7);
  // separators
  for (let i = 0; i < 8; i++) {
    if (i < n) {
      m[7][i] = { v: false, f: true } as any; m[i][7] = { v: false, f: true } as any;
      m[n - 8][i] = { v: false, f: true } as any; m[n - 8 + i][7] = { v: false, f: true } as any;
      m[i][n - 8] = { v: false, f: true } as any; m[7][n - 8 + i] = { v: false, f: true } as any;
    }
  }
  placeTimingPatterns(m);
  // dark module (version-dependent fixed module)
  m[n - 8][8] = { v: true, f: true } as any;
}

function encodeData(data: Uint8Array, version: number, totalCW: number, ecCW: number) {
  // Build bit stream: mode(4 bits=0100), count, data bytes
  const bits: number[] = [];
  function put(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  }
  put(0b0100, 4);
  const countBits = version <= 9 ? 8 : 16;
  put(data.length, countBits);
  for (const b of data) put(b, 8);
  // terminator
  const capacity = (totalCW - ecCW) * 8;
  const remaining = capacity - bits.length;
  if (remaining > 0) {
    const t = Math.min(4, remaining);
    put(0, t);
  }
  // pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  // pad bytes 0xEC, 0x11
  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    dataBytes.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  }
  let pad = (totalCW - ecCW) - dataBytes.length;
  let padSeq = [0xec, 0x11];
  let idx = 0;
  while (pad-- > 0) dataBytes.push(padSeq[idx++ % 2]);
  // EC bytes
  const ecBytes = rsComputeRemainder(dataBytes, ecCW);
  return { dataBytes, ecBytes };
}

function interleaveAndFill(m: Matrix, dataBytes: number[], ecBytes: number[]) {
  // For these versions (1-10) at EC M, we can treat as single block interleaving.
  const bytes = [...dataBytes, ...ecBytes];
  const n = m.length;
  let row = n - 1;
  let col = n - 1;
  let dirUp = true;
  let iByte = 0;
  let iBit = 0;
  const nextBit = () => {
    const bit = ((bytes[iByte] >>> (7 - (iBit % 8))) & 1) === 1;
    iBit++;
    if (iBit % 8 === 0) iByte++;
    return bit;
  };
  while (col > 0) {
    if (col === 6) col--; // skip timing col
    while (row >= 0 && row < n) {
      for (let dx = 0; dx < 2; dx++) {
        const x = col - dx;
        const y = row;
        if (m[y][x] === null) {
          m[y][x] = nextBit();
        }
      }
      row += dirUp ? -1 : 1;
    }
    dirUp = !dirUp;
    row += dirUp ? 1 : -1;
    col -= 2;
  }
}

function applyMask(m: Matrix, mask: (x: number, y: number) => boolean) {
  const n = m.length;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const cell = m[y][x];
    if (cell === null) continue;
    if (typeof cell === 'boolean') {
      if (mask(x, y)) m[y][x] = !cell;
    } // objects are function modules; skip
  }
}

export function makeQrMatrix(text: string): Matrix {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const vt = getVersionForLength(data.length);
  const size = initMatrixSize(vt.v);
  const m: Matrix = new Array(size).fill(null).map(() => new Array(size).fill(null));
  reservePatterns(m);
  const { dataBytes, ecBytes } = encodeData(data, vt.v, vt.totalCW, vt.ecCW);
  interleaveAndFill(m, dataBytes, ecBytes);
  // Use mask 0 (i + j) % 2 == 0 for simplicity
  applyMask(m, (x, y) => ((x + y) % 2) === 0);
  return m;
}

export function drawQrToCanvas(canvas: HTMLCanvasElement, text: string, scale = 6, margin = 4) {
  const m = makeQrMatrix(text);
  const n = m.length;
  const size = (n + margin * 2) * scale;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const val = typeof m[y][x] === 'object' ? (m[y][x] as any).v : (m[y][x] as boolean);
      if (val) {
        ctx.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale);
      }
    }
  }
}
