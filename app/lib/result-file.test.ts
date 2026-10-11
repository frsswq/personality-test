import { describe, expect, it } from "vitest";

import {
  RESULT_FILE_FORMAT,
  buildResultFile,
  parseResultFile,
  resultFileName,
} from "./result-file";

describe(buildResultFile, () => {
  it("stamps the format, the version, and the time", () => {
    const file = buildResultFile({
      code: "abc",
      instrumentId: "ipip-neo-120",
      slug: "a-test",
    });

    expect(file.format).toBe(RESULT_FILE_FORMAT);
    expect(file.version).toBe(1);
    expect(file.code).toBe("abc");
    expect(Number.isNaN(Date.parse(file.exportedAt))).toBeFalsy();
  });
});

describe(parseResultFile, () => {
  it("reads back a file it wrote", () => {
    const file = buildResultFile({
      code: "abc",
      instrumentId: "ipip-neo-120",
      slug: "a-test",
    });

    expect(parseResultFile(JSON.stringify(file))).toStrictEqual(file);
  });

  it("rejects text that is not JSON", () => {
    expect(parseResultFile("hello")).toBeNull();
  });

  it("rejects JSON from another source", () => {
    expect(parseResultFile(JSON.stringify({ hello: "world" }))).toBeNull();
  });

  it("rejects another format name", () => {
    const file = buildResultFile({
      code: "abc",
      instrumentId: "ipip-neo-120",
      slug: "a-test",
    });

    expect(
      parseResultFile(JSON.stringify({ ...file, format: "other" }))
    ).toBeNull();
  });

  it("rejects a missing code", () => {
    const file = buildResultFile({
      code: "abc",
      instrumentId: "ipip-neo-120",
      slug: "a-test",
    });

    expect(parseResultFile(JSON.stringify({ ...file, code: "" }))).toBeNull();
  });
});

describe(resultFileName, () => {
  it("names the file after the test and the day", () => {
    expect(resultFileName("a-test", new Date("2026-10-11T10:00:00Z"))).toBe(
      "a-test-2026-10-11.json"
    );
  });
});
