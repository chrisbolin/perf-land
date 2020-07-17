const {
  searchUrls,
  objectsApiUrl,
  allSearchPossibilities,
  removePath,
  search,
} = require("./search");

beforeAll(() => {
  // polyfill
  require("whatwg-fetch");
});

describe("searchUrls", () => {
  it("creates all suggested api urls", () => {
    const search = "formidable";
    const urls = [
      "https://storage.googleapis.com/storage/v1/b/perf-land/o/?prefix=sites%2F011%2Fhttp%3Aformidable&maxResults=20",
      "https://storage.googleapis.com/storage/v1/b/perf-land/o/?prefix=sites%2F011%2Fhttps%3Aformidable&maxResults=20",
      "https://storage.googleapis.com/storage/v1/b/perf-land/o/?prefix=sites%2F011%2Fhttp%3Awww.formidable&maxResults=20",
      "https://storage.googleapis.com/storage/v1/b/perf-land/o/?prefix=sites%2F011%2Fhttps%3Awww.formidable&maxResults=20",
    ];
    expect(searchUrls(search)).toEqual(urls);
  });
});

describe("searchUrls", () => {
  it("handles protocol given", () => {
    const search = "https://formidable";
    const urls = [
      "https://storage.googleapis.com/storage/v1/b/perf-land/o/?prefix=sites%2F011%2Fhttps%3Aformidable&maxResults=20",
    ];
    expect(searchUrls(search)).toEqual(urls);
  });
});

describe("searchUrls", () => {
  it("handles exact URL", () => {
    const search = "https://formidable.com/";
    const urls = [
      "https://storage.googleapis.com/storage/v1/b/perf-land/o/?prefix=sites%2F011%2Fhttps%3Aformidable.com&maxResults=20",
    ];
    expect(searchUrls(search)).toEqual(urls);
  });
});

describe("searchUrls", () => {
  it("handles stripping paths", () => {
    const search = "https://formidable.com/about/";
    const urls = [
      "https://storage.googleapis.com/storage/v1/b/perf-land/o/?prefix=sites%2F011%2Fhttps%3Aformidable.com&maxResults=20",
    ];
    expect(searchUrls(search)).toEqual(urls);
  });
});

describe("objectsApiUrl", () => {
  it("creates storage url for listing all objects with prefix", () => {
    const prefix = "https:aol";
    const listUrl =
      "https://storage.googleapis.com/storage/v1/b/perf-land/o/?prefix=sites%2F011%2Fhttps%3Aaol&maxResults=20";
    expect(objectsApiUrl(prefix)).toBe(listUrl);
  });
});

describe("removePath", () => {
  it("doesn't change urls without paths", () => {
    const url = "https://www.aol.com";
    expect(removePath(url)).toBe(url);
  });

  it("removes paths", () => {
    const url = "https://www.aol.com/about";
    const urlWithoutPath = "https://www.aol.com";
    expect(removePath(url)).toBe(urlWithoutPath);
  });

  it("removes trailing slash", () => {
    const url = "https://www.aol.com/";
    const urlWithoutPath = "https://www.aol.com";
    expect(removePath(url)).toBe(urlWithoutPath);
  });
});

describe("allSearchPossibilities", () => {
  it("generates one prefix for fully prefixed searches", () => {
    const search = "https://aol";
    const prefixes = [search];
    expect(allSearchPossibilities(search)).toEqual(prefixes);
  });

  it("generates http and https prefixes for un-qualified searches", () => {
    const search = "aol";
    const prefixes = [
      "http://aol",
      "https://aol",
      "http://www.aol",
      "https://www.aol",
    ];
    expect(allSearchPossibilities(search)).toEqual(prefixes);
  });

  it("removes any path", () => {
    const search = "https://aol.com/about/";
    const prefixes = ["https://aol.com"];
    expect(allSearchPossibilities(search)).toEqual(prefixes);
  });
});

describe("search", () => {
  it("fetches results", async () => {
    const results = await search("formidable");
    expect(results).toEqual([
      "https://formidable.com",
      "https://www.formidable.com",
      "https://formidableforms.com",
    ]);
  });
});
