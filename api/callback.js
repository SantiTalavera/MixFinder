// /api/callback
export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    res.status(400).send("Missing ?code");
    return;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri
  });

  // fetch nativo está disponible en Vercel
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const json = await r.json();

  // En un flujo real: guardá access_token y refresh_token en tu backend/DB.
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(json, null, 2));
}
