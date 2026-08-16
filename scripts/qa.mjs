// CI QA: internal links, console errors, and viewport overflow against the built site.
// Exits non-zero on any failure. Run after `npm run build`.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const dist = new URL('../dist/', import.meta.url).pathname;
const port = 4719;
const failures = [];
const fail = (msg) => failures.push(msg);

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
};

const server = createServer(async (req, res) => {
  try {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (path.endsWith('/')) path += 'index.html';
    let file = join(dist, path);
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(dist, path, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(port, r));

const routes = (function walk(dir, prefix = '') {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full, `${prefix}/${name}`);
    if (name === 'index.html') return [`${prefix}/`];
    return [];
  });
})(dist);

const idsByRoute = {};
async function idsFor(route) {
  if (!idsByRoute[route]) {
    const html = await readFile(join(dist, route, 'index.html'), 'utf8');
    idsByRoute[route] = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  }
  return idsByRoute[route];
}

// 1. static link check over built HTML
let linkCount = 0;
for (const route of routes) {
  const ids = await idsFor(route);
  const html = await readFile(join(dist, route, 'index.html'), 'utf8');
  for (const [, href] of html.matchAll(/<a\s[^>]*?href="([^"]+)"/g)) {
    if (href.startsWith('#')) {
      linkCount++;
      if (!ids.has(href.slice(1))) fail(`broken anchor ${route}${href}`);
    } else if (href.startsWith('/') && !href.startsWith('//')) {
      linkCount++;
      const [path, hash] = href.split('#');
      const target = path.endsWith('/') ? path : `${path}/`;
      const file = join(dist, target, 'index.html');
      if (!existsSync(file)) fail(`dead link ${route} → ${href}`);
      else if (hash) {
        const targetIds = await idsFor(target);
        if (!targetIds.has(hash)) fail(`broken anchor ${route} → ${href}`);
      }
    }
  }
  for (const [, src] of html.matchAll(/<(?:link|script|img|source)\s[^>]*?(?:href|src)="(\/[^"]+)"/g)) {
    linkCount++;
    const file = join(dist, src.split('?')[0]);
    if (!existsSync(file)) fail(`missing asset ${route} → ${src}`);
  }
}

// 2. browser sweep: console errors + horizontal overflow
const browser = await chromium.launch();
for (const [vw, vh] of [[360, 800], [390, 844], [768, 1024], [1440, 900]]) {
  const page = await browser.newPage({ viewport: { width: vw, height: vh } });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const route of routes) {
    await page.goto(`http://localhost:${port}${route}`, { waitUntil: 'networkidle' });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > vw + 1) fail(`overflow ${vw}px ${route} (scrollWidth ${sw})`);
  }
  for (const e of errors) fail(`console error: ${e.slice(0, 160)}`);
  await page.close();
}
await browser.close();
server.close();

if (failures.length) {
  console.error(`QA FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log(`QA passed: ${routes.length} routes, ${linkCount} internal links, 4 viewports, no console errors`);
