/**
 * Vercel Serverless Function — /api/videos
 * Proxies requests to the external DavidCyril API to avoid CORS issues.
 */

const API_BASE = "https://apis.davidcyril.name.ng";

const ENDPOINTS = [
  "nacknaija",
  "darknaija",
  "stellaplus",
  "naijacum",
  "naijafap",
  "knackvideos",
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  const results = await Promise.allSettled(
    ENDPOINTS.map(async (slug) => {
      const resp = await fetch(`${API_BASE}/${slug}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.error || !data.downloadUrl)
        throw new Error(data.error ?? "No download URL");
      return {
        id: `${slug}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        slug,
        title: (data.title ?? "Vidéo sans titre").split("\t")[0].trim(),
        thumbnail: data.thumbnail ?? null,
        downloadUrl: data.downloadUrl,
        postUrl: data.postUrl ?? null,
      };
    })
  );

  const videos = [];
  const errors = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      videos.push(r.value);
    } else {
      errors.push(`${ENDPOINTS[i]}: ${r.reason?.message}`);
    }
  }

  return res.json({ videos, errors, total: videos.length });
}
