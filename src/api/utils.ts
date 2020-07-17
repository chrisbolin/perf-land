import { ROOT_URL, SITES_PATH, BUCKET_NAME } from "./constants";

export function urlToId(url: string) {
  return url.replace(/\//g, "");
}

export function idToUrl(id: string) {
  return id.replace(":", "://");
}

function scoreUrlProtocol(url: string) {
  if (url.startsWith("https")) return 3;
  return 0;
}

function scoreUrlLength(url: string) {
  return -url.length;
}

function scoreUrlTLD(url: string) {
  if (url.endsWith(".com")) return 5;
  if (url.endsWith(".org")) return 4;
  return 0;
}

function scoreUrlContents(url: string) {
  if (url.match(/[0-9]/)) return -4;
  return 0;
}

export function scoreUrl(url: string) {
  return (
    scoreUrlProtocol(url) +
    scoreUrlLength(url) +
    scoreUrlTLD(url) +
    scoreUrlContents(url)
  );
}

export function sortUrls(urls: string[]) {
  // returns a sorted copy of the original array
  // sorted descending on score
  return [...urls].sort((urlA, urlB) => scoreUrl(urlB) - scoreUrl(urlA));
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
