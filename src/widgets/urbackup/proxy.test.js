import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { state, getServiceWidget, MockUrbackupServer } = vi.hoisted(() => {
  const state = {
    instances: [],
    // Per-test configurable return values
    statusResult: [],
    usageResult: undefined,
    statusError: null,
  };

  class MockUrbackupServer {
    constructor(opts) {
      this.opts = opts;
      state.instances.push(this);
    }
    getStatus() {
      if (state.statusError) return Promise.reject(state.statusError);
      return Promise.resolve(state.statusResult);
    }
    getUsage() {
      return Promise.resolve(state.usageResult);
    }
  }

  return { state, getServiceWidget: vi.fn(), MockUrbackupServer };
});

vi.mock("urbackup-server-api", () => ({
  UrbackupServer: MockUrbackupServer,
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));

import urbackupProxyHandler from "./proxy";

describe("widgets/urbackup/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.instances.length = 0;
    state.statusResult = [];
    state.usageResult = undefined;
    state.statusError = null;
  });

  it("returns client statuses and maxDays without disk usage by default", async () => {
    getServiceWidget.mockResolvedValue({
      url: "http://ur",
      username: "u",
      password: "p",
      maxDays: 5,
    });

    state.statusResult = [{ id: 1 }];

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await urbackupProxyHandler(req, res);

    // Verify constructor was called with expected opts
    expect(state.instances[0].opts).toEqual({ url: "http://ur", username: "u", password: "p" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ clientStatuses: [{ id: 1 }], diskUsage: false, maxDays: 5 });
  });

  it("fetches disk usage when requested via fields", async () => {
    getServiceWidget.mockResolvedValue({
      url: "http://ur",
      username: "u",
      password: "p",
      maxDays: 1,
      fields: ["totalUsed"],
    });

    state.statusResult = [{ id: 1 }];
    state.usageResult = { totalUsed: 123 };

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await urbackupProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.diskUsage).toEqual({ totalUsed: 123 });
  });

  it("returns 500 on server errors", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://ur", username: "u", password: "p" });

    state.statusError = new Error("nope");

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await urbackupProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Error communicating with UrBackup server" });
  });
});
