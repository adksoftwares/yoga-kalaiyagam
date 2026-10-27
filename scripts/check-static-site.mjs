import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirs = new Set(['.git', 'node_modules']);
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(path.join(dir, entry.name));
    } else {
      files.push(path.join(dir, entry.name));
    }
  }
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  failures += 1;
}

let failures = 0;
walk(root);

const jsFiles = files.filter((file) => file.endsWith('.js') || file.endsWith('.mjs'));
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    fail(`JavaScript syntax: ${path.relative(root, file)}\n${result.stderr || result.stdout}`);
  }
}

for (const file of files.filter((file) => file.endsWith('.json'))) {
  try {
    JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`Invalid JSON: ${path.relative(root, file)} — ${error.message}`);
  }
}

const htmlFiles = files.filter((file) => file.endsWith('.html'));
const attrPattern = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, 'utf8');
  for (const match of html.matchAll(attrPattern)) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith('#') || raw.startsWith('//') ||
        /^[a-z][a-z\d+.-]*:/i.test(raw)) continue;

    const withoutFragment = raw.split('#', 1)[0].split('?', 1)[0];
    if (!withoutFragment) continue;

    let decoded;
    try {
      decoded = decodeURIComponent(withoutFragment);
    } catch {
      fail(`Invalid URL encoding in ${path.relative(root, htmlFile)}: ${raw}`);
      continue;
    }

    const target = path.resolve(path.dirname(htmlFile), decoded);
    if (!target.startsWith(root + path.sep) && target !== root) {
      fail(`Reference escapes repository root in ${path.relative(root, htmlFile)}: ${raw}`);
      continue;
    }
    if (!existsSync(target)) {
      fail(`Missing local reference in ${path.relative(root, htmlFile)}: ${raw}`);
    }
  }
}

if (failures) {
  console.error(`Static checks failed: ${failures} issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`Static checks passed: ${jsFiles.length} JS files, ${files.filter((file) => file.endsWith('.json')).length} JSON files, ${htmlFiles.length} HTML files.`);
}
