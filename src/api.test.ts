import { BUCKET_ROOT_URL } from "./api";

describe("BUCKET_ROOT_URL", () => {
  it("is secure", () => {
    BUCKET_ROOT_URL.startsWith("https");
  });
});
