import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const readFileMock = vi.fn();
const writeFileMock = vi.fn();
const copyFileMock = vi.fn();

vi.mock("fs", () => ({
  promises: {
    readFile: readFileMock,
    writeFile: writeFileMock,
    copyFile: copyFileMock,
  },
}));

vi.mock("utils/logger", () => ({
  default: () => ({
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("utils/admin/yaml-crud servicesOps", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    readFileMock.mockReset();
    writeFileMock.mockReset();
    copyFileMock.mockReset();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("adds a new group automatically when adding a service", async () => {
    readFileMock.mockRejectedValueOnce(Object.assign(new Error("missing"), { code: "ENOENT" }));

    const { servicesOps } = await import("./yaml-crud");
    const result = await servicesOps.add("Infra", { name: "Grafana", href: "http://grafana.local" });

    expect(result).toEqual([
      {
        Infra: [
          {
            Grafana: {
              name: "Grafana",
              href: "http://grafana.local",
            },
          },
        ],
      },
    ]);
    expect(writeFileMock).toHaveBeenCalledTimes(1);
  });

  it("renames a service while preserving existing fields", async () => {
    readFileMock.mockResolvedValueOnce(`- Infra:\n  - Grafana:\n      href: http://grafana.local\n      description: Metrics\n`);

    const { servicesOps } = await import("./yaml-crud");
    const result = await servicesOps.update(
      "Infra",
      "Grafana",
      { name: "Grafana Cloud", description: "Dashboards" },
    );

    expect(result[0].Infra[0]).toEqual({
      "Grafana Cloud": {
        href: "http://grafana.local",
        description: "Dashboards",
      },
    });
    expect(writeFileMock).toHaveBeenCalledTimes(1);
  });

  it("removes the parent group when deleting the last service of the last subgroup", async () => {
    readFileMock.mockResolvedValueOnce(
      `- Infra:\n  - Monitoring:\n      - Grafana:\n          href: http://grafana.local\n`,
    );

    const { servicesOps } = await import("./yaml-crud");
    const result = await servicesOps.remove("Infra", "Grafana", "Monitoring");

    expect(result).toEqual([]);
    expect(writeFileMock).toHaveBeenCalledTimes(1);
  });

  it("throws a clear error when adding to a missing subgroup", async () => {
    readFileMock.mockResolvedValueOnce(`- Infra: []\n`);

    const { servicesOps } = await import("./yaml-crud");

    await expect(
      servicesOps.add("Infra", { name: "Grafana", href: "http://grafana.local" }, "Missing"),
    ).rejects.toThrow('Sub-group "Missing" not found in group "Infra"');
  });
});
