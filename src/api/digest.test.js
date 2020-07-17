const { digest } = require("./digest");

describe("digest", () => {
  it("handles results without items", () => {
    const data = {
      kind: "storage#objects",
    };
    const results = [];
    expect(digest(data)).toEqual(results);
  });

  it("returns ID of results", () => {
    const data = {
      kind: "storage#objects",
      nextPageToken: "CiJzaXRlcy8wMTEvaHR0cHM6Z29vZ2xlZGluby5ydS5qc29u",
      items: [
        {
          kind: "storage#object",
          id: "perf-land/sites/011/https:doodle.com.json/1590012847874374",
          name: "sites/011/https:doodle.com.json",
          bucket: "perf-land",
          generation: "1590012847874374",
          contentType: "application/json",
          timeCreated: "2020-05-20T22:14:07.874Z",
          // item simplified
        },
        {
          kind: "storage#object",
          id: "perf-land/sites/011/http:paint.com.json/1590012847874374",
          name: "sites/011/http:paint.com.json",
          bucket: "perf-land",
          generation: "1590012847874374",
          contentType: "application/json",
          timeCreated: "2020-05-20T22:14:07.874Z",
          // item simplified
        },
      ],
    };

    const results = ["https:doodle.com", "http:paint.com"];
    expect(digest(data)).toEqual(results);
  });
});
