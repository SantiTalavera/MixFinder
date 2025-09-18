export default async function handler(req, res) {
  const ORIGIN = process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`;
  const tokenResp = await fetch(`${ORIGIN}/api/app-token`);
  const tokJson = await tokenResp.json();
  const access_token = tokJson.access_token;

  const { path = "", ...rest } = req.query;
  const url = `https://api.spotify.com/${path}`;
  const qs = new URLSearchParams(rest).toString();
  const full = qs ? `${url}?${qs}` : url;

  const r = await fetch(full, { headers: { Authorization: `Bearer ${access_token}` } });
  const txt = await r.text();
  res.status(r.status).send(txt);
}
