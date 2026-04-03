import Image from "next/image";
import { useContext } from "react";
import { SettingsContext } from "utils/contexts/settings";
import { ThemeContext } from "utils/contexts/theme";

const iconSetURLs = {
  mdi: "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/",
  si: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/",
};

// Check if a string contains emoji characters
function isEmoji(str) {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;
  return emojiRegex.test(str);
}

// Auto-favicon URL from a service href
export function autoFaviconUrl(href, size = 64) {
  try {
    const url = new URL(href);
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url.origin)}&size=${size}`;
  } catch {
    return null;
  }
}

// Generate a consistent color from a string
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 50%)`;
}

// Letter fallback component
function LetterFallback({ name, width = 32, height = 32 }) {
  const letter = (name || "?")[0].toUpperCase();
  const bgColor = stringToColor(name || "default");
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        backgroundColor: bgColor,
        color: "white",
        fontWeight: 700,
        fontSize: width * 0.5,
        lineHeight: 1,
      }}
    >
      {letter}
    </div>
  );
}

export default function ResolvedIcon({ icon, width = 32, height = 32, alt = "logo", href, serviceName }) {
  const { settings } = useContext(SettingsContext);
  const { theme } = useContext(ThemeContext);

  // Emoji support — render emoji directly
  if (icon && isEmoji(icon)) {
    return (
      <span
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: width * 0.7,
          lineHeight: 1,
        }}
        role="img"
        aria-label={alt}
      >
        {icon}
      </span>
    );
  }

  // No icon provided: try auto-favicon from href, then letter fallback
  if (!icon) {
    if (href) {
      const faviconUrl = autoFaviconUrl(href, Math.max(width, 32));
      if (faviconUrl) {
        return (
          <Image
            src={faviconUrl}
            width={width}
            height={height}
            style={{
              width,
              height,
              objectFit: "contain",
              maxHeight: "100%",
              maxWidth: "100%",
              borderRadius: "4px",
            }}
            alt={alt}
            unoptimized
          />
        );
      }
    }
    // Letter fallback
    return <LetterFallback name={serviceName || alt} width={width} height={height} />;
  }

  // direct or relative URLs
  if (icon.startsWith("http") || icon.startsWith("/")) {
    return (
      <Image
        src={`${icon}`}
        width={width}
        height={height}
        style={{
          width,
          height,
          objectFit: "contain",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
        alt={alt}
      />
    );
  }

  // check mdi- or si- prefixed icons
  const prefix = icon.split("-")[0];

  if (prefix === "sh") {
    const iconName = icon.replace("sh-", "").replace(".svg", "").replace(".png", "").replace(".webp", "");

    let extension;
    if (icon.endsWith(".svg")) {
      extension = "svg";
    } else if (icon.endsWith(".webp")) {
      extension = "webp";
    } else {
      extension = "png";
    }

    return (
      <Image
        src={`https://cdn.jsdelivr.net/gh/selfhst/icons@main/${extension}/${iconName}.${extension}`}
        width={width}
        height={height}
        style={{
          width,
          height,
          objectFit: "contain",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
        alt={alt}
      />
    );
  }

  if (prefix in iconSetURLs) {
    // default to theme setting
    let iconName = icon.replace(`${prefix}-`, "").replace(".svg", "");
    let iconColor =
      settings.iconStyle === "theme"
        ? `rgb(var(--color-${theme === "dark" ? 300 : 900}) / var(--tw-text-opacity, 1))`
        : "linear-gradient(180deg, rgb(var(--color-logo-start)), rgb(var(--color-logo-stop)))";

    // use custom hex color if provided
    const colorMatches = icon.match(/[#][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9]$/i);
    if (colorMatches?.length) {
      iconName = icon.replace(`${prefix}-`, "").replace(".svg", "").replace(`-${colorMatches[0]}`, "");
      iconColor = `${colorMatches[0]}`;
    }

    const iconSource = `${iconSetURLs[prefix]}${iconName}.svg`;

    return (
      <div
        style={{
          width,
          height,
          maxWidth: "100%",
          maxHeight: "100%",
          background: `${iconColor}`,
          mask: `url(${iconSource}) no-repeat center / contain`,
          WebkitMask: `url(${iconSource}) no-repeat center / contain`,
        }}
      />
    );
  }

  // fallback to dashboard-icons
  if (icon.endsWith(".svg")) {
    const iconName = icon.replace(".svg", "");
    return (
      <Image
        src={`https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${iconName}.svg`}
        width={width}
        height={height}
        style={{
          width,
          height,
          objectFit: "contain",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
        alt={alt}
      />
    );
  }

  if (icon.endsWith(".webp")) {
    const iconName = icon.replace(".webp", "");
    return (
      <Image
        src={`https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/${iconName}.webp`}
        width={width}
        height={height}
        style={{
          width,
          height,
          objectFit: "contain",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
        alt={alt}
      />
    );
  }

  const iconName = icon.replace(".png", "");
  return (
    <Image
      src={`https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/${iconName}.png`}
      width={width}
      height={height}
      style={{
        width,
        height,
        objectFit: "contain",
        maxHeight: "100%",
        maxWidth: "100%",
      }}
      alt={alt}
    />
  );
}
