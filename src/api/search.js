const { SITES_PATH, OBJECTS_API_URL } = require("./constants");
const { urlToId, idToUrl, sortUrls } = require("./utils");
const { digest } = require("./digest");

function searchUrls(search) {
  return allSearchPossibilities(search)
    .map((possibility) => urlToId(possibility))
    .map((prefix) => objectsApiUrl(prefix));
}

function objectsApiUrl(searchPrefix, maxResults = 20) {
  const fullPrefix = encodeURIComponent(SITES_PATH + "/" + searchPrefix);
  return `${OBJECTS_API_URL}?prefix=${fullPrefix}&maxResults=${maxResults}`;
}

function removePath(url) {
  const match = url.match(/[a-zA-Z0-9]\//);
  if (match && match.index) {
    return url.substring(0, match.index + 1);
  }
  return url;
}

function addSubdomains(search) {
  if (search.startsWith("http") || search.startsWith("www.")) return [search];
  return [search, "www." + search];
}

function addProtocols(search) {
  // if search already prefixed with protocol just return it
  if (search.startsWith("http")) return [search];

  return ["http://" + search, "https://" + search];
}

function allSearchPossibilities(search) {
  return addSubdomains(removePath(search)).flatMap(addProtocols);
}

async function search(search) {
  const rawResults = await Promise.all(
    searchUrls(search).map((url) => fetch(url).then((res) => res.json()))
  );
  return sortUrls(rawResults.flatMap(digest).map(idToUrl));
}

module.exports = {
  searchUrls,
  objectsApiUrl,
  removePath,
  allSearchPossibilities,
  search,
};
