const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'twenty-sdk',
  'dist',
  'cli.cjs',
);

if (!fs.existsSync(target)) {
  console.log('twenty-sdk cli.cjs not found — skipping patch');
  process.exit(0);
}

let c = fs.readFileSync(target, 'utf8');

const anchor = 'let r=require("path");';
const idx = c.indexOf(anchor);

if (idx === -1) {
  console.log('Patch anchor not found — already patched or version changed');
  process.exit(0);
}

if (c.indexOf('__origRelative') !== -1) {
  console.log('twenty-sdk already patched');
  process.exit(0);
}

const patch =
  anchor +
  'var __origRelative=r.relative;r.relative=function(){var res=__origRelative.apply(r,arguments);return res.split(String.fromCharCode(92)).join(String.fromCharCode(47))};';

c = c.slice(0, idx) + patch + c.slice(idx + anchor.length);
fs.writeFileSync(target, c);
console.log('twenty-sdk patched: path.relative now returns forward slashes');
