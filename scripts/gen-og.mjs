import { readFileSync } from 'node:fs';
import satori from 'satori';
import sharp from 'sharp';

const { site } = (await import('../astro.config.mjs')).default;
const HOST = new URL(site).host;

const archivo650 = readFileSync('scripts/fonts/archivo-650-wide.ttf');
const archivo500 = readFileSync('scripts/fonts/archivo-500-wide.ttf');

// guilloche rosette as data-uri svg
const rings = 22;
const cx = 100, cy = 100;
let paths = '';
for (let i = 0; i < rings; i++) {
  const base = 6 + i * 3.1;
  const amp = 9 + 5 * Math.sin(i * 0.7 + 2);
  const k = 6 + ((i * 3 + 14) % 5);
  let d = '';
  for (let a = 0; a <= 360; a += 3) {
    const t = (a * Math.PI) / 180;
    const r = base + amp * Math.sin(k * t + i * 0.37);
    d += `${a === 0 ? 'M' : 'L'}${(cx + r * Math.cos(t)).toFixed(1)} ${(cy + r * Math.sin(t)).toFixed(1)}`;
  }
  paths += `<path d="${d}Z"/>`;
}
const guilloche = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="#25618C" stroke-width="0.45" opacity="0.5">${paths}</svg>`,
).toString('base64')}`;

const seal = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#A93A28"><circle cx="32" cy="32" r="26" stroke-width="5"/><path d="M20 33.5 28.5 42 44.5 23.5" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
).toString('base64')}`;

const PAGES = [
  {
    file: 'og.png',
    title: 'Evidence, not faith.',
    subtitle: 'Trust infrastructure for verifiable artifacts in regulated industries. A CalConnect standard.',
  },
  {
    file: 'og/framework.png',
    eyebrow: 'FRAMEWORK',
    title: 'A trust graph over signed artifacts',
    subtitle: 'Authorities, monotonic scope narrowing, threshold signing, and offline verification from trust anchors.',
  },
  {
    file: 'og/verification.png',
    eyebrow: 'VERIFICATION',
    title: 'Objective reports, published policies, deliberate decisions',
    subtitle: 'Hard and soft checks, path-finding in the trust graph, graduated classification labels.',
  },
  {
    file: 'og/principles.png',
    eyebrow: 'PRINCIPLES',
    title: 'Eight letters, each one a requirement',
    subtitle: 'Sealed, Interoperable, Graduated, Non-repudiable, Anchored, Trust, Infrastructure, Framework.',
  },
  {
    file: 'og/comparison.png',
    eyebrow: 'COMPARISON',
    title: 'Where the incumbents stop, and why',
    subtitle: 'Traditional PKI, code-signing transparency, blockchain attestation, and W3C Verifiable Credentials.',
  },
  {
    file: 'og/requirements.png',
    eyebrow: 'REQUIREMENTS',
    title: 'The registry of requirements classes',
    subtitle: '118 requirements across 14 classes, each paired with a conformance class and abstract test.',
  },
  {
    file: 'og/schemes.png',
    eyebrow: 'FOR SCHEMES',
    title: 'Build your domain on Signatif',
    subtitle: 'Registries, scope dimensions, classification policies — and the EU Digital Product Passport.',
  },
  {
    file: 'og/domains.png',
    eyebrow: 'DOMAINS',
    title: 'Where certificates carry consequences',
    subtitle: 'Legal metrology, pharmaceuticals, food safety, and defense procurement.',
  },
  {
    file: 'og/glossary.png',
    eyebrow: 'GLOSSARY',
    title: 'The vocabulary of the framework',
    subtitle: 'Every defined term from clause 3 of the standard, from trust authorities to classification labels.',
  },
  {
    file: 'og/implementations.png',
    eyebrow: 'IMPLEMENTATIONS',
    title: 'Requirements, not products',
    subtitle: 'Conformance classes make claims testable. Listings state claims; they do not certify them.',
  },
  {
    file: 'og/about.png',
    eyebrow: 'ABOUT',
    title: 'From Latin signare — to mark with a seal',
    subtitle: 'The name states the premise: trustworthiness is established by what is verifiably signed.',
  },
];

const titleSize = (t) => (t.length <= 26 ? 64 : t.length <= 44 ? 54 : 46);

function card({ eyebrow, title, subtitle }) {
  const head = eyebrow
    ? { type: 'div', props: { style: { fontSize: 24, fontWeight: 600, letterSpacing: 4, color: '#25618C' }, children: eyebrow } }
    : null;
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 64,
        backgroundColor: '#F6F8FA',
        backgroundImage: 'linear-gradient(to right, #E7EDF2 1px, transparent 1px), linear-gradient(to bottom, #E7EDF2 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        fontFamily: 'Archivo',
        color: '#17222E',
        position: 'relative',
      },
      children: [
        { type: 'img', props: { src: guilloche, width: 460, height: 460, style: { position: 'absolute', right: -80, top: -110 } } },
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: 14 },
            children: [
              { type: 'img', props: { src: seal, width: 44, height: 44 } },
              { type: 'div', props: { style: { fontSize: 30, fontWeight: 600, letterSpacing: 0.5, color: '#17222E' }, children: 'Signatif' } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 16 },
            children: [
              ...(head ? [head] : []),
              { type: 'div', props: { style: { fontSize: titleSize(title), fontWeight: 650, lineHeight: 1.05, letterSpacing: -0.5, maxWidth: 900 }, children: title } },
              { type: 'div', props: { style: { fontSize: 26, color: '#4E5D6D', maxWidth: 860, lineHeight: 1.4 }, children: subtitle } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #C7D3DD', paddingTop: 20, fontSize: 21, color: '#626D79' },
            children: [
              { type: 'div', props: { children: 'SEALED · INTEROPERABLE · GRADUATED · NON-REPUDIABLE · ANCHORED' } },
              { type: 'div', props: { children: HOST } },
            ],
          },
        },
      ],
    },
  };
}

for (const page of PAGES) {
  const svg = await satori(card(page), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Archivo', data: archivo500, style: 'normal', weight: 500 },
      { name: 'Archivo', data: archivo650, style: 'normal', weight: 650 },
    ],
  });
  await sharp(Buffer.from(svg)).png().toFile(`public/${page.file}`);
  console.log('wrote', `public/${page.file}`);
}
