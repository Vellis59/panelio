import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

export default function AdminLogin() {
  const { t } = useTranslation("common");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/check").then((r) => r.json()).then((d) => {
      if (d.authenticated) router.replace("/admin/dashboard");
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.replace("/admin/dashboard");
      } else {
        setError(data.error || t("panelio.admin.login.loginFailed"));
      }
    } catch {
      setError(t("panelio.admin.login.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>{t("panelio.admin.title")}</title>
      </Head>
      <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
          🔐 {t("panelio.admin.title")}
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("panelio.admin.login.passwordPlaceholder")}
            className="w-full px-4 py-2 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? "..." : t("panelio.admin.login.loginButton")}
          </button>
        </form>
        <p className="text-xs text-center mt-4 text-gray-400">
          {t("panelio.admin.login.hint")}
        </p>
      </div>
    </div>
  );
}
