import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

function getGreeting(hour, t) {
  if (hour >= 5 && hour < 12) return t("panelio.greeting.morning") || "Good morning";
  if (hour >= 12 && hour < 18) return t("panelio.greeting.afternoon") || "Good afternoon";
  if (hour >= 18 && hour < 22) return t("panelio.greeting.evening") || "Good evening";
  return t("panelio.greeting.night") || "Good night";
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  return date.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
}

export default function PanelioGreeting({ settings }) {
  const { t } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const greeting = getGreeting(hour, t);
  const name = settings?.panelioGreetingName || "";
  const showClock = settings?.panelioShowClock !== false; // default true
  const showGreeting = settings?.panelioShowGreeting !== false; // default true

  if (!showClock && !showGreeting) return null;

  return (
    <div className="flex flex-col items-start justify-center mr-4 min-w-0">
      {showGreeting && (
        <div className="text-sm sm:text-base font-medium text-theme-800 dark:text-theme-200 truncate">
          {greeting}{name ? `, ${name}` : ""}
        </div>
      )}
      {showClock && (
        <>
          <div className="text-2xl sm:text-3xl font-bold text-theme-900 dark:text-theme-50 tabular-nums tracking-tight leading-tight">
            {formatTime(now)}
          </div>
          <div className="text-xs text-theme-800/60 dark:text-theme-200/60 capitalize">
            {formatDate(now)}
          </div>
        </>
      )}
    </div>
  );
}
