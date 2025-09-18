// mixfinder-plus.js
// Node 20+, ESM. Encuentra "matches" por BPM ± tolerancia, armonía (misma o relativa),
// y MISMO GÉNERO; genera "recetas de mix" con tiempos sugeridos para usar en Spotify Mix.
//
// 1) Setup
//   npm init -y
//   npm i spotify-web-api-node dotenv
//   (opcional) en package.json: { "type": "module" }
//   .env:
//     SPOTIFY_CLIENT_ID=...
//     SPOTIFY_CLIENT_SECRET=...
//
// 2) Uso
//   node mixfinder-plus.js "artista - tema" [--tol 4] [--limit 30] [--market AR] \
//       [--harmonic relative|strict|off] [--bars 8] [--genre same|off] [--csv out.csv]
//
// 3) Salida
//   - Lista de combinaciones (seed -> candidato) con BPM/key/genre y \"mix recipe\" (crossfade sugerido,
//     punto de inicio, preset recomendado según energía).

import 'dotenv/config';
import fs from 'node:fs';
import SpotifyWebApi from 'spotify-web-api-node';

const env = process.env;
const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Faltan SPOTIFY_CLIENT_ID o SPOTIFY_CLIENT_SECRET en .env');
  process.exit(1);
}

const api = new SpotifyWebApi({ clientId, clientSecret });

/** --- Utilidades musicales --- */
const KEY_NAMES = ['C','C#/Db','D','Eb','E','F','F#/Gb','G','Ab','A','Bb','B'];
const CAMELOT_MAJOR = ['8B','3B','10B','5B','12B','7B','2B','9B','4B','11B','6B','1B'];
const CAMELOT_MINOR = ['5A','12A','7A','2A','9A','4A','11A','6A','1A','8A','3A','10A'];

const toKeyInfo = (key, mode) => {
  const k = (Number(key) ?? 0) % 12;
  return {
    text: `${KEY_NAMES[k]} ${mode === 1 ? 'Major' : 'Minor'}`,
    camelot: mode === 1 ? CAMELOT_MAJOR[k] : CAMELOT_MINOR[k],
  };
};

const isRelative = (aKey, aMode, bKey, bMode) => {
  if (aMode === 1 && bMode === 0) return bKey === ((aKey + 12 - 3) % 12);
  if (aMode === 0 && bMode === 1) return bKey === ((aKey + 3) % 12);
  return false;
};

/** Fuzzy mapeo de géneros del artista -> seeds válidos de Spotify */
function pickSeedGenres(artistGenres, availableSeeds, max = 2) {
  const seeds = [];
  const norm = (s) => s.toLowerCase();
  const seedsNorm = new Set(availableSeeds.map(norm));

  // heurística 1: si un género del artista contiene exactamente un seed o viceversa
  for (const g of artistGenres.map(norm)) {
    for (const s of seedsNorm) {
      if (g === s || g.includes(s) || s.includes(g)) {
        if (!seeds.includes(s)) seeds.push(s);
      }
    }
  }
  // heurística 2: sinonimias comunes
  const synonyms = [
    ['reggaeton','latin'],
    ['trap argentino','trap'],
    ['argentine rock','rock'],
    ['cumbia','latin'],
    ['k-pop','pop'],
    ['edm','dance'],
  ];
  for (const [a,b] of synonyms) {
    if (artistGenres.map(norm).some(x => x.includes(a)) && seedsNorm.has(b)) {
      if (!seeds.includes(b)) seeds.push(b);
    }
  }
  return seeds.slice(0, max);
}

/** --- API helpers --- */
async function auth() {
  const { body } = await api.clientCredentialsGrant();
  api.setAccessToken(body.access_token);
}

async function searchSeedTrack(q, market='AR') {
  const { body } = await api.searchTracks(q, { limit: 5, market });
  const t = body.tracks?.items?.[0];
  if (!t) return null;
  return t; // full track object
}

async function getAudioFeatures(id) {
  const { body } = await api.getAudioFeaturesForTracks([id]);
  return body.audio_features?.[0] || null;
}

async function getAudioAnalysis(id) {
  const { body } = await api.getAudioAnalysisForTrack(id);
  return body || null;
}

async function getArtistsGenres(artistIds) {
  const { body } = await api.getArtists(artistIds);
  const genresById = new Map();
  for (const a of body.artists || []) {
    genresById.set(a.id, a.genres || []);
  }
  return genresById;
}

async function getAvailableGenreSeeds() {
  const { body } = await api.getAvailableGenreSeeds();
  return body.genres || [];
}

async function getRecs({ seedTrackId, seedGenres = [], tempo, key, mode, tol = 4, limit = 100, market='AR' }) {
  const params = {
    seed_tracks: [seedTrackId],
    limit,
    market,
    min_tempo: Math.max(0, tempo - tol),
    max_tempo: tempo + tol,
    target_tempo: tempo,
    target_key: key,
    target_mode: mode,
  };
  if (seedGenres?.length) params.seed_genres = seedGenres.slice(0, 2);
  const { body } = await api.getRecommendations(params);
  return body.tracks || [];
}

/** --- Mix recipe --- */
function crossfadeSeconds({ tempo, bars = 8, timeSignature = 4 }) {
  const beats = bars * timeSignature; // p.ej., 8 barras * 4 = 32 beats
  return (60 / tempo) * beats; // segs
}

function choosePreset(seedEnergy, nextEnergy) {
  const delta = (nextEnergy ?? 0) - (seedEnergy ?? 0);
  if (delta > 0.1) return 'Rise';
  if (delta < -0.1) return 'Fade';
  return 'Melt'; // neutro
}

function hhmmss(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); const ss = s%60;
  return [h,m,ss].map((x,i)=> i===0?String(x):String(x).padStart(2,'0')).join(':');
}

/** --- Main flujo --- */
async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log('Uso: node mixfinder-plus.js "artista - tema" [--tol 4] [--limit 30] [--market AR] [--harmonic relative|strict|off] [--bars 8] [--genre same|off] [--csv out.csv]');
    process.exit(0);
  }
  const query = args[0];
  const getFlag = (name, def) => {
    const i = args.findIndex(a => a === `--${name}`);
    return i !== -1 && args[i+1] ? args[i+1] : def;
  };
  const tol = Number(getFlag('tol','4'));
  const limit = Number(getFlag('limit','30'));
  const market = getFlag('market','AR');
  const bars = Number(getFlag('bars','8')); // longitud del crossfade en barras
  const harmonic = getFlag('harmonic','relative'); // strict|relative|off
  const genreMode = getFlag('genre','same'); // same|off
  const csvPath = getFlag('csv','');

  await auth();

  const seedTrack = await searchSeedTrack(query, market);
  if (!seedTrack) { console.error('No se encontró el tema.'); process.exit(1); }

  const seedFeat = await getAudioFeatures(seedTrack.id);
  if (!seedFeat) { console.error('Sin audio features del tema seed.'); process.exit(1); }

  const seedArtists = seedTrack.artists?.map(a => a.id) || [];
  const artistGenresMap = await getArtistsGenres(seedArtists);
  const seedGenresAll = seedArtists.flatMap(id => artistGenresMap.get(id) || []);
  const seedsAvail = await getAvailableGenreSeeds();
  const seedGenres = pickSeedGenres(seedGenresAll, seedsAvail, 2);

  const seedKeyInfo = toKeyInfo(seedFeat.key, seedFeat.mode);

  console.log('────────────────────────────────────────');
  console.log(`Seed: ${seedTrack.name} — ${seedTrack.artists.map(a=>a.name).join(', ')}`);
  console.log(`BPM ${seedFeat.tempo.toFixed(1)} | ${seedKeyInfo.text} | Camelot ${seedKeyInfo.camelot}`);
  console.log(`Géneros artista(seed): ${seedGenresAll.join(', ') || 'N/A'}`);
  console.log(`Seeds de género usados: ${seedGenres.join(', ') || 'ninguno'}`);
  console.log(`Filtros: BPM ±${tol}, Harmonic=${harmonic}, Genre=${genreMode}, Market=${market}`);
  console.log('────────────────────────────────────────\n');

  const recs = await getRecs({ seedTrackId: seedTrack.id, seedGenres, tempo: seedFeat.tempo, key: seedFeat.key, mode: seedFeat.mode, tol, limit: 100, market });
  if (!recs.length) { console.log('Sin recomendaciones.'); return; }

  const recIds = recs.map(t => t.id);
  const { body: featuresBody } = await api.getAudioFeaturesForTracks(recIds);
  const featMap = new Map();
  (featuresBody.audio_features||[]).forEach(f => { if (f) featMap.set(f.id, f); });

  // si género same: obtener géneros de artistas recomendados y filtrar por intersección
  let seedGenreSet = new Set(seedGenresAll.map(g=>g.toLowerCase()));

  async function candidateGenres(track) {
    const aIds = track.artists?.map(a=>a.id) || [];
    const { body } = await api.getArtists(aIds);
    const gs = new Set();
    for (const a of body.artists||[]) for (const g of (a.genres||[])) gs.add(g.toLowerCase());
    return gs;
  }

  const combos = [];
  for (const t of recs) {
    const f = featMap.get(t.id);
    if (!f) continue;

    // Filtros BPM + armonía
    const bpmOk = Math.abs(f.tempo - seedFeat.tempo) <= tol;
    let harmClass = 'off';
    if (f.key === seedFeat.key && f.mode === seedFeat.mode) harmClass = 'exact';
    else if (isRelative(seedFeat.key, seedFeat.mode, f.key, f.mode)) harmClass = 'relative';

    let pass = bpmOk;
    if (harmonic === 'strict') pass = pass && (harmClass === 'exact');
    else if (harmonic === 'relative') pass = pass && (harmClass === 'exact' || harmClass === 'relative');

    if (!pass) continue;

    // Filtro de género (same): intersección no vacía
    if (genreMode !== 'off') {
      const gset = await candidateGenres(t);
      const intersects = [...gset].some(g => seedGenreSet.has(g));
      if (!intersects) continue;
    }

    // Cálculo de receta de mix
    const cfSecs = crossfadeSeconds({ tempo: (seedFeat.tempo + f.tempo)/2, bars, timeSignature: seedFeat.time_signature || 4 });
    const preset = choosePreset(seedFeat.energy, f.energy);

    // tiempos recomendados: comenzar transición a (duración_seed - cfSecs)
    const seedStartMs = seedTrack.duration_ms || 0;
    const startAtSeed = Math.max(0, (seedStartMs/1000) - cfSecs);

    combos.push({
      next: t,
      f,
      harmClass,
      cfSecs,
      startAtSeed,
      preset,
    });
  }

  if (!combos.length) { console.log('No hubo matches tras aplicar filtros. Probá --genre off o aumenta --tol.'); return; }

  // Orden: prioridad armonía exacta > relativa, luego |ΔBPM|
  const rank = { exact:0, relative:1, off:2 };
  combos.sort((a,b)=>{
    const c = rank[a.harmClass] - rank[b.harmClass];
    if (c!==0) return c;
    const da = Math.abs(a.f.tempo - seedFeat.tempo);
    const db = Math.abs(b.f.tempo - seedFeat.tempo);
    return da - db;
  });

  const top = combos.slice(0, Math.min(limit, combos.length));

  // Output bonito + CSV opcional
  const lines = [];
  let idx = 1;
  for (const c of top) {
    const kinfo = toKeyInfo(c.f.key, c.f.mode);
    const url = (c.next.external_urls?.spotify) || `https://open.spotify.com/track/${c.next.id}`;
    const delta = Math.abs(c.f.tempo - seedFeat.tempo).toFixed(1);

    const header = `${String(idx).padStart(2,'0')} · ${seedTrack.name}  →  ${c.next.name} — ${c.next.artists.map(a=>a.name).join(', ')}`;
    console.log(header);
    console.log(`     BPM ${seedFeat.tempo.toFixed(1)} → ${c.f.tempo.toFixed(1)} (Δ ${delta}) | ${kinfo.text} | Camelot ${kinfo.camelot} | ${c.harmClass}`);
    console.log(`     Mix recipe → Transition: ${c.cfSecs.toFixed(1)}s | Start at seed: T-${c.cfSecs.toFixed(1)}s (~${hhmmss((seedTrack.duration_ms - c.cfSecs*1000)|0)}) | Preset: ${c.preset}`);
    console.log(`     Listen: ${url}\n`);

    lines.push([
      seedTrack.name,
      seedTrack.artists.map(a=>a.name).join(', '),
      seedFeat.tempo.toFixed(2),
      c.next.name,
      c.next.artists.map(a=>a.name).join(', '),
      c.f.tempo.toFixed(2),
      c.harmClass,
      kinfo.text,
      kinfo.camelot,
      c.cfSecs.toFixed(2),
      (seedTrack.duration_ms/1000 - c.cfSecs).toFixed(2),
      c.preset,
      url,
    ]);
    idx++;
  }

  if (csvPath) {
    const header = 'seed_title,seed_artists,seed_bpm,next_title,next_artists,next_bpm,harmony,key,camelot,crossfade_secs,start_at_seed_secs,preset,url\n';
    const csv = header + lines.map(r => r.map(x => `"${String(x).replaceAll('"','""')}"`).join(',')).join('\n');
    fs.writeFileSync(csvPath, csv);
    console.log(`\nCSV exportado → ${csvPath}`);
  }
}

main().catch(e => {
  if (e?.body?.error?.message) console.error('Spotify API error:', e.body.error.message);
  else console.error(e);
  process.exit(1);
});
