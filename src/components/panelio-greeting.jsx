import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

const GREETINGS = {
  en: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", night: "Good night" },
  fr: { morning: "Bonjour", afternoon: "Bon après-midi", evening: "Bonsoir", night: "Bonne nuit" },
  de: { morning: "Guten Morgen", afternoon: "Guten Tag", evening: "Guten Abend", night: "Gute Nacht" },
  es: { morning: "Buenos días", afternoon: "Buenas tardes", evening: "Buenas noches", night: "Buenas noches" },
  it: { morning: "Buongiorno", afternoon: "Buon pomeriggio", evening: "Buonasera", night: "Buona notte" },
  pt: { morning: "Bom dia", afternoon: "Boa tarde", evening: "Boa noite", night: "Boa noite" },
  nl: { morning: "Goedemorgen", afternoon: "Goedemiddag", evening: "Goedenavond", night: "Goedenacht" },
};

function getGreeting(hour, language) {
  const baseLanguage = (language || "en").split(/[-_]/)[0];
  const dict = GREETINGS[baseLanguage] || GREETINGS.en;

  if (hour >= 5 && hour < 12) return dict.morning;
  if (hour >= 12 && hour < 18) return dict.afternoon;
  if (hour >= 18 && hour < 22) return dict.evening;
  return dict.night;
}

function formatTime(date, language) {
  return date.toLocaleTimeString(language || undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date, language) {
  return date.toLocaleDateString(language || undefined, { weekday: "long", day: "numeric", month: "long" });
}

export default function PanelioGreeting({ settings }) {
  const { i18n } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const language = settings?.language || i18n?.language || "en";
  const greeting = getGreeting(hour, language);
  const name = settings?.panelioGreetingName || "";
  const showClock = settings?.panelioShowClock !== false;
  const showGreeting = settings?.panelioShowGreeting !== false;

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
            {formatTime(now, language)}
          </div>
          <div className="text-xs text-theme-800/60 dark:text-theme-200/60 capitalize">
            {formatDate(now, language)}
          </div>
        </>
      )}
    </div>
  );
}
