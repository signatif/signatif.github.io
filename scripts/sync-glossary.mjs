// Rebuild src/data/terms.json (including related-term cross-links) from the
// spec's terms clause. Run after the spec's clause 3 changes:
//   npm run sync-glossary
// Fetches the current source from CalConnect/cc-signatif main.
const SPEC_URL =
  'https://raw.githubusercontent.com/CalConnect/cc-signatif/main/spec/signatif-standard/sections/03-terms.adoc';

const src = await (await fetch(SPEC_URL)).text();

const blocks = src.split(/^==== /m).slice(1);
const entries = [];
for (const b of blocks) {
  const lines = b.split('\n');
  const term = lines[0].trim().replace(/\s+/g, ' ');
  let alt = '';
  const body = [];
  for (const l of lines.slice(1)) {
    if (l.startsWith('alt:[')) {
      alt = l.slice(5, -1);
      continue;
    }
    if (/^(NOTE|EXAMPLE|\.)/.test(l)) break;
    body.push(l);
  }
  const def = body.join(' ').replace(/\{\{([^,}]+)(?:,[^}]+)?\}\}/g, '$1').replace(/\s+/g, ' ').trim();
  const related = [...body.join(' ').matchAll(/\{\{([^,}]+)(?:,[^}]+)?\}\}/g)]
    .map((m) => m[1].replace(/\s+/g, ' ').trim());
  entries.push({ term, alt, def, related: [...new Set(related)] });
}

const names = new Set(entries.map((e) => e.term));
for (const e of entries) {
  e.related = e.related.filter((r) => r !== e.term && names.has(r));
  if (!e.related.length) delete e.related;
}

entries.sort((a, b) => a.term.localeCompare(b.term));
const { writeFile } = await import('node:fs/promises');
await writeFile('src/data/terms.json', JSON.stringify(entries, null, 2) + '\n');
console.log(`synced ${entries.length} terms (${entries.filter((e) => e.related).length} cross-linked)`);
