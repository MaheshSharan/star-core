const TMDB_MIRROR = "https://db.videasy.to/3"

const originalFetch = globalThis.fetch

globalThis.fetch = async (input, init) => {
  let url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url

  if (url.startsWith("https://api.themoviedb.org/3")) {
    url = url.replace("https://api.themoviedb.org/3", TMDB_MIRROR)
  }

  return originalFetch(url, init)
}
