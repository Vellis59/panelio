import { BiError, BiInfoCircle, BiLinkExternal, BiCopy } from "react-icons/bi";

function DetailRow({ label, value, mono = false }) {
  if (!value) return null;

  return (
    <div className="rounded-md border border-white/10 bg-black/10 p-3">
      <div className="text-xs uppercase tracking-wide opacity-60 mb-1">{label}</div>
      <div className={mono ? "font-mono text-sm break-all" : "text-sm break-words"}>{value}</div>
    </div>
  );
}

export default function PanelioHostDiagnostic({ error }) {
  const allowedHosts = Array.isArray(error?.allowedHosts) ? error.allowedHosts : [];
  const isHostValidation = error?.error === "Host validation failed.";

  if (!isHostValidation) {
    return null;
  }

  const suggestedEnv = error?.suggestedEnv;
  const docsUrl = error?.docs || "/docs/installation/#homepage_allowed_hosts";

  const copySuggestedEnv = async () => {
    if (!suggestedEnv || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(suggestedEnv);
    } catch {
      // no-op: copy is best effort only
    }
  };

  return (
    <div className="w-full min-h-screen container m-auto justify-center p-6 sm:p-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <div className="bg-theme-500 dark:bg-theme-600 text-theme-600 dark:text-theme-300 rounded-md shadow-md border-4 border-transparent overflow-hidden">
          <div className="bg-rose-200 text-rose-800 dark:text-rose-200 dark:bg-rose-800 p-3 font-bold flex items-center gap-2">
            <BiError className="w-6 h-6" />
            Panelio could not validate this host
          </div>

          <div className="p-4 sm:p-5 text-theme-100 dark:text-theme-200 flex flex-col gap-4">
            <p className="text-sm sm:text-base">
              This request reached Panelio with a host header that is not currently allowed. The protection stays enabled,
              but the fix should usually be straightforward.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Current issue" value={error?.message} />
              <DetailRow label="What to do" value={error?.hint} />
              <DetailRow label="Suggested environment value" value={suggestedEnv} mono />
              <DetailRow label="Documentation" value={docsUrl} mono />
            </div>

            {allowedHosts.length > 0 && (
              <div className="rounded-md border border-white/10 bg-black/10 p-3">
                <div className="text-xs uppercase tracking-wide opacity-60 mb-2">Currently allowed hosts</div>
                <div className="flex flex-wrap gap-2">
                  {allowedHosts.map((host) => (
                    <span key={host} className="px-2 py-1 rounded bg-white/10 font-mono text-xs sm:text-sm">
                      {host}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-md border border-sky-300/20 bg-sky-500/10 p-4">
              <div className="font-semibold flex items-center gap-2 mb-2">
                <BiInfoCircle className="w-5 h-5" />
                Common fix
              </div>
              <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base">
                <li>Find where you set Panelio environment variables.</li>
                <li>Add the exact host shown above to <span className="font-mono">HOMEPAGE_ALLOWED_HOSTS</span>.</li>
                <li>Restart the container or app.</li>
                <li>Reload Panelio.</li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {suggestedEnv && (
                <button
                  type="button"
                  onClick={copySuggestedEnv}
                  className="inline-flex items-center gap-2 rounded-md bg-theme-700 px-4 py-2 text-white hover:bg-theme-800 transition"
                >
                  <BiCopy className="w-4 h-4" />
                  Copy suggested env value
                </button>
              )}

              <a
                href={docsUrl}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 hover:bg-white/5 transition"
              >
                <BiLinkExternal className="w-4 h-4" />
                Open host validation docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
