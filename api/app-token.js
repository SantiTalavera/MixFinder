export default async function handler(req, res) {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;

  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });

  const json = await r.json();
  if (!r.ok) return res.status(r.status).json(json);

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
  res.status(200).json(json); // { access_token, token_type, expires_in }
}
