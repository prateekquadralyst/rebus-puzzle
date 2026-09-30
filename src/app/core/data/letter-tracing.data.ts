export interface StrokeDef {
  id: number;
  labelEn: string;
  labelHi: string;
  d: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  waypoints: { x: number; y: number }[];
  arrowAngle: number; // degrees
}

export interface TracingItem {
  id: string;
  category: 'alphabet' | 'number' | 'hindi';
  subCategory?: 'swar' | 'vyanjan';
  char: string;
  name: string;
  phonics: string;
  emoji: string;
  speechEn: string;
  speechHi: string;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
  strokes: StrokeDef[];
}

// -------------------------------------------------------------
// Mathematical interpolation helpers for smooth waypoints
// -------------------------------------------------------------
function makeLineStroke(
  id: number,
  labelEn: string,
  labelHi: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  steps = 20
): StrokeDef {
  const safeX2 = x1 === x2 ? x2 + 0.02 : x2;
  const safeY2 = y1 === y2 ? y2 + 0.02 : y2;
  const waypoints: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    waypoints.push({
      x: Math.round(x1 + (x2 - x1) * t),
      y: Math.round(y1 + (y2 - y1) * t)
    });
  }
  const angle = Math.round((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI);
  return {
    id,
    labelEn,
    labelHi,
    d: `M ${x1} ${y1} L ${safeX2} ${safeY2}`,
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    waypoints,
    arrowAngle: angle
  };
}

function makeQuadStroke(
  id: number,
  labelEn: string,
  labelHi: string,
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number,
  steps = 28
): StrokeDef {
  const waypoints: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    const x = inv * inv * x1 + 2 * inv * t * cx + t * t * x2;
    const y = inv * inv * y1 + 2 * inv * t * cy + t * t * y2;
    waypoints.push({ x: Math.round(x), y: Math.round(y) });
  }
  const initialAngle = Math.round((Math.atan2(cy - y1, cx - x1) * 180) / Math.PI);
  return {
    id,
    labelEn,
    labelHi,
    d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    waypoints,
    arrowAngle: initialAngle
  };
}

function makeCubicStroke(
  id: number,
  labelEn: string,
  labelHi: string,
  x1: number,
  y1: number,
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  x2: number,
  y2: number,
  steps = 35
): StrokeDef {
  const waypoints: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    const x =
      inv * inv * inv * x1 +
      3 * inv * inv * t * cx1 +
      3 * inv * t * t * cx2 +
      t * t * t * x2;
    const y =
      inv * inv * inv * y1 +
      3 * inv * inv * t * cy1 +
      3 * inv * t * t * cy2 +
      t * t * t * y2;
    waypoints.push({ x: Math.round(x), y: Math.round(y) });
  }
  const initialAngle = Math.round((Math.atan2(cy1 - y1, cx1 - x1) * 180) / Math.PI);
  return {
    id,
    labelEn,
    labelHi,
    d: `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`,
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    waypoints,
    arrowAngle: initialAngle
  };
}

function makePolyStroke(
  id: number,
  labelEn: string,
  labelHi: string,
  points: { x: number; y: number }[]
): StrokeDef {
  let d = `M ${points[0].x} ${points[0].y}`;
  const waypoints: { x: number; y: number }[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
    const pPrev = points[i - 1];
    const pCurr = points[i];
    for (let k = 1; k <= 8; k++) {
      waypoints.push({
        x: Math.round(pPrev.x + ((pCurr.x - pPrev.x) * k) / 8),
        y: Math.round(pPrev.y + ((pCurr.y - pPrev.y) * k) / 8)
      });
    }
  }
  const p0 = points[0];
  const p1 = points[1] || points[0];
  const angle = Math.round((Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI);
  return {
    id,
    labelEn,
    labelHi,
    d,
    start: { x: points[0].x, y: points[0].y },
    end: { x: points[points.length - 1].x, y: points[points.length - 1].y },
    waypoints,
    arrowAngle: angle
  };
}

function makeDotStroke(
  id: number,
  labelEn: string,
  labelHi: string,
  x: number,
  y: number
): StrokeDef {
  return {
    id,
    labelEn,
    labelHi,
    d: `M ${x} ${y} m -0.1 0 a 0.1 0.1 0 1 0 0.2 0 a 0.1 0.1 0 1 0 -0.2 0`,
    start: { x, y },
    end: { x, y },
    waypoints: [{ x, y }],
    arrowAngle: 0
  };
}

interface CubicSegment {
  cx1: number;
  cy1: number;
  cx2: number;
  cy2: number;
  x2: number;
  y2: number;
}

function makeMultiCubicStroke(
  id: number,
  labelEn: string,
  labelHi: string,
  startX: number,
  startY: number,
  segments: CubicSegment[],
  stepsPerSegment = 20
): StrokeDef {
  let d = `M ${startX} ${startY}`;
  const waypoints: { x: number; y: number }[] = [{ x: startX, y: startY }];
  let curX = startX;
  let curY = startY;

  for (const seg of segments) {
    d += ` C ${seg.cx1} ${seg.cy1} ${seg.cx2} ${seg.cy2} ${seg.x2} ${seg.y2}`;
    for (let i = 1; i <= stepsPerSegment; i++) {
      const t = i / stepsPerSegment;
      const inv = 1 - t;
      const x =
        inv * inv * inv * curX +
        3 * inv * inv * t * seg.cx1 +
        3 * inv * t * t * seg.cx2 +
        t * t * t * seg.x2;
      const y =
        inv * inv * inv * curY +
        3 * inv * inv * t * seg.cy1 +
        3 * inv * t * t * seg.cy2 +
        t * t * t * seg.y2;
      waypoints.push({ x: Math.round(x), y: Math.round(y) });
    }
    curX = seg.x2;
    curY = seg.y2;
  }

  const p0 = { x: startX, y: startY };
  const p1 = segments.length > 0 ? { x: segments[0].cx1, y: segments[0].cy1 } : p0;
  const initialAngle = Math.round((Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI);

  return {
    id,
    labelEn,
    labelHi,
    d,
    start: { x: startX, y: startY },
    end: { x: curX, y: curY },
    waypoints,
    arrowAngle: initialAngle
  };
}

export function getStrokePoint(stroke: StrokeDef, t: number): { x: number; y: number } {
  const wps = stroke.waypoints;
  if (!wps || wps.length === 0) return stroke.start;
  const clampedT = Math.max(0, Math.min(1, t));
  if (clampedT <= 0) return wps[0];
  if (clampedT >= 1) return wps[wps.length - 1];

  const idx = clampedT * (wps.length - 1);
  const base = Math.floor(idx);
  const frac = idx - base;
  const p1 = wps[base];
  const p2 = wps[Math.min(wps.length - 1, base + 1)];
  return {
    x: Math.round(p1.x + (p2.x - p1.x) * frac),
    y: Math.round(p1.y + (p2.y - p1.y) * frac)
  };
}

export function getPartialPathD(stroke: StrokeDef, t: number): string {
  const wps = stroke.waypoints;
  if (!wps || wps.length === 0) return stroke.d || 'M 0 0';
  const clampedT = Math.max(0, Math.min(1, t));
  if (clampedT <= 0) return `M ${wps[0].x} ${wps[0].y}`;
  if (clampedT >= 1) return stroke.d;

  const targetIdx = Math.floor(clampedT * (wps.length - 1));
  let d = `M ${wps[0].x} ${wps[0].y}`;
  for (let i = 1; i <= targetIdx; i++) {
    d += ` L ${wps[i].x} ${wps[i].y}`;
  }
  const currPt = getStrokePoint(stroke, clampedT);
  d += ` L ${currPt.x} ${currPt.y}`;
  return d;
}

// -------------------------------------------------------------
// 🔤 1. ENGLISH ALPHABET (A TO Z - CAPITAL LETTERS)
// -------------------------------------------------------------
export const ALPHABET_ITEMS: TracingItem[] = [
  {
    id: 'A',
    category: 'alphabet',
    char: 'A',
    name: 'Apple',
    phonics: 'ऐ (a)',
    emoji: '🍎',
    speechEn: 'A for Apple! Slanted line down, slanted line down, sleep line across!',
    speechHi: 'ए फॉर एप्पल! पहले तिरछी लाइन, फिर दूसरी तिरछी लाइन, फिर बीच में लाइन!',
    bgGradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
    borderColor: '#fda4af',
    shadowColor: 'rgba(244, 63, 94, 0.4)',
    strokes: [
      makeLineStroke(1, 'Slanted line down left', 'ऊपर से बाईं ओर तिरछी लाइन खींचो', 100, 35, 45, 165),
      makeLineStroke(2, 'Slanted line down right', 'ऊपर से दाईं ओर तिरछी लाइन खींचो', 100, 35, 155, 165),
      makeLineStroke(3, 'Sleeping line across', 'बीच में लेटी हुई लाइन खींचो', 70, 115, 130, 115)
    ]
  },
  {
    id: 'B',
    category: 'alphabet',
    char: 'B',
    name: 'Ball',
    phonics: 'ब (b)',
    emoji: '⚽',
    speechEn: 'B for Ball! Standing line down, top curve, bottom curve!',
    speechHi: 'बी फॉर बॉल! सीधी खड़ी लाइन, ऊपर का घुमाव, नीचे का घुमाव!',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
    borderColor: '#7dd3fc',
    shadowColor: 'rgba(2, 132, 199, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing line down', 'सीधी खड़ी लाइन नीचे खींचो', 60, 35, 60, 165),
      makeCubicStroke(2, 'Top round curve', 'ऊपर का गोल घुमाव बनाओ', 60, 35, 155, 35, 155, 100, 60, 100),
      makeCubicStroke(3, 'Bottom round curve', 'नीचे का गोल घुमाव बनाओ', 60, 100, 165, 100, 165, 165, 60, 165)
    ]
  },
  {
    id: 'C',
    category: 'alphabet',
    char: 'C',
    name: 'Cat',
    phonics: 'क (k)',
    emoji: '🐱',
    speechEn: 'C for Cat! Big curve around to the left!',
    speechHi: 'सी फॉर कैट! ऊपर से बाईं तरफ बड़ा गोल घुमाव!',
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    borderColor: '#fde68a',
    shadowColor: 'rgba(245, 158, 11, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Big round curve', 'ऊपर से गोल घुमाते हुए नीचे लाओ', 150, 55, 55, 35, 55, 165, 150, 145)
    ]
  },
  {
    id: 'D',
    category: 'alphabet',
    char: 'D',
    name: 'Duck',
    phonics: 'ड (d)',
    emoji: '🦆',
    speechEn: 'D for Duck! Standing line down, and a giant belly curve!',
    speechHi: 'डी फॉर डक! सीधी खड़ी लाइन, और एक बड़ा गोल पेट!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#6ee7b7',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing line down', 'सीधी खड़ी लाइन खींचो', 60, 35, 60, 165),
      makeCubicStroke(2, 'Giant round curve', 'ऊपर से नीचे तक बड़ा गोल घेरा बनाओ', 60, 35, 175, 45, 175, 155, 60, 165)
    ]
  },
  {
    id: 'E',
    category: 'alphabet',
    char: 'E',
    name: 'Elephant',
    phonics: 'ए (e)',
    emoji: '🐘',
    speechEn: 'E for Elephant! Standing line, top bar, middle bar, bottom bar!',
    speechHi: 'ई फॉर एलिफेंट! सीधी लाइन, ऊपर लाइन, बीच में लाइन, नीचे लाइन!',
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    borderColor: '#c4b5fd',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing line down', 'सीधी खड़ी लाइन', 60, 35, 60, 165),
      makeLineStroke(2, 'Top bar across', 'ऊपर लेटी लाइन', 60, 35, 150, 35),
      makeLineStroke(3, 'Middle bar across', 'बीच की लेटी लाइन', 60, 100, 135, 100),
      makeLineStroke(4, 'Bottom bar across', 'नीचे की लेटी लाइन', 60, 165, 150, 165)
    ]
  },
  {
    id: 'F',
    category: 'alphabet',
    char: 'F',
    name: 'Fish',
    phonics: 'फ (f)',
    emoji: '🐟',
    speechEn: 'F for Fish! Straight down, top line, middle line!',
    speechHi: 'एफ फॉर फिश! सीधी लाइन, ऊपर लाइन, बीच में लाइन!',
    bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    borderColor: '#a5f3fc',
    shadowColor: 'rgba(6, 182, 212, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing line down', 'सीधी खड़ी लाइन', 60, 35, 60, 165),
      makeLineStroke(2, 'Top bar across', 'ऊपर लेटी लाइन', 60, 35, 150, 35),
      makeLineStroke(3, 'Middle bar across', 'बीच की लेटी लाइन', 60, 100, 130, 100)
    ]
  },
  {
    id: 'G',
    category: 'alphabet',
    char: 'G',
    name: 'Giraffe',
    phonics: 'ग (g)',
    emoji: '🦒',
    speechEn: 'G for Giraffe! Big curve around and step inside!',
    speechHi: 'जी फॉर जिराफ! बड़ा गोल घुमाव और अंदर लेटी लाइन!',
    bgGradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    borderColor: '#fef08a',
    shadowColor: 'rgba(234, 179, 8, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Big round curve', 'बड़ा गोल घुमाव', 150, 55, 55, 35, 55, 165, 145, 130),
      makeLineStroke(2, 'Line inside', 'अंदर की ओर लाइन', 145, 130, 105, 130)
    ]
  },
  {
    id: 'H',
    category: 'alphabet',
    char: 'H',
    name: 'Horse',
    phonics: 'ह (h)',
    emoji: '🐴',
    speechEn: 'H for Horse! Two tall trees, connected with a bridge!',
    speechHi: 'एच फॉर हॉर्स! दो सीधी लाइनें और बीच में पुल!',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    borderColor: '#fbcfe8',
    shadowColor: 'rgba(236, 72, 153, 0.4)',
    strokes: [
      makeLineStroke(1, 'Left vertical line', 'बाईं सीधी लाइन', 60, 35, 60, 165),
      makeLineStroke(2, 'Right vertical line', 'दाईं सीधी लाइन', 140, 35, 140, 165),
      makeLineStroke(3, 'Bridge line across', 'बीच की जोड़ने वाली लाइन', 60, 100, 140, 100)
    ]
  },
  {
    id: 'I',
    category: 'alphabet',
    char: 'I',
    name: 'Ice Cream',
    phonics: 'इ (i)',
    emoji: '🍦',
    speechEn: 'I for Ice Cream! Straight tall pillar with a cap and shoes!',
    speechHi: 'आई फॉर आइसक्रीम! सीधी खड़ी लाइन, ऊपर टोपी, नीचे जूते!',
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderColor: '#bfdbfe',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    strokes: [
      makeLineStroke(1, 'Tall vertical line', 'सीधी खड़ी लाइन', 100, 35, 100, 165),
      makeLineStroke(2, 'Top cap bar', 'ऊपर की छोटी लाइन', 65, 35, 135, 35),
      makeLineStroke(3, 'Bottom shoes bar', 'नीचे की छोटी लाइन', 65, 165, 135, 165)
    ]
  },
  {
    id: 'J',
    category: 'alphabet',
    char: 'J',
    name: 'Jug',
    phonics: 'ज (j)',
    emoji: '🧃',
    speechEn: 'J for Jug! Top roof, and an umbrella hook down!',
    speechHi: 'जे फॉर जग! ऊपर छत, और नीचे छाते का हुक!',
    bgGradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    borderColor: '#99f6e4',
    shadowColor: 'rgba(20, 184, 166, 0.4)',
    strokes: [
      makeLineStroke(1, 'Top roof bar', 'ऊपर की छत लाइन', 70, 35, 150, 35),
      makeCubicStroke(2, 'Umbrella hook curve', 'सीधे नीचे आकर छाते जैसा घुमाओ', 130, 35, 130, 140, 60, 165, 60, 125)
    ]
  },
  {
    id: 'K',
    category: 'alphabet',
    char: 'K',
    name: 'Kite',
    phonics: 'क (k)',
    emoji: '🪁',
    speechEn: 'K for Kite! Straight line, kick in, kick out!',
    speechHi: 'के फॉर काइट! सीधी लाइन, ऊपर से तिरछी किक, नीचे तिरछी किक!',
    bgGradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    borderColor: '#e9d5ff',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing line down', 'सीधी खड़ी लाइन', 60, 35, 60, 165),
      makeLineStroke(2, 'Slant kick into center', 'ऊपर से बीच में तिरछी लाइन', 145, 40, 60, 105),
      makeLineStroke(3, 'Slant kick down out', 'बीच से नीचे दाईं ओर तिरछी लाइन', 60, 105, 145, 165)
    ]
  },
  {
    id: 'L',
    category: 'alphabet',
    char: 'L',
    name: 'Lion',
    phonics: 'ल (l)',
    emoji: '🦁',
    speechEn: 'L for Lion! Down straight and sleep to the right!',
    speechHi: 'एल फॉर लायन! ऊपर से नीचे, फिर दाईं ओर लेटी लाइन!',
    bgGradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    borderColor: '#fed7aa',
    shadowColor: 'rgba(249, 115, 22, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing line down', 'सीधी लाइन नीचे खींचो', 65, 35, 65, 165),
      makeLineStroke(2, 'Base line to the right', 'नीचे से दाईं ओर लाइन खींचो', 65, 165, 145, 165)
    ]
  },
  {
    id: 'M',
    category: 'alphabet',
    char: 'M',
    name: 'Monkey',
    phonics: 'म (m)',
    emoji: '🐵',
    speechEn: 'M for Monkey! Down, climb down, climb up, straight down!',
    speechHi: 'एम फॉर मंकी! सीधी लाइन, पहाड़ की घाटी नीचे, ऊपर, फिर नीचे!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeLineStroke(1, 'Left straight down', 'बाईं सीधी लाइन नीचे', 45, 35, 45, 165),
      makeLineStroke(2, 'Slant down to middle', 'बीच में नीचे तिरछी लाइन', 45, 35, 100, 130),
      makeLineStroke(3, 'Slant up to top right', 'ऊपर दाईं ओर तिरछी लाइन', 100, 130, 155, 35),
      makeLineStroke(4, 'Right straight down', 'दाईं सीधी लाइन नीचे', 155, 35, 155, 165)
    ]
  },
  {
    id: 'N',
    category: 'alphabet',
    char: 'N',
    name: 'Nest',
    phonics: 'न (n)',
    emoji: '🪺',
    speechEn: 'N for Nest! Down, slide across, straight down!',
    speechHi: 'एन फॉर नेस्ट! सीधी लाइन, फिसलपट्टी तिरछी लाइन, फिर सीधी लाइन!',
    bgGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    borderColor: '#bae6fd',
    shadowColor: 'rgba(14, 165, 233, 0.4)',
    strokes: [
      makeLineStroke(1, 'Left straight down', 'बाईं सीधी लाइन', 55, 35, 55, 165),
      makeLineStroke(2, 'Slanted slide down', 'तिरछी फिसलपट्टी नीचे', 55, 35, 145, 165),
      makeLineStroke(3, 'Right line straight down', 'दाईं सीधी लाइन', 145, 35, 145, 165)
    ]
  },
  {
    id: 'O',
    category: 'alphabet',
    char: 'O',
    name: 'Orange',
    phonics: 'ऑ (o)',
    emoji: '🍊',
    speechEn: 'O for Orange! Round and round like a yummy donut!',
    speechHi: 'ओ फॉर ऑरेंज! गोल-मटोल पूरा घेरा बनाओ!',
    bgGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    borderColor: '#ffedd5',
    shadowColor: 'rgba(249, 115, 22, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Left round half', 'बायां गोल घेरा', 100, 35, 40, 35, 40, 165, 100, 165),
      makeCubicStroke(2, 'Right round half', 'दायां गोल घेरा पूरा करो', 100, 165, 160, 165, 160, 35, 100, 35)
    ]
  },
  {
    id: 'P',
    category: 'alphabet',
    char: 'P',
    name: 'Pencil',
    phonics: 'प (p)',
    emoji: '✏️',
    speechEn: 'P for Pencil! Straight down, and a round head!',
    speechHi: 'पी फॉर पेंसिल! सीधी लाइन, और ऊपर गोल सिर!',
    bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    borderColor: '#c7d2fe',
    shadowColor: 'rgba(99, 102, 241, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing line down', 'सीधी लाइन नीचे', 60, 35, 60, 165),
      makeCubicStroke(2, 'Top round head', 'ऊपर का गोल सिर बनाओ', 60, 35, 165, 35, 165, 105, 60, 105)
    ]
  },
  {
    id: 'Q',
    category: 'alphabet',
    char: 'Q',
    name: 'Queen',
    phonics: 'क्व (q)',
    emoji: '👑',
    speechEn: 'Q for Queen! Big round circle with a little crown tail!',
    speechHi: 'क्यू फॉर क्वीन! गोल घेरा और नीचे छोटी पूंछ!',
    bgGradient: 'linear-gradient(135deg, #d946ef 0%, #a21caf 100%)',
    borderColor: '#f5d0fe',
    shadowColor: 'rgba(217, 70, 239, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Left round half', 'बायां गोल घेरा', 100, 35, 40, 35, 40, 165, 100, 165),
      makeCubicStroke(2, 'Right round half', 'दायां गोल घेरा', 100, 165, 160, 165, 160, 35, 100, 35),
      makeLineStroke(3, 'Little tail slant', 'नीचे छोटी पूंछ', 115, 130, 160, 175)
    ]
  },
  {
    id: 'R',
    category: 'alphabet',
    char: 'R',
    name: 'Rainbow',
    phonics: 'र (r)',
    emoji: '🌈',
    speechEn: 'R for Rainbow! Straight line, round belly, and slide down!',
    speechHi: 'आर फॉर रेनबो! सीधी लाइन, गोल घेरा, और नीचे फिसलपट्टी!',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    borderColor: '#fbcfe8',
    shadowColor: 'rgba(236, 72, 153, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing line down', 'सीधी लाइन नीचे', 60, 35, 60, 165),
      makeCubicStroke(2, 'Top round loop', 'ऊपर का गोल घेरा', 60, 35, 160, 35, 160, 105, 60, 105),
      makeLineStroke(3, 'Slide leg down', 'नीचे दाईं ओर तिरछी लाइन', 60, 105, 150, 165)
    ]
  },
  {
    id: 'S',
    category: 'alphabet',
    char: 'S',
    name: 'Sun',
    phonics: 'स (s)',
    emoji: '☀️',
    speechEn: 'S for Sun! Curve left, twist right, twist around like a snake!',
    speechHi: 'एस फॉर सन! सांप की तरह लहराता हुआ एस बनाओ!',
    bgGradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    borderColor: '#fef08a',
    shadowColor: 'rgba(234, 179, 8, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Snake S curve', 'सांप की तरह ऊपर से नीचे लहराओ', 145, 55, 50, 30, 150, 110, 100, 105),
      makeCubicStroke(2, 'Bottom curve', 'नीचे से घुमाते हुए बाईं ओर लाओ', 100, 105, 50, 100, 145, 175, 55, 150)
    ]
  },
  {
    id: 'T',
    category: 'alphabet',
    char: 'T',
    name: 'Train',
    phonics: 'ट (t)',
    emoji: '🚂',
    speechEn: 'T for Train! Top roof bar, and straight stem down!',
    speechHi: 'टी फॉर ट्रेन! ऊपर सीधी लेटी लाइन, और बीच में खड़ी लाइन!',
    bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    borderColor: '#a5f3fc',
    shadowColor: 'rgba(6, 182, 212, 0.4)',
    strokes: [
      makeLineStroke(1, 'Top roof bar across', 'ऊपर लेटी लाइन', 50, 40, 150, 40),
      makeLineStroke(2, 'Center standing stem', 'बीच में सीधी खड़ी लाइन', 100, 40, 100, 165)
    ]
  },
  {
    id: 'U',
    category: 'alphabet',
    char: 'U',
    name: 'Umbrella',
    phonics: 'अ (u)',
    emoji: '☂️',
    speechEn: 'U for Umbrella! Down, scoop up like a smiley bowl!',
    speechHi: 'यू फॉर अम्ब्रेला! मुस्कुराते हुए कटोरे जैसा यू बनाओ!',
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    borderColor: '#ddd6fe',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    strokes: [
      makeCubicStroke(1, 'U smiley curve', 'नीचे आकर गोल कटोरे जैसा ऊपर जाओ', 60, 40, 50, 175, 150, 175, 140, 40)
    ]
  },
  {
    id: 'V',
    category: 'alphabet',
    char: 'V',
    name: 'Violin',
    phonics: 'व (v)',
    emoji: '🎻',
    speechEn: 'V for Violin! Slant down, bounce up!',
    speechHi: 'वी फॉर वॉयलिन! नीचे तिरछी लाइन, फिर ऊपर उछल जाओ!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeLineStroke(1, 'Slant down to bottom', 'नीचे बिंदु तक तिरछी लाइन', 55, 40, 100, 165),
      makeLineStroke(2, 'Slant up to top right', 'ऊपर दाईं ओर तिरछी लाइन', 100, 165, 145, 40)
    ]
  },
  {
    id: 'W',
    category: 'alphabet',
    char: 'W',
    name: 'Watermelon',
    phonics: 'व (w)',
    emoji: '🍉',
    speechEn: 'W for Watermelon! Down, up, down, up like roller coaster!',
    speechHi: 'डब्ल्यू फॉर तरबूज! झूले की तरह नीचे, ऊपर, नीचे, ऊपर!',
    bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    borderColor: '#fca5a5',
    shadowColor: 'rgba(239, 68, 68, 0.4)',
    strokes: [
      makeLineStroke(1, 'Down slant 1', 'नीचे तिरछी लाइन', 40, 40, 65, 165),
      makeLineStroke(2, 'Up slant 1', 'ऊपर बीच में लाइन', 65, 165, 100, 85),
      makeLineStroke(3, 'Down slant 2', 'नीचे फिर से लाइन', 100, 85, 135, 165),
      makeLineStroke(4, 'Up slant 2', 'ऊपर दाईं ओर लाइन', 135, 165, 160, 40)
    ]
  },
  {
    id: 'X',
    category: 'alphabet',
    char: 'X',
    name: 'Xylophone',
    phonics: 'क्स (x)',
    emoji: '🎵',
    speechEn: 'X for Xylophone! Cross one, cross two in the middle!',
    speechHi: 'एक्स फॉर ज़ाइलोफोन! एक तिरछी लाइन, दूसरी काटती हुई लाइन!',
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    borderColor: '#bfdbfe',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    strokes: [
      makeLineStroke(1, 'Diagonal top-left to bottom-right', 'बाएं से दाएं तिरछी लाइन', 55, 40, 145, 165),
      makeLineStroke(2, 'Diagonal top-right to bottom-left', 'दाएं से बाएं काटती लाइन', 145, 40, 55, 165)
    ]
  },
  {
    id: 'Y',
    category: 'alphabet',
    char: 'Y',
    name: 'Yo-yo',
    phonics: 'य (y)',
    emoji: '🪀',
    speechEn: 'Y for Yo-Yo! Slant left, slant right, and stand tall!',
    speechHi: 'वाई फॉर यो-यो! छोटी वी बनाओ और नीचे डंडी लगाओ!',
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    borderColor: '#fde68a',
    shadowColor: 'rgba(245, 158, 11, 0.4)',
    strokes: [
      makeLineStroke(1, 'Short slant left to middle', 'बाईं ओर से बीच में लाइन', 55, 40, 100, 105),
      makeLineStroke(2, 'Short slant right to middle', 'दाईं ओर से बीच में लाइन', 145, 40, 100, 105),
      makeLineStroke(3, 'Vertical stem down', 'बीच से नीचे सीधी लाइन', 100, 105, 100, 165)
    ]
  },
  {
    id: 'Z',
    category: 'alphabet',
    char: 'Z',
    name: 'Zebra',
    phonics: 'ज़ (z)',
    emoji: '🦓',
    speechEn: 'Z for Zebra! Top line, slide down, bottom line!',
    speechHi: 'ज़ेड फॉर ज़ेब्रा! ऊपर लाइन, तिरछी लाइन, फिर नीचे लाइन!',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(5, 150, 105, 0.4)',
    strokes: [
      makeLineStroke(1, 'Top line across', 'ऊपर लेटी लाइन', 55, 40, 145, 40),
      makeLineStroke(2, 'Slanted slide down', 'नीचे बाईं ओर तिरछी लाइन', 145, 40, 55, 165),
      makeLineStroke(3, 'Bottom line across', 'नीचे दाईं ओर लेटी लाइन', 55, 165, 145, 165)
    ]
  }
];

// -------------------------------------------------------------
// 🔢 2. NUMBERS (0 TO 10)
// -------------------------------------------------------------
export const NUMBER_ITEMS: TracingItem[] = [
  {
    id: '0',
    category: 'number',
    char: '0',
    name: 'Zero',
    phonics: 'शून्य (Zero)',
    emoji: '⭕',
    speechEn: 'Number 0! Big oval loop all the way around!',
    speechHi: 'नंबर शून्य (0)! गोल मटोल पूरा अंडाकार घेरा!',
    bgGradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
    borderColor: '#cbd5e1',
    shadowColor: 'rgba(100, 116, 139, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Left curve around', 'बायां घेरा नीचे तक', 100, 35, 40, 35, 40, 165, 100, 165),
      makeCubicStroke(2, 'Right curve around', 'दायां घेरा ऊपर तक', 100, 165, 160, 165, 160, 35, 100, 35)
    ]
  },
  {
    id: '1',
    category: 'number',
    char: '1',
    name: 'One',
    phonics: 'एक (One)',
    emoji: '☀️',
    speechEn: 'Number 1! Little beak up, straight line down, and a base!',
    speechHi: 'नंबर 1! छोटी तिरछी चोंच, सीधी खड़ी लाइन और नीचे आधार!',
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    borderColor: '#fde68a',
    shadowColor: 'rgba(245, 158, 11, 0.4)',
    strokes: [
      makeLineStroke(1, 'Little beak up', 'ऊपर छोटी तिरछी लाइन', 70, 70, 100, 40),
      makeLineStroke(2, 'Straight down stem', 'सीधी खड़ी लाइन नीचे', 100, 40, 100, 165),
      makeLineStroke(3, 'Base floor line', 'नीचे का आधार', 65, 165, 135, 165)
    ]
  },
  {
    id: '2',
    category: 'number',
    char: '2',
    name: 'Two',
    phonics: 'दो (Two)',
    emoji: '🦆🦆',
    speechEn: 'Number 2! Round rainbow hook, slide down, and sleeping line!',
    speechHi: 'नंबर 2! बत्तख जैसा घुमावदार सिर, नीचे फिसलपट्टी, और लेटी लाइन!',
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderColor: '#bfdbfe',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Duck head and slide down', 'गोल सिर और नीचे तिरछी लाइन', 65, 75, 70, 35, 150, 45, 60, 165),
      makeLineStroke(2, 'Base line to the right', 'नीचे दाईं ओर सीधी लाइन', 60, 165, 145, 165)
    ]
  },
  {
    id: '3',
    category: 'number',
    char: '3',
    name: 'Three',
    phonics: 'तीन (Three)',
    emoji: '⭐🌟✨',
    speechEn: 'Number 3! Curve in to the middle, curve out and around!',
    speechHi: 'नंबर 3! ऊपर का घुमाव, फिर नीचे का बड़ा घुमाव!',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    borderColor: '#fbcfe8',
    shadowColor: 'rgba(236, 72, 153, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top bump curve', 'ऊपर का गोल घुमाव', 65, 55, 90, 35, 145, 45, 100, 100),
      makeCubicStroke(2, 'Bottom bump curve', 'नीचे का गोल घुमाव', 100, 100, 155, 105, 145, 165, 65, 155)
    ]
  },
  {
    id: '4',
    category: 'number',
    char: '4',
    name: 'Four',
    phonics: 'चार (Four)',
    emoji: '🎈🎈🎈🎈',
    speechEn: 'Number 4! Down, across, and slice right through!',
    speechHi: 'नंबर 4! नीचे, लेटी लाइन, और ऊपर से नीचे काटती लाइन!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeLineStroke(1, 'Slant down to middle', 'नीचे बाईं ओर लाइन', 125, 35, 55, 115),
      makeLineStroke(2, 'Horizontal bar across', 'दाईं ओर लेटी लाइन', 55, 115, 155, 115),
      makeLineStroke(3, 'Straight slice down', 'ऊपर से नीचे सीधी लाइन', 125, 35, 125, 165)
    ]
  },
  {
    id: '5',
    category: 'number',
    char: '5',
    name: 'Five',
    phonics: 'पाँच (Five)',
    emoji: '🖐️',
    speechEn: 'Number 5! Little neck down, fat tummy, and a cap on top!',
    speechHi: 'नंबर 5! छोटी गर्दन, मोटा पेट, और ऊपर सुंदर टोपी!',
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    borderColor: '#ddd6fe',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    strokes: [
      makeLineStroke(1, 'Short neck down', 'छोटी गर्दन नीचे लाओ', 75, 40, 75, 95),
      makeCubicStroke(2, 'Big round tummy', 'मोटा गोल पेट बनाओ', 75, 95, 165, 95, 160, 165, 65, 155),
      makeLineStroke(3, 'Cap on top', 'ऊपर की टोपी लाइन', 75, 40, 140, 40)
    ]
  },
  {
    id: '6',
    category: 'number',
    char: '6',
    name: 'Six',
    phonics: 'छह (Six)',
    emoji: '🎲🎲🎲',
    speechEn: 'Number 6! Slide down and loop into a secret bubble!',
    speechHi: 'नंबर 6! ऊपर से घूमकर नीचे गोल छल्ला बनाओ!',
    bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    borderColor: '#a5f3fc',
    shadowColor: 'rgba(6, 182, 212, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Curve down to bottom', 'ऊपर से गोल घूमकर नीचे लाओ', 135, 45, 60, 45, 50, 165, 100, 165),
      makeCubicStroke(2, 'Close bottom loop', 'नीचे का गोल छल्ला बंद करो', 100, 165, 155, 165, 150, 105, 75, 110)
    ]
  },
  {
    id: '7',
    category: 'number',
    char: '7',
    name: 'Seven',
    phonics: 'सात (Seven)',
    emoji: '🌈🌈🌈',
    speechEn: 'Number 7! Slide across the top, and slant down like lightning!',
    speechHi: 'नंबर 7! ऊपर लेटी लाइन, फिर बिजली की तरह तिरछी लाइन!',
    bgGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    borderColor: '#ffedd5',
    shadowColor: 'rgba(249, 115, 22, 0.4)',
    strokes: [
      makeLineStroke(1, 'Top line across', 'ऊपर लेटी लाइन', 55, 40, 145, 40),
      makeLineStroke(2, 'Slanted line down', 'नीचे बाईं ओर तिरछी लाइन', 145, 40, 80, 165)
    ]
  },
  {
    id: '8',
    category: 'number',
    char: '8',
    name: 'Eight',
    phonics: 'आठ (Eight)',
    emoji: '🐙',
    speechEn: 'Number 8! Make an S and climb back home!',
    speechHi: 'नंबर 8! एस बनाओ और वापस ऊपर मिला दो!',
    bgGradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    borderColor: '#f3e8ff',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top loop S', 'ऊपर का गोल घुमाव', 100, 35, 55, 35, 55, 100, 100, 100),
      makeCubicStroke(2, 'Bottom loop S', 'नीचे का गोल घुमाव', 100, 100, 155, 100, 155, 165, 100, 165),
      makeCubicStroke(3, 'Return climb up', 'वापस ऊपर जाकर मिला दो', 100, 165, 45, 165, 155, 35, 100, 35)
    ]
  },
  {
    id: '9',
    category: 'number',
    char: '9',
    name: 'Nine',
    phonics: 'नौ (Nine)',
    emoji: '🎈',
    speechEn: 'Number 9! Balloon on a stick, straight down!',
    speechHi: 'नंबर 9! ऊपर गोल गुब्बारा, और नीचे डंडी!',
    bgGradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    borderColor: '#fca5a5',
    shadowColor: 'rgba(239, 68, 68, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top circle balloon', 'ऊपर गोल गुब्बारा बनाओ', 135, 95, 135, 35, 60, 35, 60, 95),
      makeCubicStroke(2, 'Close balloon and go down', 'गुब्बारा बंद करके नीचे लाइन खींचो', 60, 95, 70, 105, 135, 105, 135, 45),
      makeLineStroke(3, 'Straight stem down', 'दाईं ओर से सीधी नीचे लाइन', 135, 45, 135, 165)
    ]
  },
  {
    id: '10',
    category: 'number',
    char: '10',
    name: 'Ten',
    phonics: 'दस (Ten)',
    emoji: '🔟',
    speechEn: 'Number 10! Number 1 and round donut 0 side by side!',
    speechHi: 'नंबर 10! एक (1) और शून्य (0) दोनों मिलकर बने दस!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeLineStroke(1, 'One beak', '1 की चोंच', 45, 65, 65, 40),
      makeLineStroke(2, 'One stem', '1 की सीधी लाइन', 65, 40, 65, 165),
      makeCubicStroke(3, 'Zero left half', '0 का बायां घेरा', 135, 40, 95, 40, 95, 165, 135, 165),
      makeCubicStroke(4, 'Zero right half', '0 का दायां घेरा पूरा करो', 135, 165, 175, 165, 175, 40, 135, 40)
    ]
  }
];

// -------------------------------------------------------------
// 🕉️ 3. HINDI VARNAMALA (SWAR: अ to अः + VYANJAN: क to ज्ञ)
// -------------------------------------------------------------
export const HINDI_ITEMS: TracingItem[] = [
  // --- SWAR (स्वर - 13) ---
  {
    id: 'hi_a',
    category: 'hindi',
    subCategory: 'swar',
    char: 'अ',
    name: 'अनार',
    phonics: 'अ (a)',
    emoji: '🍎',
    speechEn: 'अ से अनार! Top curve, bottom curve, middle bar, standing line and roof!',
    speechHi: 'अ से अनार! ऊपर का घुमाव, नीचे का घुमाव, बीच की रेखा, खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    borderColor: '#fca5a5',
    shadowColor: 'rgba(220, 38, 38, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'पहला कदम: ऊपर का तीन जैसा घुमाव', 60, 65, 85, 45, 100, 75, 75, 100),
      makeCubicStroke(2, 'Bottom curve with tail', 'दूसरा कदम: नीचे का घुमाव पूंछ के साथ', 75, 100, 115, 125, 75, 165, 45, 155),
      makeLineStroke(3, 'Middle connector bar', 'तीसरा कदम: बीच की छोटी लेटी लाइन', 75, 105, 125, 105),
      makeLineStroke(4, 'Vertical standing line', 'चौथा कदम: सीधी खड़ी पाई नीचे', 125, 45, 125, 165),
      makeLineStroke(5, 'Shirorekha top roof', 'पाँचवाँ कदम: ऊपर की शिरोरेखा (छत)', 105, 45, 155, 45)
    ]
  },
  {
    id: 'hi_aa',
    category: 'hindi',
    subCategory: 'swar',
    char: 'आ',
    name: 'आम',
    phonics: 'आ (aa)',
    emoji: '🥭',
    speechEn: 'आ से आम! Write अ with another vertical line!',
    speechHi: 'आ से आम! अ बनाओ, एक और डंडा लगाओ और शिरोरेखा खींचो!',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    borderColor: '#fed7aa',
    shadowColor: 'rgba(234, 88, 12, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'ऊपर का घुमाव', 50, 65, 75, 45, 90, 75, 65, 100),
      makeCubicStroke(2, 'Bottom curve with tail', 'नीचे का घुमाव', 65, 100, 105, 125, 65, 165, 38, 155),
      makeLineStroke(3, 'Middle connector bar', 'बीच की जोड़ने वाली लाइन', 65, 105, 115, 105),
      makeLineStroke(4, 'First vertical line', 'पहली खड़ी पाई', 115, 45, 115, 165),
      makeLineStroke(5, 'Second vertical line', 'दूसरी खड़ी पाई', 145, 45, 145, 165),
      makeLineStroke(6, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 95, 45, 165, 45)
    ]
  },
  {
    id: 'hi_i',
    category: 'hindi',
    subCategory: 'swar',
    char: 'इ',
    name: 'इमली',
    phonics: 'इ (i)',
    emoji: '🍂',
    speechEn: 'इ से इमली! Little top line, snake S body, tail, and roof!',
    speechHi: 'इ से इमली! छोटी गर्दन, एस जैसा घुमाव, नीचे पूंछ और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #ca8a04 0%, #854d0e 100%)',
    borderColor: '#fef08a',
    shadowColor: 'rgba(202, 138, 4, 0.4)',
    strokes: [
      makeLineStroke(1, 'Tiny top vertical stem', 'ऊपर छोटी गर्दन', 100, 45, 100, 65),
      makeMultiCubicStroke(2, 'S curve body', 'एस जैसा लहराता घुमाव', 100, 65, [
        { cx1: 65, cy1: 75, cx2: 65, cy2: 100, x2: 100, y2: 105 },
        { cx1: 135, cy1: 110, cx2: 135, cy2: 135, x2: 100, y2: 145 }
      ]),
      makeMultiCubicStroke(3, 'Bottom loop tail', 'नीचे गोल घुमाकर पूंछ निकालो', 100, 145, [
        { cx1: 120, cy1: 152, cx2: 105, cy2: 165, x2: 90, y2: 158 },
        { cx1: 80, cy1: 154, cx2: 65, cy2: 165, x2: 55, y2: 175 }
      ]),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 60, 45, 140, 45)
    ]
  },
  {
    id: 'hi_ee',
    category: 'hindi',
    subCategory: 'swar',
    char: 'ई',
    name: 'ईख',
    phonics: 'ई (ee)',
    emoji: '🎋',
    speechEn: 'ई से ईख! Like इ with a waving flag on top!',
    speechHi: 'ई से ईख! इ बनाओ और ऊपर बड़ी ई की मात्रा लगाओ!',
    bgGradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    borderColor: '#bbf7d0',
    shadowColor: 'rgba(22, 163, 74, 0.4)',
    strokes: [
      makeLineStroke(1, 'Tiny top vertical stem', 'ऊपर छोटी गर्दन', 100, 45, 100, 65),
      makeMultiCubicStroke(2, 'S curve body', 'एस जैसा लहराता घुमाव', 100, 65, [
        { cx1: 65, cy1: 75, cx2: 65, cy2: 100, x2: 100, y2: 105 },
        { cx1: 135, cy1: 110, cx2: 135, cy2: 135, x2: 100, y2: 145 }
      ]),
      makeMultiCubicStroke(3, 'Bottom loop tail', 'नीचे गोल घुमाकर पूंछ निकालो', 100, 145, [
        { cx1: 120, cy1: 152, cx2: 105, cy2: 165, x2: 90, y2: 158 },
        { cx1: 80, cy1: 154, cx2: 65, cy2: 165, x2: 55, y2: 175 }
      ]),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 60, 45, 140, 45),
      makeCubicStroke(5, 'Top reph matra', 'ऊपर की उड़ती ई की मात्रा', 100, 45, 105, 20, 130, 20, 135, 32)
    ]
  },
  {
    id: 'hi_u',
    category: 'hindi',
    subCategory: 'swar',
    char: 'उ',
    name: 'उल्लू',
    phonics: 'उ (u)',
    emoji: '🦉',
    speechEn: 'उ से उल्लू! Top curve, big bottom curve, and roof!',
    speechHi: 'उ से उल्लू! ऊपर का घुमाव, नीचे का बड़ा घुमाव और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    borderColor: '#bae6fd',
    shadowColor: 'rgba(2, 132, 199, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'ऊपर का तीन जैसा घुमाव', 65, 65, 95, 45, 110, 75, 80, 100),
      makeCubicStroke(2, 'Bottom curve with tail', 'नीचे का बड़ा घुमाव ऊपर तक', 80, 100, 125, 125, 80, 168, 48, 155),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 135, 45)
    ]
  },
  {
    id: 'hi_oo',
    category: 'hindi',
    subCategory: 'swar',
    char: 'ऊ',
    name: 'ऊन',
    phonics: 'ऊ (oo)',
    emoji: '🧶',
    speechEn: 'ऊ से ऊन! Write उ and add a tail at the back!',
    speechHi: 'ऊ से ऊन! उ बनाओ और पीछे सुंदर पूंछ निकालो!',
    bgGradient: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
    borderColor: '#c7d2fe',
    shadowColor: 'rgba(79, 70, 229, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'ऊपर का घुमाव', 65, 65, 95, 45, 110, 75, 80, 100),
      makeCubicStroke(2, 'Bottom curve with tail', 'नीचे का बड़ा घुमाव', 80, 100, 125, 125, 80, 168, 48, 155),
      makeCubicStroke(3, 'Back middle tail', 'बीच से नीचे मुड़ती पूंछ', 80, 105, 125, 105, 135, 130, 125, 155),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 135, 45)
    ]
  },
  {
    id: 'hi_ri',
    category: 'hindi',
    subCategory: 'swar',
    char: 'ऋ',
    name: 'ऋषि',
    phonics: 'ऋ (ri)',
    emoji: '🧘',
    speechEn: 'ऋ से ऋषि! Center line, two slanted arms, right loop and roof!',
    speechHi: 'ऋ से ऋषि! बीच में खड़ी पाई, बाईं ओर दो डाली, दाईं ओर गांठ और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
    borderColor: '#e9d5ff',
    shadowColor: 'rgba(147, 51, 234, 0.4)',
    strokes: [
      makeLineStroke(1, 'Center vertical line', 'बीच की सीधी खड़ी पाई', 105, 45, 105, 165),
      makeLineStroke(2, 'Upper left branch', 'ऊपर बाईं ओर तिरछी डाली', 105, 105, 65, 65),
      makeLineStroke(3, 'Lower left branch', 'नीचे बाईं ओर तिरछी डाली', 105, 105, 65, 155),
      makeMultiCubicStroke(4, 'Right loop and curve', 'दाईं ओर गांठ और घुमाव', 105, 95, [
        { cx1: 125, cy1: 80, cx2: 130, cy2: 65, x2: 120, y2: 65 },
        { cx1: 110, cy1: 65, cx2: 120, cy2: 105, x2: 135, y2: 115 },
        { cx1: 145, cy1: 125, cx2: 145, cy2: 145, x2: 125, y2: 155 }
      ]),
      makeLineStroke(5, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 155, 45)
    ]
  },
  {
    id: 'hi_e',
    category: 'hindi',
    subCategory: 'swar',
    char: 'ए',
    name: 'एड़ी',
    phonics: 'ए (e)',
    emoji: '🦶',
    speechEn: 'ए से एड़ी! Left line with slant, right line with hook, and roof!',
    speechHi: 'ए से एड़ी! पहली लाइन तिरछी, दूसरी लाइन अंदर मुड़ी और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    borderColor: '#99f6e4',
    shadowColor: 'rgba(13, 148, 136, 0.4)',
    strokes: [
      makeMultiCubicStroke(1, 'Left vertical line and slant', 'बाईं लाइन नीचे लाकर तिरछी ले जाओ', 80, 45, [
        { cx1: 80, cy1: 75, cx2: 80, cy2: 100, x2: 80, y2: 105 },
        { cx1: 80, cy1: 125, cx2: 105, cy2: 150, x2: 125, y2: 165 }
      ]),
      makeMultiCubicStroke(2, 'Right vertical and inner hook', 'दाईं लाइन और अंदर की ओर मुड़ाव', 125, 45, [
        { cx1: 125, cy1: 75, cx2: 125, cy2: 95, x2: 125, y2: 105 },
        { cx1: 125, cy1: 108, cx2: 110, cy2: 108, x2: 95, y2: 105 }
      ]),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 60, 45, 145, 45)
    ]
  },
  {
    id: 'hi_ai',
    category: 'hindi',
    subCategory: 'swar',
    char: 'ऐ',
    name: 'ऐनक',
    phonics: 'ऐ (ai)',
    emoji: '👓',
    speechEn: 'ऐ से ऐनक! Write ए with a matra on top!',
    speechHi: 'ऐ से ऐनक! ए बनाओ और ऊपर तिरछी ऐ की मात्रा लगाओ!',
    bgGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    borderColor: '#fde68a',
    shadowColor: 'rgba(217, 119, 6, 0.4)',
    strokes: [
      makeMultiCubicStroke(1, 'Left vertical and slant', 'बाईं लाइन नीचे और तिरछी', 80, 45, [
        { cx1: 80, cy1: 75, cx2: 80, cy2: 100, x2: 80, y2: 105 },
        { cx1: 80, cy1: 125, cx2: 105, cy2: 150, x2: 125, y2: 165 }
      ]),
      makeMultiCubicStroke(2, 'Right vertical and hook', 'दाईं लाइन और अंदर मुड़ाव', 125, 45, [
        { cx1: 125, cy1: 75, cx2: 125, cy2: 95, x2: 125, y2: 105 },
        { cx1: 125, cy1: 108, cx2: 110, cy2: 108, x2: 95, y2: 105 }
      ]),
      makeLineStroke(3, 'Shirorekha roof', 'ऊपर की शिरोरेखा', 60, 45, 145, 45),
      makeLineStroke(4, 'Top matra slant', 'ऊपर तिरछी मात्रा', 125, 45, 90, 20)
    ]
  },
  {
    id: 'hi_o',
    category: 'hindi',
    subCategory: 'swar',
    char: 'ओ',
    name: 'ओखली',
    phonics: 'ओ (o)',
    emoji: '🥣',
    speechEn: 'ओ से ओखली! Write आ and add a slanted flag on top!',
    speechHi: 'ओ से ओखली! आ बनाओ और डंडे के ऊपर ओ की मात्रा लगाओ!',
    bgGradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    borderColor: '#fecdd3',
    shadowColor: 'rgba(225, 29, 72, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'ऊपर का घुमाव', 50, 65, 75, 45, 90, 75, 65, 100),
      makeCubicStroke(2, 'Bottom curve with tail', 'नीचे का घुमाव', 65, 100, 105, 125, 65, 165, 38, 155),
      makeLineStroke(3, 'Middle connector bar', 'बीच की लाइन', 65, 105, 115, 105),
      makeLineStroke(4, 'First vertical line', 'पहली खड़ी पाई', 115, 45, 115, 165),
      makeLineStroke(5, 'Second vertical line', 'दूसरी खड़ी पाई', 145, 45, 145, 165),
      makeLineStroke(6, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 95, 45, 165, 45),
      makeLineStroke(7, 'Top matra flag', 'ऊपर की तिरछी मात्रा', 145, 45, 110, 20)
    ]
  },
  {
    id: 'hi_au',
    category: 'hindi',
    subCategory: 'swar',
    char: 'औ',
    name: 'औरत',
    phonics: 'औ (au)',
    emoji: '👩',
    speechEn: 'औ से औरत! Write आ and add two slanted flags on top!',
    speechHi: 'औ से औरत! आ बनाओ और डंडे के ऊपर दो मात्राएं लगाओ!',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(5, 150, 105, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'ऊपर का घुमाव', 50, 65, 75, 45, 90, 75, 65, 100),
      makeCubicStroke(2, 'Bottom curve with tail', 'नीचे का घुमाव', 65, 100, 105, 125, 65, 165, 38, 155),
      makeLineStroke(3, 'Middle connector bar', 'बीच की लाइन', 65, 105, 115, 105),
      makeLineStroke(4, 'First vertical line', 'पहली खड़ी पाई', 115, 45, 115, 165),
      makeLineStroke(5, 'Second vertical line', 'दूसरी खड़ी पाई', 145, 45, 145, 165),
      makeLineStroke(6, 'Shirorekha roof', 'ऊपर की शिरोरेखा', 95, 45, 165, 45),
      makeLineStroke(7, 'First top matra', 'पहली तिरछी मात्रा', 145, 45, 110, 20),
      makeLineStroke(8, 'Second top matra', 'दूसरी तिरछी मात्रा', 145, 45, 130, 15)
    ]
  },
  {
    id: 'hi_am',
    category: 'hindi',
    subCategory: 'swar',
    char: 'अं',
    name: 'अंगूर',
    phonics: 'अं (am)',
    emoji: '🍇',
    speechEn: 'अं से अंगूर! Write अ and place a glowing dot on top!',
    speechHi: 'अं से अंगूर! अ बनाओ और ऊपर प्यारी सी बिंदी लगाओ!',
    bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    borderColor: '#ddd6fe',
    shadowColor: 'rgba(124, 58, 237, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'ऊपर का घुमाव', 60, 65, 85, 45, 100, 75, 75, 100),
      makeCubicStroke(2, 'Bottom curve with tail', 'नीचे का घुमाव', 75, 100, 115, 125, 75, 165, 45, 155),
      makeLineStroke(3, 'Middle connector bar', 'बीच की लाइन', 75, 105, 125, 105),
      makeLineStroke(4, 'Vertical standing line', 'सीधी खड़ी पाई', 125, 45, 125, 165),
      makeLineStroke(5, 'Shirorekha roof', 'शिरोरेखा', 105, 45, 155, 45),
      makeDotStroke(6, 'Top bindi dot', 'ऊपर की बिंदी', 125, 28)
    ]
  },
  {
    id: 'hi_ah',
    category: 'hindi',
    subCategory: 'swar',
    char: 'अः',
    name: 'अः (खाली)',
    phonics: 'अः (ah)',
    emoji: '😊',
    speechEn: 'अः खाली! Write अ with two dots on the side!',
    speechHi: 'अः खाली! अ बनाओ और बगल में दो विसर्ग बिंदियां लगाओ!',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(5, 150, 105, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'ऊपर का घुमाव', 55, 65, 80, 45, 95, 75, 70, 100),
      makeCubicStroke(2, 'Bottom curve with tail', 'नीचे का घुमाव', 70, 100, 110, 125, 70, 165, 40, 155),
      makeLineStroke(3, 'Middle connector bar', 'बीच की लाइन', 70, 105, 120, 105),
      makeLineStroke(4, 'Vertical standing line', 'सीधी खड़ी पाई', 120, 45, 120, 165),
      makeLineStroke(5, 'Shirorekha roof', 'शिरोरेखा', 100, 45, 145, 45),
      makeDotStroke(6, 'Top side dot', 'ऊपर की विसर्ग बिंदी', 150, 85),
      makeDotStroke(7, 'Bottom side dot', 'नीचे की विसर्ग बिंदी', 150, 125)
    ]
  },

  // --- VYANJAN (व्यंजन - 36) ---
  {
    id: 'hi_ka',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'क',
    name: 'कबूतर',
    phonics: 'क (k)',
    emoji: '🕊️',
    speechEn: 'क से कबूतर! Standing line down, round circle on left, hook on right, and roof!',
    speechHi: 'क से कबूतर! सीधी खड़ी पाई, बाईं ओर गोल घेरा, दाईं ओर मुड़ा हुक, और ऊपर शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    borderColor: '#bae6fd',
    shadowColor: 'rgba(2, 132, 199, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing vertical line', 'पहला कदम: सीधी खड़ी पाई नीचे खींचो', 100, 45, 100, 165),
      makeCubicStroke(2, 'Left round belly circle', 'दूसरा कदम: बाईं ओर पूरा गोल घेरा बनाओ', 100, 105, 45, 75, 45, 135, 100, 105),
      makeCubicStroke(3, 'Right hook curve down', 'तीसरा कदम: दाईं ओर मुड़ा हुक बनाओ', 100, 105, 145, 95, 155, 135, 145, 155),
      makeLineStroke(4, 'Shirorekha top roof', 'चौथा कदम: ऊपर शिरोरेखा (छत) खींचो', 45, 45, 155, 45)
    ]
  },
  {
    id: 'hi_kha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ख',
    name: 'खरगोश',
    phonics: 'ख (kh)',
    emoji: '🐇',
    speechEn: 'ख से खरगोश! Upper hook, slide curve, standing line, belly circle and roof!',
    speechHi: 'ख से खरगोश! ऊपर का घुमाव, नीचे की रेखा, सीधी खड़ी पाई, अंदर गोल घेरा और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeMultiCubicStroke(1, 'Left hook and bottom slide', 'पहला कदम: र जैसा घुमाव नीचे ले जाओ', 65, 55, [
        { cx1: 95, cy1: 50, cx2: 95, cy2: 85, x2: 75, y2: 100 },
        { cx1: 65, cy1: 115, cx2: 95, cy2: 155, x2: 125, y2: 160 }
      ]),
      makeLineStroke(2, 'Standing vertical line', 'दूसरा कदम: सीधी खड़ी पाई', 125, 45, 125, 165),
      makeCubicStroke(3, 'Inside round circle', 'तीसरा कदम: बीच में गोल घेरा बनाओ', 125, 115, 80, 95, 80, 135, 125, 120),
      makeLineStroke(4, 'Shirorekha top roof', 'चौथा कदम: ऊपर की शिरोरेखा', 45, 45, 155, 45)
    ]
  },
  {
    id: 'hi_ga',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ग',
    name: 'गमला',
    phonics: 'ग (g)',
    emoji: '🪴',
    speechEn: 'ग से गमला! First line with inward loop, tall standing line, and roof!',
    speechHi: 'ग से गमला! पहली लाइन नीचे मुड़कर गोल हुक, बगल में सीधी खड़ी पाई, और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    borderColor: '#fde68a',
    shadowColor: 'rgba(245, 158, 11, 0.4)',
    strokes: [
      makeMultiCubicStroke(1, 'First line with inward loop', 'पहला कदम: लाइन नीचे लाकर गोल गांठ मोड़ो', 80, 45, [
        { cx1: 80, cy1: 80, cx2: 80, cy2: 110, x2: 80, y2: 125 },
        { cx1: 80, cy1: 138, cx2: 55, cy2: 138, x2: 55, y2: 122 },
        { cx1: 55, cy1: 110, cx2: 70, cy2: 110, x2: 80, y2: 115 }
      ]),
      makeLineStroke(2, 'Tall standing vertical line', 'दूसरा कदम: लंबी सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(3, 'Shirorekha top roof', 'तीसरा कदम: ऊपर की शिरोरेखा', 55, 45, 155, 45)
    ]
  },
  {
    id: 'hi_gha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'घ',
    name: 'घड़ी',
    phonics: 'घ (gh)',
    emoji: '⏰',
    speechEn: 'घ से घड़ी! Double curve body, standing line, and roof!',
    speechHi: 'घ से घड़ी! ऊपर का घुमाव, नीचे का घुमाव, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    borderColor: '#fbcfe8',
    shadowColor: 'rgba(236, 72, 153, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'ऊपर का गोल घुमाव', 65, 60, 95, 48, 105, 80, 90, 100),
      makeCubicStroke(2, 'Bottom curve to standing line', 'नीचे का घुमाव खड़ी पाई से मिलाओ', 90, 100, 125, 110, 105, 150, 130, 135),
      makeLineStroke(3, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_nga',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ङ',
    name: 'ङ (खाली)',
    phonics: 'ङ (nga)',
    emoji: '✨',
    speechEn: 'ङ खाली! Small stem, S body, dot on right, and roof!',
    speechHi: 'ङ खाली! छोटी गर्दन, ड जैसा घुमाव, बगल में बिंदी और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    borderColor: '#ddd6fe',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    strokes: [
      makeLineStroke(1, 'Tiny top vertical stem', 'ऊपर छोटी गर्दन', 100, 45, 100, 65),
      makeMultiCubicStroke(2, 'S curve body', 'एस जैसा घुमाव', 100, 65, [
        { cx1: 65, cy1: 75, cx2: 65, cy2: 100, x2: 100, y2: 105 },
        { cx1: 135, cy1: 110, cx2: 135, cy2: 135, x2: 95, y2: 155 }
      ]),
      makeDotStroke(3, 'Right bindi dot', 'बगल की बिंदी', 142, 115),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 60, 45, 150, 45)
    ]
  },
  {
    id: 'hi_cha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'च',
    name: 'चम्मच',
    phonics: 'च (ch)',
    emoji: '🥄',
    speechEn: 'च से चम्मच! Middle bar, hanging cup, standing line, and roof!',
    speechHi: 'च से चम्मच! बीच की लाइन, झूलता हुआ पेट, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    borderColor: '#a5f3fc',
    shadowColor: 'rgba(6, 182, 212, 0.4)',
    strokes: [
      makeLineStroke(1, 'Middle horizontal bar', 'बीच की लेटी लाइन', 60, 105, 95, 105),
      makeCubicStroke(2, 'Hanging belly curve', 'नीचे झूलता हुआ पेट खड़ी पाई तक', 95, 105, 80, 145, 115, 145, 130, 110),
      makeLineStroke(3, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 45, 45, 155, 45)
    ]
  },
  {
    id: 'hi_chha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'छ',
    name: 'छतरी',
    phonics: 'छ (chh)',
    emoji: '☂️',
    speechEn: 'छ से छतरी! Double curve up to a top knot, little stem and roof!',
    speechHi: 'छ से छतरी! ऊपर का घुमाव, नीचे का घुमाव ऊपर गांठ तक, छोटी गर्दन और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderColor: '#bfdbfe',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'ऊपर का घुमाव', 65, 60, 95, 48, 105, 80, 90, 100),
      makeMultiCubicStroke(2, 'Bottom curve up to loop', 'नीचे का घुमाव ऊपर ले जाकर गांठ लगाओ', 90, 100, [
        { cx1: 125, cy1: 110, cx2: 95, cy2: 160, x2: 65, y2: 145 },
        { cx1: 50, cy1: 135, cx2: 95, cy2: 95, x2: 100, y2: 85 },
        { cx1: 115, cy1: 75, cx2: 95, cy2: 75, x2: 100, y2: 85 }
      ]),
      makeLineStroke(3, 'Tiny top vertical stem', 'ऊपर छोटी गर्दन', 100, 45, 100, 78),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 150, 45)
    ]
  },
  {
    id: 'hi_ja',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ज',
    name: 'जहाज',
    phonics: 'ज (j)',
    emoji: '🚢',
    speechEn: 'ज से जहाज! Standing line, middle bar, U cup, and roof!',
    speechHi: 'ज से जहाज! सीधी खड़ी पाई, बीच की लेटी लाइन, गोल U घुमाव और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    borderColor: '#99f6e4',
    shadowColor: 'rgba(20, 184, 166, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(2, 'Middle connector bar', 'बीच की लेटी लाइन', 130, 105, 90, 105),
      makeCubicStroke(3, 'Left U-cup curve', 'बाईं ओर मुड़कर ऊपर आता घुमाव', 90, 105, 65, 145, 45, 135, 50, 95),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_jha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'झ',
    name: 'झंडा',
    phonics: 'झ (jh)',
    emoji: '🇮🇳',
    speechEn: 'झ से झंडा! Write इ, bridge to standing line, and roof!',
    speechHi: 'झ से झंडा! इ बनाओ, बीच में पुल जोड़ो, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    borderColor: '#fed7aa',
    shadowColor: 'rgba(249, 115, 22, 0.4)',
    strokes: [
      makeLineStroke(1, 'Small top vertical stem', 'ऊपर छोटी गर्दन', 80, 45, 80, 62),
      makeMultiCubicStroke(2, 'S curve body', 'एस जैसा घुमाव', 80, 62, [
        { cx1: 50, cy1: 72, cx2: 50, cy2: 95, x2: 80, y2: 100 },
        { cx1: 110, cy1: 105, cx2: 110, cy2: 125, x2: 80, y2: 132 }
      ]),
      makeMultiCubicStroke(3, 'Bottom loop tail', 'नीचे गांठ और पूंछ', 80, 132, [
        { cx1: 95, cy1: 138, cx2: 85, cy2: 150, x2: 72, y2: 145 },
        { cx1: 65, cy1: 142, cx2: 55, cy2: 152, x2: 45, y2: 165 }
      ]),
      makeLineStroke(4, 'Middle bridge bar', 'बीच की लाइन', 80, 105, 130, 105),
      makeLineStroke(5, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(6, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_nya',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ञ',
    name: 'ञ (खाली)',
    phonics: 'ञ (nya)',
    emoji: '🌟',
    speechEn: 'ञ खाली! Left curve, bridge bar, standing line and roof!',
    speechHi: 'ञ खाली! बायां आधा गोल, बीच का पुल, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #84cc16 0%, #4d7c0f 100%)',
    borderColor: '#d9f99d',
    shadowColor: 'rgba(132, 204, 22, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Left C-curve', 'बाईं ओर आधा गोल', 75, 75, 45, 95, 45, 120, 75, 135),
      makeLineStroke(2, 'Middle bridge bar', 'बीच की लाइन', 70, 105, 130, 105),
      makeLineStroke(3, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_ta',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ट',
    name: 'टमाटर',
    phonics: 'ट (t)',
    emoji: '🍅',
    speechEn: 'ट से टमाटर! Tiny neck down, big round tummy, and roof!',
    speechHi: 'ट से टमाटर! छोटी गर्दन, बड़ा गोल पेट और ऊपर शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    borderColor: '#fca5a5',
    shadowColor: 'rgba(239, 68, 68, 0.4)',
    strokes: [
      makeLineStroke(1, 'Small top vertical stem', 'ऊपर छोटी गर्दन', 100, 45, 100, 70),
      makeCubicStroke(2, 'Big round C belly', 'बड़ा गोल पेट बनाओ', 100, 70, 50, 85, 50, 155, 140, 150),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 145, 45)
    ]
  },
  {
    id: 'hi_tha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ठ',
    name: 'ठठेरा',
    phonics: 'ठ (th)',
    emoji: '🏺',
    speechEn: 'ठ से ठठेरा! Small neck down, full round circle, and roof!',
    speechHi: 'ठ से ठठेरा! छोटी गर्दन, पूरा गोल घेरा और ऊपर शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    borderColor: '#fde68a',
    shadowColor: 'rgba(245, 158, 11, 0.4)',
    strokes: [
      makeLineStroke(1, 'Small top stem', 'ऊपर छोटी गर्दन', 100, 45, 100, 70),
      makeMultiCubicStroke(2, 'Full round O belly', 'पूरा गोल घेरा बनाओ', 100, 70, [
        { cx1: 50, cy1: 75, cx2: 50, cy2: 155, x2: 100, y2: 155 },
        { cx1: 150, cy1: 155, cx2: 150, cy2: 75, x2: 100, y2: 70 }
      ]),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 145, 45)
    ]
  },
  {
    id: 'hi_da',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ड',
    name: 'डमरू',
    phonics: 'ड (d)',
    emoji: '🪘',
    speechEn: 'ड से डमरू! Small neck, wavy S body, and roof!',
    speechHi: 'ड से डमरू! छोटी गर्दन, एस जैसा घुमाव और ऊपर शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeLineStroke(1, 'Small top stem', 'ऊपर छोटी गर्दन', 100, 45, 100, 65),
      makeMultiCubicStroke(2, 'S curve body', 'एस जैसा घुमाव', 100, 65, [
        { cx1: 60, cy1: 75, cx2: 60, cy2: 100, x2: 100, y2: 105 },
        { cx1: 140, cy1: 110, cx2: 140, cy2: 140, x2: 90, y2: 155 }
      ]),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 145, 45)
    ]
  },
  {
    id: 'hi_dha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ढ',
    name: 'ढक्कन',
    phonics: 'ढ (dh)',
    emoji: '🥘',
    speechEn: 'ढ से ढक्कन! Small neck, big C curve with curl loop inside!',
    speechHi: 'ढ से ढक्कन! छोटी गर्दन, बड़ा पेट और अंदर छोटी गांठ!',
    bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    borderColor: '#c7d2fe',
    shadowColor: 'rgba(99, 102, 241, 0.4)',
    strokes: [
      makeLineStroke(1, 'Small top stem', 'ऊपर छोटी गर्दन', 100, 45, 100, 70),
      makeMultiCubicStroke(2, 'Big belly curve and curl loop', 'बड़ा पेट और अंदर छोटी गांठ', 100, 70, [
        { cx1: 50, cy1: 85, cx2: 50, cy2: 155, x2: 125, y2: 150 },
        { cx1: 140, cy1: 148, cx2: 140, cy2: 120, x2: 115, y2: 120 },
        { cx1: 100, cy1: 120, cx2: 100, cy2: 135, x2: 115, y2: 135 }
      ]),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 145, 45)
    ]
  },
  {
    id: 'hi_na_retro',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ण',
    name: 'ण (खाली)',
    phonics: 'ण (na)',
    emoji: '🌸',
    speechEn: 'ण खाली! U cup, standing line, and roof!',
    speechHi: 'ण खाली! कटोरी जैसा U घुमाव, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    borderColor: '#fbcfe8',
    shadowColor: 'rgba(236, 72, 153, 0.4)',
    strokes: [
      makeMultiCubicStroke(1, 'U shape cup', 'कटोरी जैसा घुमाव', 70, 45, [
        { cx1: 70, cy1: 95, cx2: 70, cy2: 135, x2: 85, y2: 135 },
        { cx1: 100, cy1: 135, cx2: 100, cy2: 95, x2: 100, y2: 45 }
      ]),
      makeLineStroke(2, 'Standing vertical line', 'सीधी खड़ी पाई', 135, 45, 135, 165),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 155, 45)
    ]
  },
  {
    id: 'hi_ta_dental',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'त',
    name: 'तरबूज',
    phonics: 'त (t)',
    emoji: '🍉',
    speechEn: 'त से तरबूज! Standing line down, middle curved hook, and roof!',
    speechHi: 'त से तरबूज! सीधी खड़ी पाई, बीच से मुड़ती लाइन और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing vertical line', 'सीधी खड़ी पाई', 125, 45, 125, 165),
      makeCubicStroke(2, 'Middle branch with hook down', 'बीच से मुड़ती हुई झुकी लाइन', 125, 105, 80, 105, 80, 130, 80, 165),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 150, 45)
    ]
  },
  {
    id: 'hi_tha_dental',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'थ',
    name: 'थर्मस',
    phonics: 'थ (th)',
    emoji: '🍶',
    speechEn: 'थ से थर्मस! Top curl knot, belly curve, standing line, and roof!',
    speechHi: 'थ से थर्मस! ऊपर गोल छल्ला, नीचे का पेट, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    borderColor: '#bae6fd',
    shadowColor: 'rgba(2, 132, 199, 0.4)',
    strokes: [
      makeMultiCubicStroke(1, 'Top loop curl and curve', 'ऊपर गोल छल्ला और घुमाव', 75, 60, [
        { cx1: 60, cy1: 50, cx2: 70, cy2: 45, x2: 78, y2: 52 },
        { cx1: 85, cy1: 58, cx2: 85, cy2: 80, x2: 70, y2: 95 }
      ]),
      makeCubicStroke(2, 'Bottom belly curve to line', 'नीचे का पेट खड़ी पाई से मिलाओ', 70, 95, 65, 145, 115, 145, 125, 115),
      makeLineStroke(3, 'Standing vertical line', 'सीधी खड़ी पाई', 125, 45, 125, 165),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 105, 45, 150, 45)
    ]
  },
  {
    id: 'hi_da_dental',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'द',
    name: 'दवात',
    phonics: 'द (d)',
    emoji: '🖋️',
    speechEn: 'द से दवात! Small neck, round tummy, hanging tail down, and roof!',
    speechHi: 'द से दवात! छोटी गर्दन, गोल पेट, नीचे आती पूंछ और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    borderColor: '#ddd6fe',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    strokes: [
      makeLineStroke(1, 'Small top stem', 'ऊपर छोटी गर्दन', 95, 45, 95, 68),
      makeMultiCubicStroke(2, 'Round tummy and hanging tail', 'गोल पेट और नीचे आती पूंछ', 95, 68, [
        { cx1: 55, cy1: 80, cx2: 55, cy2: 130, x2: 105, y2: 130 },
        { cx1: 120, cy1: 130, cx2: 115, cy2: 145, x2: 125, y2: 165 }
      ]),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 140, 45)
    ]
  },
  {
    id: 'hi_dha_dental',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ध',
    name: 'धनुष',
    phonics: 'ध (dh)',
    emoji: '🏹',
    speechEn: 'ध से धनुष! Top loop knot, double curve, standing line, and roof!',
    speechHi: 'ध से धनुष! ऊपर छोटा छल्ला, दो घुमाव, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    borderColor: '#fde68a',
    shadowColor: 'rgba(217, 119, 6, 0.4)',
    strokes: [
      makeMultiCubicStroke(1, 'Top loop and first curve', 'ऊपर छोटा छल्ला और पहला घुमाव', 70, 58, [
        { cx1: 58, cy1: 48, cx2: 70, cy2: 45, x2: 76, y2: 52 },
        { cx1: 95, cy1: 60, cx2: 105, cy2: 85, x2: 90, y2: 98 }
      ]),
      makeCubicStroke(2, 'Second curve to line', 'दूसरा घुमाव खड़ी पाई तक', 90, 98, 120, 110, 105, 145, 125, 130),
      makeLineStroke(3, 'Standing vertical line', 'सीधी खड़ी पाई', 125, 45, 125, 165),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 105, 45, 150, 45)
    ]
  },
  {
    id: 'hi_na',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'न',
    name: 'नल',
    phonics: 'न (n)',
    emoji: '🚰',
    speechEn: 'न से नल! Standing line, horizontal bar with small knot, and roof!',
    speechHi: 'न से नल! सीधी खड़ी पाई, लेटी लाइन और गोल गांठ, ऊपर शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    borderColor: '#bae6fd',
    shadowColor: 'rgba(2, 132, 199, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeMultiCubicStroke(2, 'Middle bar with loop knot', 'लेटी लाइन और बाईं ओर गांठ', 130, 105, [
        { cx1: 105, cy1: 105, cx2: 80, cy2: 105, x2: 70, y2: 105 },
        { cx1: 50, cy1: 105, cx2: 50, cy2: 130, x2: 70, y2: 130 },
        { cx1: 85, cy1: 130, cx2: 85, cy2: 105, x2: 70, y2: 105 }
      ]),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_pa',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'प',
    name: 'पतंग',
    phonics: 'प (p)',
    emoji: '🪁',
    speechEn: 'प से पतंग! Left U curve to line, standing line down, and roof!',
    speechHi: 'प से पतंग! बाईं ओर मुड़कर खड़ी पाई तक, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
    borderColor: '#fda4af',
    shadowColor: 'rgba(244, 63, 94, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Left U-hook curve to line', 'बाईं ओर मुड़कर खड़ी पाई तक', 75, 45, 75, 115, 100, 115, 130, 115),
      makeLineStroke(2, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 155, 45)
    ]
  },
  {
    id: 'hi_pha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'फ',
    name: 'फल',
    phonics: 'फ (ph)',
    emoji: '🍎',
    speechEn: 'फ से फल! Write प, add right hanging hook, and roof!',
    speechHi: 'फ से फल! प बनाओ, दाईं ओर मुड़ा हुक लगाओ और शिरोरेखा खींचो!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Left U-hook', 'बाईं ओर मुड़ाव', 65, 45, 65, 115, 85, 115, 105, 115),
      makeLineStroke(2, 'Standing vertical line', 'सीधी खड़ी पाई', 105, 45, 105, 165),
      makeCubicStroke(3, 'Right hanging hook', 'दाईं ओर मुड़ा हुआ हुक', 105, 115, 145, 110, 145, 135, 145, 155),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 160, 45)
    ]
  },
  {
    id: 'hi_ba',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ब',
    name: 'बतख',
    phonics: 'ब (b)',
    emoji: '🦆',
    speechEn: 'ब से बतख! Standing line, round belly, diagonal slice inside, and roof!',
    speechHi: 'ब से बतख! सीधी खड़ी पाई, गोल पेट, पेट में तिरछी लाइन और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    borderColor: '#bae6fd',
    shadowColor: 'rgba(2, 132, 199, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeCubicStroke(2, 'Left round belly circle', 'गोल पेट बनाओ', 130, 105, 60, 75, 60, 135, 130, 105),
      makeLineStroke(3, 'Diagonal slice across belly', 'पेट के बीच में तिरछी लाइन', 75, 85, 120, 125),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_bha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'भ',
    name: 'भालू',
    phonics: 'भ (bh)',
    emoji: '🐻',
    speechEn: 'भ से भालू! Top loop, stem, bottom knot to bar, standing line, and roof!',
    speechHi: 'भ से भालू! ऊपर छोटा छल्ला, नीचे गांठ और लाइन, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #854d0e 0%, #713f12 100%)',
    borderColor: '#fef08a',
    shadowColor: 'rgba(133, 77, 14, 0.4)',
    strokes: [
      makeMultiCubicStroke(1, 'Top loop and down stem', 'ऊपर छोटा छल्ला और नीचे आती लाइन', 75, 60, [
        { cx1: 60, cy1: 50, cx2: 70, cy2: 45, x2: 78, y2: 52 },
        { cx1: 82, cy1: 60, cx2: 75, cy2: 90, x2: 75, y2: 125 }
      ]),
      makeMultiCubicStroke(2, 'Bottom knot to horizontal bar', 'नीचे गांठ बनाकर सीधी लाइन', 75, 125, [
        { cx1: 55, cy1: 125, cx2: 55, cy2: 140, x2: 75, y2: 140 },
        { cx1: 95, cy1: 140, cx2: 115, cy2: 140, x2: 130, y2: 140 }
      ]),
      makeLineStroke(3, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(4, 'Shirorekha top roof', 'शिरोरेखा', 110, 45, 155, 45)
    ]
  },
  {
    id: 'hi_ma',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'म',
    name: 'मछली',
    phonics: 'म (m)',
    emoji: '🐟',
    speechEn: 'म से मछली! Left stem down, bottom knot to horizontal bar, standing line, and roof!',
    speechHi: 'म से मछली! बाईं लाइन नीचे, गांठ बनाकर सीधी लाइन, खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    borderColor: '#a5f3fc',
    shadowColor: 'rgba(6, 182, 212, 0.4)',
    strokes: [
      makeLineStroke(1, 'Left vertical line down', 'बाईं लाइन नीचे लाओ', 75, 45, 75, 125),
      makeMultiCubicStroke(2, 'Bottom knot and bar across', 'नीचे गांठ और सीधी लेटी लाइन', 75, 125, [
        { cx1: 55, cy1: 125, cx2: 55, cy2: 140, x2: 75, y2: 140 },
        { cx1: 95, cy1: 140, cx2: 115, cy2: 140, x2: 130, y2: 140 }
      ]),
      makeLineStroke(3, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_ya',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'य',
    name: 'यज्ञ',
    phonics: 'य (y)',
    emoji: '🔥',
    speechEn: 'य से यज्ञ! Top neck hook, bottom belly curve, standing line, and roof!',
    speechHi: 'य से यज्ञ! ऊपर बायां हुक, नीचे का पेट, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    borderColor: '#fed7aa',
    shadowColor: 'rgba(234, 88, 12, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Left neck hook', 'ऊपर बायां हुक', 65, 45, 90, 45, 90, 95, 70, 105),
      makeCubicStroke(2, 'Bottom belly to standing line', 'नीचे का पेट खड़ी पाई से मिलाओ', 70, 105, 55, 155, 120, 155, 130, 125),
      makeLineStroke(3, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_ra',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'र',
    name: 'रथ',
    phonics: 'र (r)',
    emoji: '🐎',
    speechEn: 'र से रथ! Top round curve, slanted slide down, and roof!',
    speechHi: 'र से रथ! ऊपर का गोल घुमाव, नीचे तिरछी लाइन और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
    borderColor: '#fecdd3',
    shadowColor: 'rgba(225, 29, 72, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top round curve', 'ऊपर का गोल घुमाव', 75, 45, 130, 45, 130, 100, 80, 108),
      makeLineStroke(2, 'Slanted slide down', 'नीचे बाईं ओर तिरछी लाइन', 80, 108, 60, 165),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 140, 45)
    ]
  },
  {
    id: 'hi_la',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ल',
    name: 'लट्टू',
    phonics: 'ल (l)',
    emoji: '🪀',
    speechEn: 'ल से लट्टू! Standing line, middle slant branch, hanging arch curve, and roof!',
    speechHi: 'ल से लट्टू! सीधी खड़ी पाई, बीच से तिरछी डाली, झूलता हुआ घुमाव और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
    borderColor: '#e9d5ff',
    shadowColor: 'rgba(147, 51, 234, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing vertical line', 'सीधी खड़ी पाई', 135, 45, 135, 165),
      makeLineStroke(2, 'Center slant branch', 'बीच से तिरछी डाली', 135, 115, 95, 95),
      makeMultiCubicStroke(3, 'Left hanging curve down', 'बाईं ओर झूलता घुमाव', 95, 95, [
        { cx1: 75, cy1: 85, cx2: 60, cy2: 105, x2: 65, y2: 125 },
        { cx1: 70, cy1: 145, cx2: 60, cy2: 165, x2: 85, y2: 165 }
      ]),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_va',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'व',
    name: 'वक',
    phonics: 'व (v)',
    emoji: '🦢',
    speechEn: 'व से वक! Standing line, round belly circle on left, and roof!',
    speechHi: 'व से वक! सीधी खड़ी पाई, बाईं ओर गोल पेट और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    borderColor: '#bae6fd',
    shadowColor: 'rgba(2, 132, 199, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeCubicStroke(2, 'Left round belly circle', 'बाईं ओर गोल पेट बनाओ', 130, 105, 60, 75, 60, 135, 130, 105),
      makeLineStroke(3, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_sha_palatal',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'श',
    name: 'शलजम',
    phonics: 'श (sh)',
    emoji: '🥗',
    speechEn: 'श से शलजम! Top loop, 2-curve with knot, standing line, and roof!',
    speechHi: 'श से शलजम! ऊपर गोल छल्ला, गांठ और तिरछी लाइन, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #d946ef 0%, #a21caf 100%)',
    borderColor: '#f5d0fe',
    shadowColor: 'rgba(217, 70, 239, 0.4)',
    strokes: [
      makeMultiCubicStroke(1, 'Top loop and neck', 'ऊपर गोल छल्ला और गर्दन', 80, 58, [
        { cx1: 65, cy1: 48, cx2: 75, cy2: 45, x2: 82, y2: 52 },
        { cx1: 100, cy1: 65, cx2: 95, cy2: 95, x2: 75, y2: 115 }
      ]),
      makeMultiCubicStroke(2, 'Bottom loop knot and slant', 'नीचे की गांठ और तिरछी लाइन', 75, 115, [
        { cx1: 58, cy1: 115, cx2: 58, cy2: 130, x2: 75, y2: 130 },
        { cx1: 75, cy1: 135, cx2: 65, cy2: 155, x2: 55, y2: 165 }
      ]),
      makeLineStroke(3, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(4, 'Shirorekha top roof', 'शिरोरेखा', 110, 45, 155, 45)
    ]
  },
  {
    id: 'hi_sha_retro',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ष',
    name: 'षट्कोण',
    phonics: 'ष (sh)',
    emoji: '⬡',
    speechEn: 'ष से षट्कोण! Write प with a diagonal line inside, and roof!',
    speechHi: 'ष से षट्कोण! प बनाओ, बीच में तिरछी लाइन खींचो और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Left U hook to line', 'बाईं ओर मुड़ा हुक', 75, 45, 75, 115, 100, 115, 130, 115),
      makeLineStroke(2, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(3, 'Diagonal slice inside', 'बीच में तिरछी लाइन', 75, 75, 130, 115),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 155, 45)
    ]
  },
  {
    id: 'hi_sa',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'स',
    name: 'सेब',
    phonics: 'स (s)',
    emoji: '🍎',
    speechEn: 'स से सेब! Like र on left, bridge to standing line, and roof!',
    speechHi: 'स से सेब! र बनाओ, बीच का पुल जोड़ो, सीधी खड़ी पाई और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    borderColor: '#fecdd3',
    shadowColor: 'rgba(225, 29, 72, 0.4)',
    strokes: [
      makeCubicStroke(1, 'Top curve', 'ऊपर का गोल घुमाव', 70, 45, 115, 45, 115, 95, 75, 105),
      makeLineStroke(2, 'Slant leg down', 'नीचे तिरछी लाइन', 75, 105, 55, 165),
      makeLineStroke(3, 'Middle bridge bar', 'बीच का जोड़ने वाला पुल', 75, 105, 130, 105),
      makeLineStroke(4, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(5, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 45, 45, 155, 45)
    ]
  },
  {
    id: 'hi_ha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ह',
    name: 'हाथी',
    phonics: 'ह (h)',
    emoji: '🐘',
    speechEn: 'ह से हाथी! Small neck, top S curve, bottom scoop cup, and roof!',
    speechHi: 'ह से हाथी! छोटी गर्दन, एस जैसा घुमाव, नीचे बड़ा घुमाव और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
    borderColor: '#cbd5e1',
    shadowColor: 'rgba(71, 85, 105, 0.4)',
    strokes: [
      makeLineStroke(1, 'Small top stem', 'ऊपर छोटी गर्दन', 95, 45, 95, 65),
      makeMultiCubicStroke(2, 'Top S curve', 'ऊपर का एस जैसा घुमाव', 95, 65, [
        { cx1: 65, cy1: 75, cx2: 65, cy2: 95, x2: 95, y2: 100 },
        { cx1: 120, cy1: 105, cx2: 120, cy2: 115, x2: 105, y2: 120 }
      ]),
      makeCubicStroke(3, 'Bottom scoop cup', 'नीचे कटोरी जैसा बड़ा घुमाव', 85, 105, 135, 125, 130, 165, 70, 165),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 55, 45, 145, 45)
    ]
  },
  {
    id: 'hi_ksha',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'क्ष',
    name: 'क्षत्रिय',
    phonics: 'क्ष (ksh)',
    emoji: '⚔️',
    speechEn: 'क्ष से क्षत्रिय! Standing line, climb up to loop knot, curve down with tail and roof!',
    speechHi: 'क्ष से क्षत्रिय! सीधी खड़ी पाई, ऊपर चढ़कर गांठ, नीचे मुड़कर पूंछ और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #ca8a04 0%, #854d0e 100%)',
    borderColor: '#fef08a',
    shadowColor: 'rgba(202, 138, 4, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing vertical line', 'सीधी खड़ी पाई', 135, 45, 135, 165),
      makeMultiCubicStroke(2, 'Climb up and top knot', 'ऊपर चढ़कर गोल गांठ बनाओ', 135, 110, [
        { cx1: 105, cy1: 95, cx2: 75, cy2: 70, x2: 70, y2: 55 },
        { cx1: 65, cy1: 45, cx2: 80, cy2: 45, x2: 85, y2: 55 },
        { cx1: 90, cy1: 65, cx2: 90, cy2: 85, x2: 85, y2: 95 }
      ]),
      makeMultiCubicStroke(3, 'Curve down and tail', 'नीचे मुड़कर पूंछ निकालो', 85, 95, [
        { cx1: 75, cy1: 110, cx2: 75, cy2: 130, x2: 90, y2: 130 },
        { cx1: 100, cy1: 130, cx2: 85, cy2: 155, x2: 65, y2: 165 }
      ]),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 115, 45, 155, 45)
    ]
  },
  {
    id: 'hi_tra',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'त्र',
    name: 'त्रिशूल',
    phonics: 'त्र (tra)',
    emoji: '🔱',
    speechEn: 'त्र से त्रिशूल! Standing line, top curved arm, bottom slant leg and roof!',
    speechHi: 'त्र से त्रिशूल! सीधी खड़ी पाई, ऊपर मुड़ी हुई भुजा, नीचे तिरछी लाइन और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    borderColor: '#ffedd5',
    shadowColor: 'rgba(249, 115, 22, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing vertical line', 'सीधी खड़ी पाई', 125, 45, 125, 165),
      makeCubicStroke(2, 'Upper curved arm', 'ऊपर की मुड़ी भुजा', 65, 75, 75, 65, 105, 90, 125, 105),
      makeLineStroke(3, 'Lower slant leg', 'नीचे की तिरछी भुजा', 125, 105, 65, 160),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  },
  {
    id: 'hi_gya',
    category: 'hindi',
    subCategory: 'vyanjan',
    char: 'ज्ञ',
    name: 'ज्ञानी',
    phonics: 'ज्ञ (gya)',
    emoji: '📖',
    speechEn: 'ज्ञ से ज्ञानी! Standing line, middle bar, loop knot, hanging tail and roof!',
    speechHi: 'ज्ञ से ज्ञानी! सीधी खड़ी पाई, बीच की रेखा, गोल गांठ, नीचे पूंछ और शिरोरेखा!',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderColor: '#a7f3d0',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    strokes: [
      makeLineStroke(1, 'Standing vertical line', 'सीधी खड़ी पाई', 130, 45, 130, 165),
      makeLineStroke(2, 'Middle horizontal bar', 'बीच की लेटी लाइन', 130, 95, 80, 95),
      makeMultiCubicStroke(3, 'Loop knot and hanging tail', 'ज जैसा पेट, गोल गांठ और नीचे पूंछ', 80, 95, [
        { cx1: 55, cy1: 105, cx2: 55, cy2: 130, x2: 80, y2: 130 },
        { cx1: 90, cy1: 130, cx2: 75, cy2: 148, x2: 50, y2: 165 }
      ]),
      makeLineStroke(4, 'Shirorekha top roof', 'ऊपर की शिरोरेखा', 50, 45, 155, 45)
    ]
  }
];

// Combined map for fast character lookup
export const ALL_TRACING_ITEMS: TracingItem[] = [
  ...ALPHABET_ITEMS,
  ...NUMBER_ITEMS,
  ...HINDI_ITEMS
];

export function getTracingItemById(id: string): TracingItem | undefined {
  return ALL_TRACING_ITEMS.find(item => item.id === id || item.char === id);
}
