import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = process.env;

describe("utils/admin/auth", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, PANELIO_ADMIN_PASSWORD: "secret" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("validates the configured admin password", async () => {
    const mod = await import("./auth");

    expect(mod.isAdminEnabled()).toBe(true);
    expect(mod.validatePassword("secret")).toBe(true);
    expect(mod.validatePassword("wrong")).toBe(false);
  });

  it("accepts any non-empty password in demo mode", async () => {
    process.env = { ...originalEnv, DEMO_MODE: "true" };
    const mod = await import("./auth");

    expect(mod.isAdminEnabled()).toBe(true);
    expect(mod.validatePassword("demo-access")).toBe(true);
    expect(mod.validatePassword("")).toBe(false);
  });

  it("extracts token from panelio cookie first, then authorization header", async () => {
    const mod = await import("./auth");

    expect(
      mod.getTokenFromRequest({
        headers: {
          cookie: "foo=1; panelio_admin_token=panelio-token; homepage_admin_token=legacy-token",
          authorization: "Bearer header-token",
        },
      }),
    ).toBe("panelio-token");

    expect(
      mod.getTokenFromRequest({
        headers: {
          cookie: "foo=1",
          authorization: "Bearer header-token",
        },
      }),
    ).toBe("header-token");
  });

  it("generates and verifies a valid admin token", async () => {
    const mod = await import("./auth");
    const token = mod.generateToken();
    const session = mod.verifyToken(token);

    expect(session).toBeTruthy();
    expect(session.demo).toBe(false);
    expect(typeof session.ts).toBe("number");
  });

  it("rejects tampered tokens", async () => {
    const mod = await import("./auth");
    const token = mod.generateToken();
    const [payload] = token.split(".");
    const tampered = `${payload}.bad-signature`;

    expect(mod.verifyToken(tampered)).toBe(false);
  });

  it("requireAdmin attaches the verified session on success", async () => {
    const mod = await import("./auth");
    const token = mod.generateToken();
    const req = { headers: { cookie: `panelio_admin_token=${token}` } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const allowed = mod.requireAdmin(req, res);

    expect(allowed).toBe(true);
    expect(req.adminSession).toBeTruthy();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("requireAdmin returns 401 when the token is missing or invalid", async () => {
    const mod = await import("./auth");
    const req = { headers: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const allowed = mod.requireAdmin(req, res);

    expect(allowed).toBe(false);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });
});
