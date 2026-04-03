import ResolvedIcon from "components/resolvedicon";

export default function PinnedBar({ pinnedServices }) {
  if (!pinnedServices || pinnedServices.length === 0) return null;

  const togglePin = async (e, groupName, serviceName) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/admin/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ group: groupName, service: serviceName }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {}
  };

  return (
    <section className="m-5 mb-0 sm:m-9 sm:mb-0">
      <div className="rounded-xl border border-white/10 bg-theme-100/20 dark:bg-white/5 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 p-3 sm:p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-theme-800/50 dark:text-theme-200/40 mb-2">
          ⭐ Pinned
        </div>
        <div className="flex flex-wrap gap-2">
          {pinnedServices.map((svc) => {
            const hasLink = svc.href && svc.href !== "#";
            const content = (
              <div
                key={`${svc.__groupName}::${svc.name}`}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-all cursor-pointer border border-white/5 relative"
                title={svc.description || svc.name}
              >
                <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                  <ResolvedIcon icon={svc.icon} href={svc.href} serviceName={svc.name} width={24} height={24} />
                </div>
                <span className="text-sm font-medium text-theme-800 dark:text-theme-200 truncate max-w-[120px] pr-6">
                  {svc.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => togglePin(e, svc.__groupName, svc.name)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 opacity-50 hover:opacity-100 transition-opacity"
                  title="Unpin"
                >
                  ★
                </button>
              </div>
            );

            return hasLink ? (
              <a key={`${svc.__groupName}::${svc.name}`} href={svc.href} target="_blank" rel="noreferrer" className="no-underline">
                {content}
              </a>
            ) : (
              content
            );
          })}
        </div>
      </div>
    </section>
  );
}
