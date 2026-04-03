import { useEffect, useState } from "react";

export default function StatusDot({ url }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    const check = async () => {
      try {
        const res = await fetch(`/api/ping-url?url=${encodeURIComponent(url)}`, { signal: controller.signal });
        const data = await res.json();
        setStatus(data.status === "up" ? "up" : "down");
      } catch {
        // keep current status on fetch error
      }
    };
    check();
    const interval = setInterval(check, 60000);
    return () => { controller.abort(); clearInterval(interval); };
  }, [url]);

  if (!url) return null;

  const colors = {
    checking: "bg-gray-400 animate-pulse",
    up: "bg-emerald-500",
    down: "bg-red-500",
  };

  return (
    <div
      className={`w-2.5 h-2.5 rounded-full ${colors[status]} shadow-sm`}
      title={status === "up" ? "Online" : status === "down" ? "Down" : "Checking..."}
    />
  );
}
