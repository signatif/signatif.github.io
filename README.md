# signatif.github.io

Website for [Signatif](https://github.com/CalConnect/cc-signatif) — the
Sealed Interoperable Graduated Non-repudiable Anchored Trust Infrastructure
Framework, a CalConnect standard.

Built with Astro, Vue islands, and Tailwind CSS (via the Vite plugin).
Fonts are self-hosted (IBM Plex Sans, IBM Plex Mono).

## Commands

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm install`     | Install dependencies                      |
| `npm run dev`     | Dev server at `localhost:4321`            |
| `npm run build`   | Production build to `./dist/`             |
| `npm run preview` | Preview the build locally                 |

## Deploying

Pushes to `main` deploy via the GitHub Actions workflow in
`.github/workflows/deploy.yml`. The repository must be named
`signatif.github.io` under the `signatif` account, with Pages enabled and
"GitHub Actions" selected as the build source.
