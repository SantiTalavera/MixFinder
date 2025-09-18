// /api/login
export default function handler(req, res) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI; // e.g. https://tuapp.vercel.app/api/callback
  const scope = [
    "playlist-modify-public",
    "playlist-modify-private"
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope
  });

  res.setHeader("Cache-Control", "no-store");
  res.redirect("https://accounts.spotify.com/authorize?" + params.toString());
}
