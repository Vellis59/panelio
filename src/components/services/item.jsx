import classNames from "classnames";
import ResolvedIcon from "components/resolvedicon";
import { useContext, useEffect, useRef, useState } from "react";
import { SettingsContext } from "utils/contexts/settings";
import Docker from "widgets/docker/component";
import Kubernetes from "widgets/kubernetes/component";
import ProxmoxVM from "widgets/proxmoxvm/component";

import KubernetesStatus from "./kubernetes-status";
import Ping from "./ping";
import ProxmoxStatus from "./proxmox-status";
import SiteMonitor from "./site-monitor";
import Status from "./status";
import Widget from "./widget";

export default function Item({ service, groupName, useEqualHeights }) {
  const hasLink = service.href && service.href !== "#";
  const { settings } = useContext(SettingsContext);
  const showStats = service.showStats === false ? false : settings.showStats;
  const statusStyle = service.statusStyle !== undefined ? service.statusStyle : settings.statusStyle;
  const [statsOpen, setStatsOpen] = useState(service.showStats);
  const [statsClosing, setStatsClosing] = useState(false);

  const pinnedKeys = settings?.panelioPinned || [];
  const pinKey = `${groupName}::${service.name}`;
  const isPinned = pinnedKeys.includes(pinKey);
  const cardStyle = settings?.panelioCardStyle || "panelio";
  const isPanelioStyle = cardStyle === "panelio";
  const showStatusDot = settings?.panelioShowStatusDot === true;
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuAbove, setMenuAbove] = useState(false);
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  const togglePin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/admin/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ group: groupName, service: service.name }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {}
  };

  const copyUrl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (service.href) {
      navigator.clipboard.writeText(service.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
    setMenuOpen(false);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Detect menu direction when opening
  useEffect(() => {
    if (!menuOpen || !menuBtnRef.current) return;
    const rect = menuBtnRef.current.getBoundingClientRect();
    setMenuAbove(rect.bottom + 160 > window.innerHeight);
  }, [menuOpen]);

  // set stats to closed after 300ms
  const closeStats = () => {
    if (statsOpen) {
      setStatsClosing(true);
      setTimeout(() => {
        setStatsOpen(false);
        setStatsClosing(false);
      }, 300);
    }
  };

  return (
    <li key={service.name} id={service.id} className="service" data-name={service.name || ""}>
      <div
        className={classNames(
          settings.cardBlur !== undefined && `backdrop-blur${settings.cardBlur.length ? "-" : ""}${settings.cardBlur}`,
          useEqualHeights && "h-[calc(100%-0.5rem)]",
          isPanelioStyle
            ? "transition-all mb-3 rounded-2xl font-medium text-theme-700 dark:text-theme-100 shadow-lg shadow-theme-900/10 dark:shadow-black/30 bg-gradient-to-br from-white/25 via-white/10 to-white/5 dark:from-white/10 dark:via-white/[0.07] dark:to-white/[0.03] hover:from-white/30 hover:via-white/15 hover:to-white/10 dark:hover:from-white/15 dark:hover:via-white/10 dark:hover:to-white/[0.06] border border-white/15 dark:border-white/10 relative overflow-visible service-card group hover:-translate-y-0.5"
            : "transition-all mb-2 p-1 rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10 relative overflow-clip service-card group",
        )}
      >
        {isPanelioStyle && <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)]" />}
        <div className={classNames("flex select-none z-0 service-title", isPanelioStyle ? "items-center px-3 py-3" : "")}>
          {/* Pin button — top-left, appears on hover */}
          <button
            type="button"
            onClick={togglePin}
            className={classNames(
              "absolute z-30 text-sm transition-all rounded-full backdrop-blur-sm",
              isPanelioStyle ? "top-1 left-1 w-8 h-8 flex items-center justify-center" : "top-1 left-1 px-1 py-0.5",
              isPinned
                ? "opacity-100 bg-amber-500/30"
                : "opacity-0 group-hover:opacity-100 bg-black/25 hover:bg-black/40 dark:bg-white/15 dark:hover:bg-white/25",
            )}
            title={isPinned ? "Unpin" : "Pin to top"}
            style={{ cursor: "pointer" }}
          >
            <span className={isPinned ? "text-amber-400" : "text-theme-400 dark:text-theme-500"}>{isPinned ? String.fromCharCode(9733) : String.fromCharCode(9734)}</span>
          </button>
          {(service.icon || service.href || service.name) &&
            (hasLink ? (
              <a
                href={service.href}
                target={service.target ?? settings.target ?? "_blank"}
                rel="noreferrer"
                className={classNames("shrink-0 flex items-center justify-center service-icon z-10", isPanelioStyle ? "w-14 h-14 rounded-2xl bg-white/15 dark:bg-white/10 border border-white/10 shadow-inner" : "w-12")}
                aria-label={service.icon || service.name}
              >
                <ResolvedIcon icon={service.icon} href={service.href} serviceName={service.name} />
              </a>
            ) : (
              <div className={classNames("shrink-0 flex items-center justify-center service-icon z-10", isPanelioStyle ? "w-14 h-14 rounded-2xl bg-white/15 dark:bg-white/10 border border-white/10 shadow-inner" : "w-12")}>
                <ResolvedIcon icon={service.icon} href={service.href} serviceName={service.name} />
              </div>
            ))}

          {hasLink ? (
            <a
              href={service.href}
              target={service.target ?? settings.target ?? "_blank"}
              rel="noreferrer"
              className={classNames("flex-1 flex items-center justify-between service-title-text", isPanelioStyle ? "rounded-2xl min-w-0" : "rounded-r-md")}
            >
              <div className={classNames("flex-1 text-left z-10 service-name min-w-0", isPanelioStyle ? "px-3 py-1" : "px-2 py-2 text-sm")}>
                <div className={classNames(isPanelioStyle ? "text-sm font-semibold tracking-tight text-theme-900 dark:text-white truncate" : "")}>{service.name}</div>
                <p className={classNames("service-description", isPanelioStyle ? "text-theme-700/70 dark:text-theme-200/70 text-xs font-normal mt-1 truncate" : "text-theme-500 dark:text-theme-300 text-xs font-light")}>
                  {service.description}
                </p>
              </div>
            </a>
          ) : (
            <div className={classNames("flex-1 flex items-center justify-between service-title-text", isPanelioStyle ? "rounded-2xl min-w-0" : "rounded-r-md")}>
              <div className={classNames("flex-1 text-left z-10 service-name min-w-0", isPanelioStyle ? "px-3 py-1" : "px-2 py-2 text-sm")}>
                <div className={classNames(isPanelioStyle ? "text-sm font-semibold tracking-tight text-theme-900 dark:text-white truncate" : "")}>{service.name}</div>
                <p className={classNames("service-description", isPanelioStyle ? "text-theme-700/70 dark:text-theme-200/70 text-xs font-normal mt-1 truncate" : "text-theme-500 dark:text-theme-300 text-xs font-light")}>
                  {service.description}
                </p>
              </div>
            </div>
          )}

          <div
            className={classNames(
              "absolute flex flex-row justify-end z-10 service-tags",
              isPanelioStyle ? "top-2 right-2 gap-1.5" : statusStyle === "dot" ? "top-0 right-0 gap-0" : "top-0 right-0 gap-2 mr-2",
            )}
          >
            {service.ping && (
              <div className="shrink-0 flex items-center justify-center service-tag service-ping">
                <Ping groupName={groupName} serviceName={service.name} style={statusStyle} />
                <span className="sr-only">Ping status</span>
              </div>
            )}

            {service.siteMonitor && (
              <div className="shrink-0 flex items-center justify-center service-tag service-site-monitor">
                <SiteMonitor groupName={groupName} serviceName={service.name} style={statusStyle} />
                <span className="sr-only">Site monitor status</span>
              </div>
            )}

            {service.container && (
              <button
                type="button"
                onClick={() => (statsOpen ? closeStats() : setStatsOpen(true))}
                className="shrink-0 flex items-center justify-center cursor-pointer service-tag service-container-stats"
              >
                <Status service={service} style={statusStyle} />
                <span className="sr-only">View container stats</span>
              </button>
            )}
            {service.app && !service.external && (
              <button
                type="button"
                onClick={() => (statsOpen ? closeStats() : setStatsOpen(true))}
                className="shrink-0 flex items-center justify-center cursor-pointer service-tag service-app"
              >
                <KubernetesStatus service={service} style={statusStyle} />
                <span className="sr-only">View container stats</span>
              </button>
            )}
            {service.proxmoxNode && service.proxmoxVMID && (
              <button
                type="button"
                onClick={() => (statsOpen ? closeStats() : setStatsOpen(true))}
                className="shrink-0 flex items-center justify-center cursor-pointer service-tag service-proxmoxstatus"
              >
                <ProxmoxStatus service={service} style={statusStyle} />
                <span className="sr-only">View Proxmox stats</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions & status dot */}
        {isPanelioStyle && (
          <div className="absolute bottom-2 right-2 z-20 flex items-center gap-2">
            {showStatusDot && hasLink && (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="Online" />
            )}
            <button
              ref={menuBtnRef}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-theme-400 dark:text-theme-500 hover:text-theme-600 dark:hover:text-theme-300 text-lg leading-none w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10"
              title="Quick actions"
            >
              {String.fromCharCode(8942)}
            </button>
          </div>
        )}
        {menuOpen && isPanelioStyle && (
          <div
            ref={menuRef}
            className={classNames(
              "absolute right-2 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]",
              menuAbove ? "bottom-10" : "top-8",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {service.href && (
              <button type="button" onClick={copyUrl} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                {copied ? "Copied!" : "Copy URL"}
              </button>
            )}
            <a href="/admin/dashboard" className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline">
              Edit in admin
            </a>
            <button type="button" onClick={(e) => { togglePin(e); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              {isPinned ? "Unpin" : "Pin to top"}
            </button>
          </div>
        )}

        {service.container && service.server && (
          <div
            className={classNames(
              showStats || (statsOpen && !statsClosing) ? "max-h-[110px] opacity-100" : " max-h-0 opacity-0",
              "w-full overflow-hidden transition-all duration-300 ease-in-out service-stats",
            )}
          >
            {(showStats || statsOpen) && (
              <Docker service={{ widget: { container: service.container, server: service.server } }} />
            )}
          </div>
        )}
        {service.app && (
          <div
            className={classNames(
              showStats || (statsOpen && !statsClosing) ? "max-h-[55px] opacity-100" : " max-h-0 opacity-0",
              "w-full overflow-hidden transition-all duration-300 ease-in-out service-stats",
            )}
          >
            {(showStats || statsOpen) && (
              <Kubernetes
                service={{
                  widget: { namespace: service.namespace, app: service.app, podSelector: service.podSelector },
                }}
              />
            )}
          </div>
        )}
        {service.proxmoxNode && service.proxmoxVMID && (
          <div
            className={classNames(
              showStats || (statsOpen && !statsClosing) ? "max-h-[110px] opacity-100" : " max-h-0 opacity-0",
              "w-full overflow-hidden transition-all duration-300 ease-in-out service-stats",
            )}
          >
            {(showStats || statsOpen) && (
              <ProxmoxVM
                service={{
                  widget: {
                    node: service.proxmoxNode,
                    vmid: service.proxmoxVMID,
                    type: service.proxmoxType,
                  },
                }}
              />
            )}
          </div>
        )}

        {service.widgets.map((widget) => (
          <Widget widget={widget} service={service} key={widget.index} />
        ))}
      </div>
    </li>
  );
}
