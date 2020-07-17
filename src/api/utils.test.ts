import { urlToId, idToUrl, sortUrls, urlToStorageUrl } from "./utils";

describe("urlToId", () => {
  it("converts a URL to an ID", () => {
    const aolUrl = "https://www.aol.com/";
    const aolId = "https:www.aol.com";
    expect(urlToId(aolUrl)).toBe(aolId);
  });
});

describe("idToUrl", () => {
  it("converts an ID to the URL", () => {
    const aolId = "https:www.aol.com";
    const aolUrl = "https://www.aol.com";
    expect(idToUrl(aolId)).toBe(aolUrl);
  });
});

describe("sortUrls", () => {
  it("sorts urls according to relevance", () => {
    const urls = [
      "http://123.ru",
      "http://g-karty.ru",
      "http://google.com",
      "http://google.de",
      "https://google.com",
      "https://google.org",
      "https://www.google.com",
      "https://drive.google.com",
    ];

    const sortedUrls = [
      "https://google.com",
      "https://google.org",
      "http://google.com",
      "https://www.google.com",
      "http://google.de",
      "https://drive.google.com",
      "http://123.ru",
      "http://g-karty.ru",
    ];
    expect(sortUrls(urls)).toEqual(sortedUrls);
  });
});

describe("urlToStorageUrl", () => {
  it("converts a URL to its storage location URL", () => {
    const aolUrl = "https://www.aol.com/";
    const aolStorageUrl =
      "https://storage.googleapis.com/perf-land/sites/011/https:www.aol.com.json";
    expect(urlToStorageUrl(aolUrl)).toBe(aolStorageUrl);
  });
});
