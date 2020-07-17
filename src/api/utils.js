function urlToId(url) {
  return url.replace(/\//g, "");
}

function idToUrl(id) {
  return id.replace(":", "://");
}

function scoreUrlProtocol(url) {
  if (url.startsWith("https")) return 3;
  return 0;
}
function scoreUrlLength(url) {
  return -url.length;
}
function scoreUrlTLD(url) {
  if (url.endsWith(".com")) return 5;
  if (url.endsWith(".org")) return 4;
  return 0;
}

function scoreUrlContents(url) {
  if (url.match(/[0-9]/)) return -4;
  return 0;
}

function scoreUrl(url) {
  return (
    scoreUrlProtocol(url) +
    scoreUrlLength(url) +
    scoreUrlTLD(url) +
    scoreUrlContents(url)
  );
}

function sortUrls(urls) {
  // returns a sorted copy of the original array
  // sorted descending on score
  return [...urls].sort((urlA, urlB) => scoreUrl(urlB) - scoreUrl(urlA));
}

module.exports = {
  urlToId,
  idToUrl,
  sortUrls,
  scoreUrl,
};
