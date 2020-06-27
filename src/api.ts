const ROOT_URL = `https://storage.googleapis.com`;
const BUCKET_NAME = "perf-land";
const SITES_PATH = "sites/011";

const OBJECTS_API_URL = `${ROOT_URL}/storage/v1/b/${BUCKET_NAME}/o/`;

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

export function objectsApiUrl(search: string, maxResults = 20): string {
  const fullPrefix = encodeURIComponent(SITES_PATH + "/" + search);
  return `${OBJECTS_API_URL}?prefix=${fullPrefix}&maxResults=${maxResults}`;
}

export function removePath(url: string): string {
  const match = url.match(/[a-zA-Z0-9]\//);
  if (match && match.index) {
    return url.substring(0, match.index + 1);
  }
  return url;
}

export function searchPrefixes(search: string): string[] {
  let correctedSearch = removePath(search);

  // search already prefixes protocol, just return it
  if (correctedSearch.startsWith("http")) return [correctedSearch];

  return ["http://" + correctedSearch, "https://" + correctedSearch];
}
