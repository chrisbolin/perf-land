import { urlToId, urlToStorageUrl } from "./api";

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
