import { urlToId, urlToStorageUrl, objectsApiUrl } from "./api";

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
    const prefix = "https:google";
    const listUrl =
      "https://storage.googleapis.com/storage/v1/b/perf-land/o/?prefix=sites%2F011%2Fhttps%3Agoogle&maxResults=20";
    expect(objectsApiUrl(prefix)).toBe(listUrl);
  });
});
