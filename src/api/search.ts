import { SITES_PATH, OBJECTS_API_URL } from "./constants";
import { urlToId, idToUrl, sortUrls } from "./utils";
import { digest } from "./digest";

export function searchUrls(term: string) {
  return allSearchPossibilities(term)
    .map((possibility) => urlToId(possibility))
    .map((prefix) => objectsApiUrl(prefix));
}

export function objectsApiUrl(searchPrefix: string, maxResults = 20) {
  const fullPrefix = encodeURIComponent(SITES_PATH + "/" + searchPrefix);
  return `${OBJECTS_API_URL}?prefix=${fullPrefix}&maxResults=${maxResults}`;
}

export function removePath(url: string) {
  const match = url.match(/[a-zA-Z0-9]\//);
  if (match && match.index) {
    return url.substring(0, match.index + 1);
  }
  return url;
}

function addSubdomains(term: string) {
  if (term.startsWith("http") || term.startsWith("www.")) return [term];
  return [term, "www." + term];
}

function addProtocols(term: string) {
  // if term already prefixed with protocol just return it
  if (term.startsWith("http")) return [term];

  return ["http://" + term, "https://" + term];
}

export function allSearchPossibilities(term: string) {
  return addSubdomains(removePath(term)).flatMap(addProtocols);
}

export async function search(term: string) {
  const rawResults = await Promise.all(
    searchUrls(term).map((url) => fetch(url).then((res) => res.json()))
  );
  return sortUrls(rawResults.flatMap(digest).map(idToUrl));
}
