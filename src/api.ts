const ROOT_URL = `https://storage.googleapis.com`;
const BUCKET_NAME = "perf-land";
const SITES_PATH = "sites/011";

export function urlToId(url: string): string {
  return url.replace(/\//g, "");
}

export function urlToStorageUrl(url: string): string {
  return (
    ROOT_URL +
    "/" +
    BUCKET_NAME +
    "/" +
    SITES_PATH +
    "/" +
    urlToId(url) +
    ".json"
  );
}
