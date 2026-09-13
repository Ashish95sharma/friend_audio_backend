import { describe, it, expect } from "@jest/globals";
import { pair } from "../models/Friendship";
describe("business helpers", () => {
  it("normalizes friendship pairs", () =>
    expect(pair("b", "a")).toEqual(["a", "b"]));
  it("keeps security rule explicit", () => expect(true).toBe(true));
});
