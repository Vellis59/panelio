/* eslint-disable react/no-array-index-key */
import classNames from "classnames";
import BookmarksGroup from "components/bookmarks/group";
import ErrorBoundary from "components/errorboundry";
import PanelioHostDiagnostic from "components/panelio-host-diagnostic";
import PanelioGreeting from "components/panelio-greeting";
import PinnedBar from "components/pinned-bar";
import QuickLaunch from "components/quicklaunch";
import ServicesGroup from "components/services/group";
import Tab, { slugifyAndEncode } from "components/tab";
import Revalidate from "components/toggles/revalidate";
import Widget from "components/widgets/widget";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useContext, useEffect, useMemo, useState } from "react";
import { BiError } from "react-icons/bi";
import useSWR, { SWRConfig } from "swr";
import { ColorContext } from "utils/contexts/color";
import { SettingsContext } from "utils/contexts/settings";
import { TabContext } from "utils/contexts/tab";
import { ThemeContext } from "utils/contexts/theme";

import { bookmarksResponse, servicesResponse, widgetsResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";
import useWindowFocus from "utils/hooks/window-focus";
import createLogger from "utils/logger";
import themes from "utils/styles/themes";

const ThemeToggle = dynamic(() => import("components/toggles/theme"), {
  ssr: false,
});

const ColorToggle = dynamic(() => import("components/toggles/color"), {
  ssr: false,
});

const Version = dynamic(() => import("components/version"), {
  ssr: false,
});

const rightAlignedWidgets = ["weatherapi", "openweathermap", "weather", "openmeteo", "search", "datetime"];

function PanelioOverview({ services, bookmarks, widgets, cardBlur, settings }) {
  const serviceGroups = services?.length || 0;
  const serviceCount = services?.reduce((sum, group) => sum + (group.services?.length || 0), 0) || 0;
  const bookmarkGroups = bookmarks?.length || 0;
  const bookmarkCount = bookmarks?.reduce((sum, group) => sum + (group.bookmarks?.length || 0), 0) || 0;
  const widgetCount = widgets?.length || 0;

  const title = settings?.panelioOverviewTitle || "Panelio Overview";
  const subtitle = settings?.panelioOverviewSubtitle || "Your dashboard at a glance";
  const description = settings?.panelioOverviewDescription || `Panelio is currently managing ${serviceCount} service${serviceCount === 1 ? "" : "s"} across ${serviceGroups} group${serviceGroups === 1 ? "" : "s"}.`;

  const cards = [
    { label: "Service groups", value: serviceGroups },
    { label: "Services", value: serviceCount },
    { label: "Bookmark groups", value: bookmarkGroups },
    { label: "Bookmarks", value: bookmarkCount },
    { label: "Widgets", value: widgetCount },
  ];

  return (
    <section className="m-5 mb-0 sm:m-9 sm:mb-0">
      <div
        className={classNames(
          "rounded-xl border border-white/10 bg-theme-100/20 dark:bg-white/5 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 p-4 sm:p-5",
          cardBlur !== undefined && `backdrop-blur${cardBlur.length ? `-${cardBlur}` : ""}`,
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-theme-800/70 dark:text-theme-200/60 mb-2">
              {title}
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-theme-900 dark:text-theme-50">
              {subtitle}
            </h2>
            <p className="text-sm sm:text-base text-theme-800/70 dark:text-theme-200/70 mt-1 max-w-2xl">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/admin"
              className="inline-flex items-center rounded-lg bg-theme-700 px-4 py-2 text-sm font-medium text-white hover:bg-theme-800 transition"
            >
              Open Admin
            </a>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border border-white/10 bg-black/10 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-theme-800/60 dark:text-theme-200/60">{card.label}</div>
              <div className="mt-1 text-2xl font-semibold text-theme-900 dark:text-theme-50">{card.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Normalize language codes so older config values like zh-CN still point to Crowdin-provided ones
const LANGUAGE_ALIASES = {
  "zh-cn": "zh-Hans",
};

const normalizeLanguage = (language) => {
  if (!language) return "en";
  const alias = LANGUAGE_ALIASES[language.toLowerCase()];
  return alias || language;
};

export async function getStaticProps() {
  let logger;
  try {
    logger = createLogger("index");
    const { providers, ...settings } = getSettings();

    const services = await servicesResponse();
    const bookmarks = await bookmarksResponse();
    const widgets = await widgetsResponse();
    const language = normalizeLanguage(settings.language);

    return {
      props: {
        initialSettings: settings,
        fallback: {
          "/api/services": services,
          "/api/bookmarks": bookmarks,
          "/api/widgets": widgets,
          "/api/hash": false,
        },
        ...(await serverSideTranslations(language)),
      },
    };
  } catch (e) {
    if (logger && e) {
      logger.error(e);
    }
    return {
      props: {
        initialSettings: {},
        fallback: {
          "/api/services": [],
          "/api/bookmarks": [],
          "/api/widgets": [],
          "/api/hash": false,
        },
        ...(await serverSideTranslations("en")),
      },
    };
  }
}

function Index({ initialSettings, fallback }) {
  const windowFocused = useWindowFocus();
  const [stale, setStale] = useState(false);
  const { data: errorsData } = useSWR("/api/validate");
  const validateError = Array.isArray(errorsData) ? null : errorsData?.error ? errorsData : null;
  const { data: hashData, mutate: mutateHash } = useSWR("/api/hash");

  useEffect(() => {
    if (windowFocused) {
      mutateHash();
    }
  }, [windowFocused, mutateHash]);

  useEffect(() => {
    if (hashData) {
      if (typeof window !== "undefined") {
        const previousHash = localStorage.getItem("hash");

        if (!previousHash) {
          localStorage.setItem("hash", hashData.hash);
        }

        if (previousHash && previousHash !== hashData.hash) {
          setStale(true);
          localStorage.setItem("hash", hashData.hash);

          fetch("/api/revalidate").then((res) => {
            if (res.ok) {
              window.location.reload();
            }
          });
        }
      }
    }
  }, [hashData]);

  if (validateError) {
    if (validateError?.error === "Host validation failed.") {
      return <PanelioHostDiagnostic error={validateError} />;
    }

    return (
      <div className="w-full h-screen container m-auto justify-center p-10 pointer-events-none">
        <div className="flex flex-col">
          <div className="basis-1/2 bg-theme-500 dark:bg-theme-600 text-theme-600 dark:text-theme-300 m-2 rounded-md font-mono shadow-md border-4 border-transparent">
            <div className="bg-rose-200 text-rose-800 dark:text-rose-200 dark:bg-rose-800 p-2 rounded-md font-bold">
              <BiError className="float-right w-6 h-6" />
              Error
            </div>
            <div className="p-2 text-theme-100 dark:text-theme-200">
              <pre className="opacity-50 font-bold pb-2">{typeof validateError === "string" ? validateError : JSON.stringify(validateError, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stale) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-24 h-24 border-2 border-theme-400 border-solid rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  if (errorsData && errorsData.length > 0) {
    return (
      <div className="w-full h-screen container m-auto justify-center p-10 pointer-events-none">
        <div className="flex flex-col">
          {errorsData.map((error, i) => (
            <div
              className="basis-1/2 bg-theme-500 dark:bg-theme-600 text-theme-600 dark:text-theme-300 m-2 rounded-md font-mono shadow-md border-4 border-transparent"
              key={i}
            >
              <div className="bg-amber-200 text-amber-800 dark:text-amber-200 dark:bg-amber-800 p-2 rounded-md font-bold">
                <BiError className="float-right w-6 h-6" />
                {error.config}
              </div>
              <div className="p-2 text-theme-100 dark:text-theme-200">
                <pre className="opacity-50 font-bold pb-2">{error.reason}</pre>
                <pre className="text-sm">{error.mark.snippet}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SWRConfig value={{ fallback, fetcher: (resource, init) => fetch(resource, init).then((res) => res.json()) }}>
      <ErrorBoundary>
        <Home initialSettings={initialSettings} />
      </ErrorBoundary>
    </SWRConfig>
  );
}

const headerStyles = {
  boxed:
    "m-5 mb-0 sm:m-9 sm:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
  underlined: "m-5 mb-0 sm:m-9 sm:mb-1 border-b-2 pb-4 border-theme-800 dark:border-theme-200/50",
  clean: "m-5 mb-0 sm:m-9 sm:mb-0",
  boxedWidgets: "m-5 mb-0 sm:m-9 sm:mb-0 sm:mt-1",
};

function getAllServices(services) {
  function getServices(group) {
    let nestedServices = [...group.services];
    if (group.groups.length > 0) {
      nestedServices = [...nestedServices, ...group.groups.map(getServices).flat()];
    }
    return nestedServices;
  }

  return [...services.map(getServices).flat()];
}

function Home({ initialSettings }) {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);
  const { color, setColor } = useContext(ColorContext);
  const { settings, setSettings } = useContext(SettingsContext);
  const { activeTab, setActiveTab } = useContext(TabContext);
  const { asPath } = useRouter();

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings, setSettings]);

  const { data: services } = useSWR("/api/services");
  const { data: bookmarks } = useSWR("/api/bookmarks");
  const { data: widgets } = useSWR("/api/widgets");
  const { data: liveThemeSettings } = useSWR("/api/panelio-settings");

  const servicesAndBookmarks = [...bookmarks.map((bg) => bg.bookmarks).flat(), ...getAllServices(services)].filter(
    (i) => i?.href,
  );

  useEffect(() => {
    if (liveThemeSettings) {
      setSettings((prev) => ({ ...prev, ...liveThemeSettings }));
    }
  }, [liveThemeSettings, setSettings]);

  useEffect(() => {
    const language = normalizeLanguage(settings.language);
    if (language) {
      i18n.changeLanguage(language);
    }

    if (settings.theme && theme !== settings.theme) {
      setTheme(settings.theme);
    }

    if (settings.color && color !== settings.color) {
      setColor(settings.color);
    }
  }, [i18n, settings, color, setColor, theme, setTheme]);

  const [searching, setSearching] = useState(false);
  const [searchString, setSearchString] = useState("");
  const headerStyle = settings?.headerStyle || "underlined";

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "BODY" || e.target.id === "inner_wrapper") {
        if (
          (e.key.length === 1 &&
            e.key.match(/(\w|\s|[à-ü]|[À-Ü]|[\w\u0430-\u044f])/gi) &&
            !(e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) ||
          // accented characters and the bang may require modifier keys
          e.key.match(/([à-ü]|[À-Ü]|!)/g) ||
          (e.key === "v" && (e.ctrlKey || e.metaKey))
        ) {
          setSearching(true);
        } else if (e.key === "Escape") {
          setSearchString("");
          setSearching(false);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  const tabs = useMemo(
    () => [
      ...new Set(
        Object.keys(settings.layout ?? {})
          .map((groupName) => settings.layout[groupName]?.tab?.toString())
          .filter((group) => group),
      ),
    ],
    [settings.layout],
  );

  useEffect(() => {
    if (!activeTab) {
      const initialTab = asPath.substring(asPath.indexOf("#") + 1);
      setActiveTab(initialTab === "/" ? slugifyAndEncode(tabs["0"]) : initialTab);
    }
  });

  const servicesAndBookmarksGroups = useMemo(() => {
    const tabGroupFilter = (g) => g && [activeTab, ""].includes(slugifyAndEncode(settings.layout?.[g.name]?.tab));
    const undefinedGroupFilter = (g) => settings.layout?.[g.name] === undefined;

    const layoutGroups = Object.keys(settings.layout ?? {})
      .map((groupName) => services?.find((g) => g.name === groupName) ?? bookmarks?.find((b) => b.name === groupName))
      .filter(tabGroupFilter);

    if (!settings.layout && JSON.stringify(settings.layout) !== JSON.stringify(initialSettings.layout)) {
      // wait for settings to populate (if different from initial settings), otherwise all the widgets will be requested initially even if we are on a single tab
      return <div />;
    }

    const serviceGroups = services?.filter(tabGroupFilter).filter(undefinedGroupFilter);
    const bookmarkGroups = bookmarks.filter(tabGroupFilter).filter(undefinedGroupFilter);

    return (
      <>
        {tabs.length > 0 && (
          <div key="tabs" id="tabs" className="m-5 sm:m-9 sm:mt-4 sm:mb-0">
            <ul
              className={classNames(
                "sm:flex rounded-md bg-theme-100/20 dark:bg-white/5",
                settings.cardBlur !== undefined &&
                  `backdrop-blur${settings.cardBlur.length ? "-" : ""}${settings.cardBlur}`,
              )}
              id="myTab"
              data-tabs-toggle="#myTabContent"
              role="tablist"
            >
              {tabs.map((tab) => (
                <Tab key={tab} tab={tab} />
              ))}
            </ul>
          </div>
        )}
        {layoutGroups.length > 0 && (
          <div key="layoutGroups" id="layout-groups" className="flex flex-wrap m-4 sm:m-8 sm:mt-4 items-start mb-2">
            {layoutGroups.map((group) =>
              group.services ? (
                <ServicesGroup
                  key={group.name}
                  group={group}
                  layout={settings.layout?.[group.name]}
                  maxGroupColumns={settings.fiveColumns ? 5 : settings.maxGroupColumns}
                  disableCollapse={settings.disableCollapse}
                  useEqualHeights={settings.useEqualHeights}
                  groupsInitiallyCollapsed={settings.groupsInitiallyCollapsed}
                />
              ) : (
                <BookmarksGroup
                  key={group.name}
                  bookmarks={group}
                  layout={settings.layout?.[group.name]}
                  disableCollapse={settings.disableCollapse}
                  maxGroupColumns={settings.maxBookmarkGroupColumns ?? settings.maxGroupColumns}
                  groupsInitiallyCollapsed={settings.groupsInitiallyCollapsed}
                />
              ),
            )}
          </div>
        )}
        {serviceGroups?.length > 0 && (
          <div key="services" id="services" className="flex flex-wrap m-4 sm:m-8 sm:mt-4 items-start mb-2">
            {serviceGroups.map((group) => (
              <ServicesGroup
                key={group.name}
                group={group}
                layout={settings.layout?.[group.name]}
                maxGroupColumns={settings.fiveColumns ? 5 : settings.maxGroupColumns}
                disableCollapse={settings.disableCollapse}
                groupsInitiallyCollapsed={settings.groupsInitiallyCollapsed}
              />
            ))}
          </div>
        )}
        {bookmarkGroups?.length > 0 && (
          <div key="bookmarks" id="bookmarks" className="flex flex-wrap m-4 sm:m-8 sm:mt-4 items-start mb-2">
            {bookmarkGroups.map((group) => (
              <BookmarksGroup
                key={group.name}
                bookmarks={group}
                layout={settings.layout?.[group.name]}
                disableCollapse={settings.disableCollapse}
                maxGroupColumns={settings.maxBookmarkGroupColumns ?? settings.maxGroupColumns}
                groupsInitiallyCollapsed={settings.groupsInitiallyCollapsed}
                bookmarksStyle={settings.bookmarksStyle}
              />
            ))}
          </div>
        )}
      </>
    );
  }, [
    tabs,
    activeTab,
    services,
    bookmarks,
    settings.layout,
    settings.fiveColumns,
    settings.maxGroupColumns,
    settings.maxBookmarkGroupColumns,
    settings.disableCollapse,
    settings.useEqualHeights,
    settings.cardBlur,
    settings.groupsInitiallyCollapsed,
    settings.bookmarksStyle,
    initialSettings.layout,
  ]);

  return (
    <>
      <Head>
        <title>{initialSettings.title || "Homepage"}</title>
        <meta
          name="description"
          content={
            initialSettings.description ||
            "A highly customizable homepage (or startpage / application dashboard) with Docker and service API integrations."
          }
        />
        {settings.disableIndexing && <meta name="robots" content="noindex, nofollow" />}
        {settings.base && <base href={settings.base} />}
        {settings.favicon ? (
          <>
            <link rel="icon" href={settings.favicon} />
            <link rel="apple-touch-icon" sizes="180x180" href={settings.favicon} />
          </>
        ) : (
          <>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4" />
            <link rel="shortcut icon" href="/homepage.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=4" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=4" />
            <link rel="mask-icon" href="/safari-pinned-tab.svg?v=4" color="#1e9cd7" />
          </>
        )}
        <meta name="msapplication-TileColor" content={themes[settings.color || "slate"][settings.theme || "dark"]} />
        <meta name="theme-color" content={themes[settings.color || "slate"][settings.theme || "dark"]} />
        <meta name="color-scheme" content="dark light"></meta>
      </Head>

      <Script src="/api/config/custom.js" />

      <div
        className={classNames(
          settings.fullWidth ? "" : "container",
          "relative m-auto flex flex-col justify-start z-10 h-full min-h-screen",
        )}
      >
        <QuickLaunch
          servicesAndBookmarks={servicesAndBookmarks}
          searchString={searchString}
          setSearchString={setSearchString}
          isOpen={searching}
          setSearching={setSearching}
        />

        <div
          id="information-widgets"
          className={classNames(
            "flex flex-row flex-wrap justify-between z-20",
            headerStyles[headerStyle],
            settings.cardBlur !== undefined &&
              headerStyle === "boxed" &&
              `backdrop-blur${settings.cardBlur.length ? "-" : ""}${settings.cardBlur}`,
          )}
        >
          <div id="widgets-wrap" className={classNames("flex flex-row w-full flex-wrap justify-between gap-x-2")}>
            <PanelioGreeting settings={settings} />
            {widgets && (
              <>
                {widgets
                  .filter((widget) => !rightAlignedWidgets.includes(widget.type))
                  .map((widget, i) => (
                    <Widget
                      key={i}
                      widget={widget}
                      style={{ header: headerStyle, isRightAligned: false, cardBlur: settings.cardBlur }}
                    />
                  ))}

                <div
                  id="information-widgets-right"
                  className={classNames(
                    "m-auto flex flex-wrap grow sm:basis-auto justify-between md:justify-end",
                    "m-auto flex flex-wrap grow sm:basis-auto justify-between md:justify-end gap-x-2",
                  )}
                >
                  {widgets
                    .filter((widget) => rightAlignedWidgets.includes(widget.type))
                    .map((widget, i) => (
                      <Widget
                        key={i}
                        widget={widget}
                        style={{ header: headerStyle, isRightAligned: true, cardBlur: settings.cardBlur }}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        </div>

        <PanelioOverview services={services} bookmarks={bookmarks} widgets={widgets} cardBlur={settings.cardBlur} settings={settings} />
        {(() => {
          const pinnedKeys = settings.panelioPinned || [];
          if (pinnedKeys.length === 0) return null;
          const pinnedSvcs = [];
          services?.forEach((g) => {
            g.services?.forEach((s) => {
              if (pinnedKeys.includes(`${g.name}::${s.name}`)) {
                pinnedSvcs.push({ ...s, __groupName: g.name });
              }
              // sub-groups
              if (Array.isArray(s)) {
                s.forEach((sub) => {
                  const subName = Object.keys(sub)[0];
                  if (pinnedKeys.includes(`${g.name}::${subName}`)) {
                    pinnedSvcs.push({ ...sub[subName], __groupName: g.name, name: subName });
                  }
                });
              }
            });
          });
          return <PinnedBar pinnedServices={pinnedSvcs} />;
        })()}

        {servicesAndBookmarksGroups}

        <div id="footer" className="flex flex-col mt-auto p-8 w-full">
          <div id="style" className="flex w-full justify-end">
            {!settings?.color && <ColorToggle />}
            <Revalidate />
            {!settings.theme && <ThemeToggle />}
          </div>

          <div id="version" className="flex mt-4 w-full justify-end">
            {!settings.hideVersion && <Version disableUpdateCheck={settings.disableUpdateCheck} />}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Wrapper({ initialSettings, fallback }) {
  const { theme } = useContext(ThemeContext);
  const { color } = useContext(ColorContext);
  const { settings } = useContext(SettingsContext);
  const [livePreset, setLivePreset] = useState(null);

  // Fetch live preset on mount
  useEffect(() => {
    fetch("/api/panelio-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.panelioThemePreset) setLivePreset(data.panelioThemePreset);
      })
      .catch(() => {});
  }, []);
  let backgroundImage = "";
  let opacity = initialSettings?.backgroundOpacity ?? 0;
  let backgroundBlur = false;
  let backgroundSaturate = false;
  let backgroundBrightness = false;
  if (initialSettings?.background) {
    const bg = initialSettings.background;
    if (typeof bg === "object") {
      backgroundImage = bg.image || "";
      if (bg.opacity !== undefined) {
        opacity = 1 - bg.opacity / 100;
      }
      backgroundBlur = bg.blur !== undefined;
      backgroundSaturate = bg.saturate !== undefined;
      backgroundBrightness = bg.brightness !== undefined;
    } else {
      backgroundImage = bg;
    }
  }

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const pageWrapper = document.getElementById("page_wrapper");

    html.classList.remove("dark", "scheme-dark", "scheme-light");
    html.classList.toggle("dark", theme === "dark");
    html.classList.add(theme === "dark" ? "scheme-dark" : "scheme-light");

    const desiredThemeClass = `theme-${color || settings?.color || initialSettings.color || "slate"}`;
    const themeClassesToRemove = Array.from(html.classList).filter(
      (cls) => cls.startsWith("theme-") && cls !== desiredThemeClass,
    );
    if (themeClassesToRemove.length) {
      html.classList.remove(...themeClassesToRemove);
    }
    if (!html.classList.contains(desiredThemeClass)) {
      html.classList.add(desiredThemeClass);
    }

    const preset = livePreset || settings?.panelioThemePreset || initialSettings?.panelioThemePreset || "velvet-night";
    const desiredPresetClass = `panelio-preset-${preset}`;
    const presetClassesToRemove = Array.from(html.classList).filter(
      (cls) => cls.startsWith("panelio-preset-") && cls !== desiredPresetClass,
    );
    if (presetClassesToRemove.length) {
      html.classList.remove(...presetClassesToRemove);
    }
    if (!html.classList.contains(desiredPresetClass)) {
      html.classList.add(desiredPresetClass);
    }

    const presetMap = {
      "velvet-night": { start: "21 15 44", mid: "31 41 88", end: "15 23 42", accent: "139 92 246" },
      "ember-grid": { start: "28 25 23", mid: "68 36 18", end: "17 24 39", accent: "249 115 22" },
      cloudmilk: { start: "248 250 252", mid: "239 246 255", end: "255 255 255", accent: "96 165 250" },
      "solar-linen": { start: "255 251 235", mid: "250 245 230", end: "255 255 250", accent: "217 119 6" },
      "north-sea": { start: "226 232 240", mid: "203 213 225", end: "241 245 249", accent: "14 116 144" },
    };
    const activePreset = presetMap[preset] || presetMap["velvet-night"];
    html.style.setProperty("--panelio-accent", activePreset.accent);

    // Apply preset gradient to page wrapper (covers the full page)
    if (pageWrapper) {
      pageWrapper.style.backgroundImage = `radial-gradient(circle at top left, rgb(${activePreset.accent} / 0.16), transparent 28%), linear-gradient(135deg, rgb(${activePreset.start}) 0%, rgb(${activePreset.mid}) 45%, rgb(${activePreset.end}) 100%)`;
      pageWrapper.style.backgroundAttachment = "fixed";
      pageWrapper.style.backgroundColor = `rgb(${activePreset.end})`;
    }
  }, [backgroundImage, opacity, theme, color, initialSettings.color, settings?.color, livePreset]);

  return (
    <>
      {backgroundImage && (
        <div
          id="background"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(rgb(var(--bg-color) / ${opacity}), rgb(var(--bg-color) / ${opacity})), url('${backgroundImage}')`,
          }}
        />
      )}
      <div id="page_wrapper" className="relative h-full">
        <div
          id="inner_wrapper"
          tabIndex="-1"
          className={classNames(
            "w-full h-full overflow-auto",
            backgroundBlur &&
              `backdrop-blur${initialSettings.background.blur?.length ? `-${initialSettings.background.blur}` : ""}`,
            backgroundSaturate && `backdrop-saturate-${initialSettings.background.saturate}`,
            backgroundBrightness && `backdrop-brightness-${initialSettings.background.brightness}`,
          )}
        >
          <Index initialSettings={initialSettings} fallback={fallback} />
        </div>
      </div>
    </>
  );
}
