const { classifyGesture, computeFingers } = require('./gestures.js');

function buildLandmarks(ext) {
  const lm = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.9, z: 0 }));
  const map = { index: [6, 8], middle: [10, 12], ring: [14, 16], pinky: [18, 20] };
  for (const k of ['index', 'middle', 'ring', 'pinky']) {
    const [pip, tip] = map[k];
    lm[pip] = { x: 0.5, y: 0.6, z: 0 };
    lm[tip] = { x: 0.5, y: ext[k] ? 0.4 : 0.7, z: 0 };
  }
  lm[3] = { x: 0.5, y: 0.55, z: 0 };
  lm[4] = { x: ext.thumb ? 0.6 : 0.45, y: 0.55, z: 0 };
  return lm;
}

const cases = [
  ['left_click', { index: true }],
  ['peace', { index: true, middle: true }],
  ['fist', {}],
  ['open_palm', { index: true, middle: true, ring: true, pinky: true }],
  ['navigate', { middle: true }],
  ['navigate', { thumb: true }],
];

let pass = 0;
cases.forEach(([expected, ext]) => {
  const got = classifyGesture(buildLandmarks(ext));
  const ok = got === expected;
  if (ok) pass++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + JSON.stringify(ext) + ' -> ' + got + (ok ? '' : '  (expected ' + expected + ')'));
});
console.log('\n' + pass + '/' + cases.length + ' gesture cases passed');
process.exit(pass === cases.length ? 0 : 1);
