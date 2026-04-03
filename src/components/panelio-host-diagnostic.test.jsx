// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PanelioHostDiagnostic from "./panelio-host-diagnostic";

describe("components/panelio-host-diagnostic", () => {
  it("renders guided help for public domain setups", () => {
    render(
      <PanelioHostDiagnostic
        error={{
          error: "Host validation failed.",
          message: 'This request used the host "panelio.vellis.cc", but it is not currently allowed.',
          hint: "Add the exact host to HOMEPAGE_ALLOWED_HOSTS.",
          suggestedEnv: "HOMEPAGE_ALLOWED_HOSTS=panelio.vellis.cc",
          allowedHosts: ["localhost:3000"],
          docs: "/docs/installation/#homepage_allowed_hosts",
        }}
      />,
    );

    expect(screen.getByText("Panelio could not validate this host")).toBeInTheDocument();
    expect(screen.getByText(/Public domain or reverse proxy/)).toBeInTheDocument();
    expect(screen.getByText(/Docker \/ Compose/)).toBeInTheDocument();
    expect(screen.getAllByText(/panelio\.vellis\.cc/).length).toBeGreaterThan(0);
  });

  it("switches guidance for LAN setups", () => {
    render(
      <PanelioHostDiagnostic
        error={{
          error: "Host validation failed.",
          message: 'This request used the host "192.168.1.20:3000", but it is not currently allowed.',
          hint: "Add the exact host to HOMEPAGE_ALLOWED_HOSTS.",
          suggestedEnv: "HOMEPAGE_ALLOWED_HOSTS=192.168.1.20:3000",
          allowedHosts: ["localhost:3000"],
        }}
      />,
    );

    expect(screen.getByText(/LAN or local IP access/)).toBeInTheDocument();
    expect(screen.getByText(/local network IP/)).toBeInTheDocument();
  });

  it("copies the suggested env value when requested", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <PanelioHostDiagnostic
        error={{
          error: "Host validation failed.",
          message: 'This request used the host "panelio.vellis.cc", but it is not currently allowed.',
          suggestedEnv: "HOMEPAGE_ALLOWED_HOSTS=panelio.vellis.cc",
          allowedHosts: [],
        }}
      />,
    );

    await fireEvent.click(screen.getByText(/Copy suggested env value/));
    expect(writeText).toHaveBeenCalledWith("HOMEPAGE_ALLOWED_HOSTS=panelio.vellis.cc");
  });
});
