import {
  urlToId,
  urlToStorageUrl,
  objectsApiUrl,
  searchPrefixes,
  removePath,
} from "./api";

const AOL_URL = "https://www.aol.com/";

describe("urlToId", () => {
  it("converts a URL to an ID", () => {
    const aolId = "https:www.aol.com";
    expect(urlToId(AOL_URL)).toBe(aolId);
  });
});

describe("urlToStorageUrl", () => {
  it("converts a URL to its storage location URL", () => {
    const aolStorageUrl =
      "https://storage.googleapis.com/perf-land/sites/011/https:www.aol.com.json";
    expect(urlToStorageUrl(AOL_URL)).toBe(aolStorageUrl);
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

describe("searchPrefixes", () => {
  it("generates one prefix for fully prefixed searches", () => {
    const search = "https://aol";
    const prefixes = [search];
    expect(searchPrefixes(search)).toEqual(prefixes);
  });

  it("generates http and https prefixes for un-qualified searches", () => {
    const search = "aol";
    const prefixes = ["http://aol", "https://aol"];
    expect(searchPrefixes(search)).toEqual(prefixes);
  });

  it("removes any path", () => {
    const search = "aol.com/about/";
    const prefixes = ["http://aol.com", "https://aol.com"];
    expect(searchPrefixes(search)).toEqual(prefixes);
  });
});
