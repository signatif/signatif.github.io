import { readFileSync } from 'node:fs';
import satori from 'satori';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;

const archivo = readFileSync('scripts/fonts/archivo-650-wide.ttf');

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

const element = {
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
      {
        type: 'img',
        props: { src: guilloche, width: 460, height: 460, style: { position: 'absolute', right: -80, top: -110 } },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', gap: 14 },
          children: [
            { type: 'img', props: { src: seal, width: 44, height: 44 } },
            {
              type: 'div',
              props: {
                style: { fontSize: 30, fontWeight: 600, letterSpacing: 0.5, color: '#17222E' },
                children: 'Signatif',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', gap: 18 },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 76, fontWeight: 650, lineHeight: 1.05, letterSpacing: -1, maxWidth: 900 },
                children: 'Evidence, not faith.',
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: 27, color: '#4E5D6D', maxWidth: 860, lineHeight: 1.4 },
                children: 'Trust infrastructure for verifiable artifacts in regulated industries. A CalConnect standard.',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid #C7D3DD',
            paddingTop: 20,
            fontSize: 21,
            color: '#626D79',
          },
          children: [
            {
              type: 'div',
              props: { children: 'SEALED · INTEROPERABLE · GRADUATED · NON-REPUDIABLE · ANCHORED' },
            },
            { type: 'div', props: { children: 'www.signatif.org' } },
          ],
        },
      },
    ],
  },
};

const svg = await satori(element, {
  width: WIDTH,
  height: HEIGHT,
  fonts: [
    { name: 'Archivo', data: readFileSync('scripts/fonts/archivo-500-wide.ttf'), style: 'normal', weight: 500 },
    
    { name: 'Archivo', data: archivo, style: 'normal', weight: 650 },
  ],
});

await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('wrote public/og.png');
