// MixFinder Plus via Vercel Proxy (sin /recommendations)
// Ejecutar:
//   node src/sourceCode.js "Bizarrap - Quevedo" --tol 4 --harmonic relative --genre same --bars 8 --market AR --limit 30 --csv data/resultados.csv

import 'dotenv/config';
import fs from 'node:fs';

// ====== CONFIG: tu dominio Vercel del proxy ======
const ORIGIN = 'https://mix-finder.vercel.app'; // <-- CAMBIAR por tu dominio real

async function proxy(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${ORIGIN}/api/spotify-proxy?path=${encodeURIComponent(path)}${qs ? '&' + qs : ''}`;
  const r = await fetch(url);
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Proxy ${r.status}: ${txt.slice(0, 300)}`);
  }
  return r.json();
}

/* ===================== Utilidades música ===================== */
const KEY_NAMES = ['C','C#/Db','D','Eb','E','F','F#/Gb','G','Ab','A','Bb','B'];
const CAMELOT_MAJOR = ['8B','3B','10B','5B','12B','7B','2B','9B','4B','11B','6B','1B'];
const CAMELOT_MINOR = ['5A','12A','7A','2A','9A','4A','11A','6A','1A','8A','3A','10A'];

function toKeyInfo(key, mode) {
  const k = (Number(key) ?? 0) % 12;
  return {
    text: `${KEY_NAMES[k]} ${mode === 1 ? 'Major' : 'Minor'}`,
    camelot: mode === 1 ? CAMELOT_MAJOR[k] : CAMELOT_MINOR[k],
  };
}
function isRelative(aKey, aMode, bKey, bMode) {
  if (aMode === 1 && bMode === 0) return bKey === ((aKey + 12 - 3) % 12);
  if (aMode === 0 && bMode === 1) return bKey === ((aKey + 3) % 12);
  return false;
}
function crossfadeSeconds({ tempo, bars = 8, timeSignature = 4 }) {
  const beats = bars * timeSignature;
  return (60 / tempo) * beats;
}
function choosePreset(seedEnergy, nextEnergy) {
  const delta = (nextEnergy ?? 0) - (seedEnergy ?? 0);
  if (delta >  0.1) return 'Rise';
  if (delta < -0.1) return 'Fade';
  return 'Melt';
}
function hhmmss(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); const ss = s%60;
  return [h,m,ss].map((x,i)=> i===0?String(x):String(x).padStart(2,'0')).join(':');
}

/* ===================== Wrappers vía proxy ===================== */
async function searchTrack(q, market='AR') {
  try {
    const body = await proxy('v1/search', { type:'track', q, market, limit:5 });
    const t = body.tracks?.items?.[0];
    if (!t) return null;
    return {
      id: t.id,
      name: t.name,
      artists: t.artists?.map(a=>a.name).join(', ') || 'Unknown',
      url: t.external_urls?.spotify,
      duration_ms: t.duration_ms,
      artistIds: t.artists?.map(a=>a.id) || [],
    };
  } catch {
    const body = await proxy('v1/search', { type:'track', q, market:'US', limit:5 });
    const t = body.tracks?.items?.[0];
    if (!t) return null;
    return {
      id: t.id,
      name: t.name,
      artists: t.artists?.map(a=>a.name).join(', ') || 'Unknown',
      url: t.external_urls?.spotify,
      duration_ms: t.duration_ms,
      artistIds: t.artists?.map(a=>a.id) || [],
    };
  }
}

async function getAudioFeatures(ids) {
  const body = await proxy('v1/audio-features', { ids: ids.join(',') });
  const map = new Map();
  (body.audio_features || []).forEach(f => { if (f) map.set(f.id, f); });
  return map;
}

async function getArtistsGenres(artistIds) {
  if (!artistIds?.length) return new Map();
  const body = await proxy('v1/artists', { ids: artistIds.join(',') });
  const m = new Map();
  for (const a of (body.artists || [])) m.set(a.id, a.genres || []);
  return m;
}

async function getArtist(id) {
  return proxy(`v1/artists/${id}`);
}
async function getRelatedArtists(id) {
  const b = await proxy(`v1/artists/${id}/related-artists`);
  return b.artists || [];
}
async function getTopTracks(artistId, market='US') {
  try {
    const b = await proxy(`v1/artists/${artistId}/top-tracks`, { market });
    return b.tracks || [];
  } catch {
    const b = await proxy(`v1/artists/${artistId}/top-tracks`, { market:'US' });
    return b.tracks || [];
  }
}

async function getCandidatesFromArtists(seedArtistIds, market='AR', maxArtists=6) {
  const seen = new Set();
  const allArtists = [];

  for (const id of (seedArtistIds || []).slice(0,2)) {
    const a = await getArtist(id);
    if (a && !seen.has(a.id)) { seen.add(a.id); allArtists.push(a); }
  }
  for (const id of (seedArtistIds || []).slice(0,2)) {
    const rel = await getRelatedArtists(id);
    for (const a of rel) {
      if (!seen.has(a.id)) { seen.add(a.id); allArtists.push(a); }
      if (allArtists.length >= maxArtists) break;
    }
    if (allArtists.length >= maxArtists) break;
  }

  const tracks = [];
  for (const a of allArtists) {
    const tt = await getTopTracks(a.id, market);
    tracks.push(...tt);
  }
  return tracks;
}

/* ========================= Main CLI ======================= */
async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log('Uso: node src/sourceCode.js "artista - tema" [--tol 4] [--limit 30] [--market AR] [--harmonic relative|strict|off] [--bars 8] [--genre same|off] [--csv out.csv]');
    process.exit(0);
  }
  const query = args[0];
  const getFlag = (name, def) => {
    const i = args.findIndex(a => a === `--${name}`);
    return i !== -1 && args[i+1] ? args[i+1] : def;
  };
  const tol      = Number(getFlag('tol','4'));
  const limit    = Number(getFlag('limit','30'));
  const market   = getFlag('market','AR');
  const bars     = Number(getFlag('bars','8'));
  const harmonic = getFlag('harmonic','relative');
  const genreMd  = getFlag('genre','same');
  const csvPath  = getFlag('csv','');

  // Seed
  const seed = await searchTrack(query, market);
  if (!seed) { console.error('No se encontró el tema.'); process.exit(1); }

  const seedFeat = (await getAudioFeatures([seed.id])).get(seed.id);
  if (!seedFeat) { console.error('Sin audio features del seed.'); process.exit(1); }

  // Géneros del seed
  const genresMap = await getArtistsGenres(seed.artistIds);
  const seedGenresAll = seed.artistIds.flatMap(id => genresMap.get(id) || []);
  const seedGenreSet = new Set(seedGenresAll.map(g => g.toLowerCase()));
  const seedKeyInfo = toKeyInfo(seedFeat.key, seedFeat.mode);

  console.log('────────────────────────────────────────');
  console.log(`Seed: ${seed.name} — ${seed.artists}`);
  console.log(`BPM ${seedFeat.tempo.toFixed(1)} | ${seedKeyInfo.text} | Camelot ${seedKeyInfo.camelot}`);
  console.log(`Géneros artista(seed): ${seedGenresAll.join(', ') || 'N/A'}`);
  console.log(`Filtros: BPM ±${tol}, Harmonic=${harmonic}, Genre=${genreMd}, Market=${market}`);
  console.log('────────────────────────────────────────\n');

  // Candidatos desde artistas relacionados + top tracks
  const candidates = await getCandidatesFromArtists(seed.artistIds, market, 8);
  if (!candidates.length) { console.log('Sin candidatos de artistas/top-tracks.'); return; }

  // Features de candidatos
  const candIds = candidates.map(t => t.id);
  const featMap = await getAudioFeatures(candIds);

  // Helper géneros por track
  async function candidateGenres(track) {
    const aIds = track.artists?.map(a=>a.id) || [];
    if (!aIds.length) return new Set();
    const b = await proxy('v1/artists', { ids: aIds.join(',') });
    const s = new Set();
    for (const a of (b.artists || [])) for (const g of (a.genres || [])) s.add(g.toLowerCase());
    return s;
  }

  const combos = [];
  for (const t of candidates) {
    const f = featMap.get(t.id);
    if (!f) continue;

    const bpmOk = Math.abs(f.tempo - seedFeat.tempo) <= tol;
    let harmClass = 'off';
    if (f.key === seedFeat.key && f.mode === seedFeat.mode) harmClass = 'exact';
    else if (isRelative(seedFeat.key, seedFeat.mode, f.key, f.mode)) harmClass = 'relative';

    let pass = bpmOk;
    if (harmonic === 'strict')   pass = pass && harmClass === 'exact';
    if (harmonic === 'relative') pass = pass && (harmClass === 'exact' || harmClass === 'relative');
    if (!pass) continue;

    if (genreMd !== 'off') {
      const gset = await candidateGenres(t);
      const intersects = [...gset].some(g => seedGenreSet.has(g));
      if (!intersects) continue;
    }

    const avgTempo = (seedFeat.tempo + f.tempo) / 2;
    const cfSecs = crossfadeSeconds({ tempo: avgTempo, bars, timeSignature: seedFeat.time_signature || 4 });
    const preset = choosePreset(seedFeat.energy, f.energy);
    const startAtSeed = Math.max(0, (seed.duration_ms/1000) - cfSecs);

    combos.push({ t, f, harmClass, cfSecs, startAtSeed, preset });
  }

  if (!combos.length) {
    console.log('No hubo matches tras filtros. Probá --genre off o aumentá --tol.');
    return;
  }

  // Ranking
  const rank = { exact:0, relative:1, off:2 };
  combos.sort((a,b)=>{
    const c = rank[a.harmClass] - rank[b.harmClass];
    if (c!==0) return c;
    const da = Math.abs(a.f.tempo - seedFeat.tempo);
    const db = Math.abs(b.f.tempo - seedFeat.tempo);
    return da - db;
  });

  const top = combos.slice(0, Math.min(limit, combos.length));
  const lines = [];
  let i = 1;

  for (const c of top) {
    const kinfo = toKeyInfo(c.f.key, c.f.mode);
    const url = c.t.external_urls?.spotify || `https://open.spotify.com/track/${c.t.id}`;
    const delta = Math.abs(c.f.tempo - seedFeat.tempo).toFixed(1);

    console.log(`${String(i).padStart(2,'0')} · ${seed.name}  →  ${c.t.name} — ${c.t.artists.map(a=>a.name).join(', ')}`);
    console.log(`     BPM ${seedFeat.tempo.toFixed(1)} → ${c.f.tempo.toFixed(1)} (Δ ${delta}) | ${kinfo.text} | Camelot ${kinfo.camelot} | ${c.harmClass}`);
    console.log(`     Mix recipe → Transition: ${c.cfSecs.toFixed(1)}s | Start at seed: T-${c.cfSecs.toFixed(1)}s (~${hhmmss((seed.duration_ms - c.cfSecs*1000)|0)}) | Preset: ${c.preset}`);
    console.log(`     Listen: ${url}\n`);

    lines.push([
      seed.name,
      seed.artists,
      seedFeat.tempo.toFixed(2),
      c.t.name,
      c.t.artists.map(a=>a.name).join(', '),
      c.f.tempo.toFixed(2),
      c.harmClass,
      kinfo.text,
      kinfo.camelot,
      c.cfSecs.toFixed(2),
      (seed.duration_ms/1000 - c.cfSecs).toFixed(2),
      c.preset,
      url
    ]);
    i++;
  }

  if (csvPath) {
    const header = 'seed_title,seed_artists,seed_bpm,next_title,next_artists,next_bpm,harmony,key,camelot,crossfade_secs,start_at_seed_secs,preset,url\n';
    const csv = header + lines.map(r => r.map(x => `"${String(x).replaceAll('"','""')}"`).join(',')).join('\n');
    fs.writeFileSync(csvPath, csv);
    console.log(`CSV exportado → ${csvPath}`);
  }
}

main().catch(e => {
  console.error('ERROR:', e?.message || String(e));
  process.exit(1);
});
