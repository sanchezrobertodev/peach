import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSync, visitorKeys } from 'oxc-parser';
const root = fileURLToPath(new URL('../src/', import.meta.url));
const en = JSON.parse(readFileSync(join(root, 'i18n/en.json'), 'utf8'));
const es = JSON.parse(readFileSync(join(root, 'i18n/es.json'), 'utf8'));
const errors = [];
const slots = text => JSON.stringify((text.match(/\{\{\w+\}\}/g) ?? []).sort());
if (JSON.stringify(Object.keys(en).sort()) !== JSON.stringify(Object.keys(es).sort())) errors.push('Catalog keys differ');
for (const [key, value] of Object.entries(en)) {
  if (!value?.trim() || !es[key]?.trim()) errors.push(`Empty translation: ${key}`);
  if (slots(key) !== slots(value) || slots(key) !== slots(es[key] ?? '')) errors.push(`Interpolation mismatch: ${key}`);
}
function scan(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (['boardui', 'evilcharts', 'dev', 'i18n'].includes(item.name)) continue;
    const path = join(dir, item.name);
    if (item.isDirectory()) { scan(path); continue; }
    if (!/\.[jt]sx?$/.test(path) || path.endsWith('.d.ts')) continue;
    const result = parseSync(path, readFileSync(path, 'utf8'));
    if (result.errors.length) { errors.push(`Parse failure: ${path}`); continue; }
    function walk(node) {
      if (node.type === 'CallExpression' && ['t', 'peachT'].includes(node.callee?.name)) {
        const source = node.arguments[0]?.value;
        if (typeof source === 'string' && /[\u3400-\u9fff]/.test(source) && !Object.hasOwn(en, source)) errors.push(`Missing message in ${path}: ${source}`);
      }
      for (const key of visitorKeys[node.type] ?? []) {
        for (const child of Array.isArray(node[key]) ? node[key] : [node[key]]) if (child?.type) walk(child);
      }
    }
    walk(result.program);
  }
}
scan(root);
const shell = readFileSync(join(root, '../../web/index.html'), 'utf8');
for (const [tag] of shell.matchAll(/<[^>]+\bdata-i18n(?:\s|>)[^>]*>/g)) {
  for (const [, source] of tag.matchAll(/(?:title|aria-label|placeholder)="([^"]*)"/g)) {
    if (/[\u3400-\u9fff]/.test(source) && !Object.hasOwn(en, source)) errors.push(`Missing shell message: ${source}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`English and Spanish: ${Object.keys(en).length} messages; keys, interpolation and consumers verified.`);
