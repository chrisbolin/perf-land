export const BUCKET_ROOT_URL = `https://storage.googleapis.com/perf-land/`;
export const STORAGE_PREFIX_PATH = `sites/011/`;

export function urlToId(url: string): string {
  return url.replace(/\//g, "");
}

export function urlToStorageUrl(url: string): string {
  return BUCKET_ROOT_URL + STORAGE_PREFIX_PATH + urlToId(url) + ".json";
}
