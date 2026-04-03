// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { normalizeUserUrl } from "pages/admin/dashboard.jsx";

describe("pages/admin/dashboard normalizeUserUrl", () => {
  it("adds https:// to plain domains", () => {
    expect(normalizeUserUrl("test.vellis.cc")).toBe("https://test.vellis.cc");
    expect(normalizeUserUrl("localhost:3011")).toBe("https://localhost:3011");
  });

  it("keeps already valid absolute urls unchanged", () => {
    expect(normalizeUserUrl("https://test.vellis.cc")).toBe("https://test.vellis.cc");
    expect(normalizeUserUrl("http://test.vellis.cc")).toBe("http://test.vellis.cc");
  });

  it("keeps special schemes and local paths unchanged", () => {
    expect(normalizeUserUrl("mailto:test@example.com")).toBe("mailto:test@example.com");
    expect(normalizeUserUrl("tel:+33123456789")).toBe("tel:+33123456789");
    expect(normalizeUserUrl("/internal/page")).toBe("/internal/page");
    expect(normalizeUserUrl("#section")).toBe("#section");
  });
});
