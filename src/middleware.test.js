import { beforeEach, describe, expect, it, vi } from "vitest";

const { NextResponse } = vi.hoisted(() => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ type: "json", body, init })),
    next: vi.fn(() => ({ type: "next" })),
  },
}));

vi.mock("next/server", () => ({ NextResponse }));

import { middleware } from "./middleware";

function createReq(host) {
  return {
    headers: {
      get: (key) => (key === "host" ? host : null),
    },
  };
}

describe("middleware", () => {
  const originalEnv = process.env;
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.HOMEPAGE_ALLOWED_HOSTS;
    console.error = originalConsoleError;
  });

  it("allows requests for default localhost hosts", () => {
    process.env.PORT = "3000";
    const res = middleware(createReq("localhost:3000"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("blocks requests when host is not allowed with actionable details", () => {
    process.env.PORT = "3000";
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = middleware(createReq("evil.com"));

    expect(errSpy).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        error: "Host validation failed.",
        message: 'This request used the host "evil.com", but it is not currently allowed.',
        hint: "Add the exact host to HOMEPAGE_ALLOWED_HOSTS, or use * only if you fully trust the deployment environment.",
        suggestedEnv: "HOMEPAGE_ALLOWED_HOSTS=evil.com",
        allowedHosts: ["localhost:3000", "127.0.0.1:3000", "[::1]:3000"],
        docs: "/docs/troubleshooting/host-validation",
      },
      { status: 400 },
    );
    expect(res.type).toBe("json");
    expect(res.init.status).toBe(400);
  });

  it("allows requests when HOMEPAGE_ALLOWED_HOSTS is '*'", () => {
    process.env.HOMEPAGE_ALLOWED_HOSTS = "*";
    const res = middleware(createReq("anything.example"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("allows requests when host is included in HOMEPAGE_ALLOWED_HOSTS", () => {
    process.env.PORT = "3000";
    process.env.HOMEPAGE_ALLOWED_HOSTS = "example.com:3000,other:3000";

    const res = middleware(createReq("example.com:3000"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("allows requests when the configured host omits default port 80", () => {
    process.env.HOMEPAGE_ALLOWED_HOSTS = "panelio.vellis.cc";

    const res = middleware(createReq("panelio.vellis.cc:80"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("allows requests when the configured host omits default port 443", () => {
    process.env.HOMEPAGE_ALLOWED_HOSTS = "panelio.vellis.cc";

    const res = middleware(createReq("panelio.vellis.cc:443"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });
});
