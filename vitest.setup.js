import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// -----------------------------------------------------------------------
// localStorage mock — jsdom "node" pool doesn't provide localStorage.
// Stubs both the global and the window property so component code works
// regardless of which access pattern is used.
// -----------------------------------------------------------------------
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] ?? null,
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

afterEach(() => {
  // Node-environment tests shouldn't require jsdom; guard cleanup accordingly.
  if (typeof document !== "undefined") cleanup();
  localStorageMock.clear();
});

// implement a couple of common formatters mocked in next-i18next
vi.mock("next-i18next", () => ({
  // Keep app/page components importable in unit tests.
  appWithTranslation: (Component) => Component,
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key, opts) => {
      if (key === "common.number") return String(opts?.value ?? "");
      if (key === "common.percent") return String(opts?.value ?? "");
      if (key === "common.bytes") return String(opts?.value ?? "");
      if (key === "common.bbytes") return String(opts?.value ?? "");
      if (key === "common.byterate") return String(opts?.value ?? "");
      if (key === "common.bibyterate") return String(opts?.value ?? "");
      if (key === "common.bitrate") return String(opts?.value ?? "");
      if (key === "common.duration") return String(opts?.value ?? "");
      if (key === "common.ms") return String(opts?.value ?? "");
      if (key === "common.date") return String(opts?.value ?? "");
      if (key === "common.relativeDate") return String(opts?.value ?? "");
      return key;
    },
  }),
}));
