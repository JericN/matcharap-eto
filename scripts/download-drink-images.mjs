// Download + validate + thumbnail the candidate photos. Keeps up to KEEP valid
// images per drink under public/drinks/<slug>/, and writes the seed manifest
// (keyed by drink NAME) to /tmp/drink-img-manifest.json.
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync, copyFileSync } from 'node:fs';

const KEEP = 8;
const MINPX = 380;       // reject tiny/broken images
const MAXPX = 640;       // thumbnail long edge (commercial license → resize OK)
const UA = 'matcharap-eto-research/1.0';
const cands = JSON.parse(execSync('cat /tmp/drink-img-candidates.json').toString());
const PUB = 'public/drinks';

const sh = (cmd) => execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
const manifest = {};

for (const [slug, { name, candidates }] of Object.entries(cands)) {
  const dir = `${PUB}/${slug}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const kept = [];
  for (const c of candidates) {
    if (kept.length >= KEEP) break;
    const tmp = `/tmp/dl_${slug}.img`;
    try {
      execSync(`curl -sL --max-time 25 -A "${UA}" -o "${tmp}" "${c.url}"`, { stdio: 'ignore' });
      if (!existsSync(tmp)) continue;
      // validate it's a real raster image of decent size
      const info = sh(`sips -g pixelWidth -g pixelHeight "${tmp}" 2>/dev/null || true`);
      const w = +(info.match(/pixelWidth: (\d+)/)?.[1] ?? 0);
      const h = +(info.match(/pixelHeight: (\d+)/)?.[1] ?? 0);
      if (w < MINPX || h < MINPX) continue;
      const n = kept.length + 1;
      const dest = `${dir}/${n}.jpg`;
      copyFileSync(tmp, dest);
      execSync(`sips -s format jpeg -s formatOptions 72 --resampleHeightWidthMax ${MAXPX} "${dest}" --out "${dest}"`, { stdio: 'ignore' });
      kept.push({ src: `/drinks/${slug}/${n}.jpg`, source: c.source, credit: c.credit.slice(0, 90) });
    } catch { /* skip bad download */ }
  }
  manifest[name] = kept;
  console.error(`${slug}: kept ${kept.length}`);
}
import('node:fs').then(({ writeFileSync }) => {
  writeFileSync('/tmp/drink-img-manifest.json', JSON.stringify(manifest, null, 2));
  console.error('manifest written');
});
