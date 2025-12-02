import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useUser } from "./UserContext";
import api from "../../api/api";
import i18n from "../../i18n";

export default function TopBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { user, setUser, loading } = useUser();
  const isLoggedIn = !!user;
  const hideTopBar = location.pathname === "/";

  const [langOpen, setLangOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (!langOpen) return;
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    setMenuPos({
      left: rect.right - 112,
      top: rect.bottom + window.scrollY + 8,
    });
  }, [langOpen]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const node = e.target as Node;
      if (btnRef.current?.contains(node)) return;
      if (portalRef.current?.contains(node)) return;
      setLangOpen(false);
    };

    if (langOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [langOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);

    if (user) {
      api.patch("/users/me/update-settings", { language: lang })
         .then(() => setUser({ ...user, language: lang }))
         .catch(() => {});
    }

    setLangOpen(false);
  };

  if (hideTopBar) return null;

  return (
    <>
      <div className="w-full px-6 py-4 bg-white/70 backdrop-blur-lg shadow-sm flex items-center justify-between z-50">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-2xl font-bold text-indigo-600">DoveNet</span>
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow" />
        </div>

        <div className="flex items-center gap-6">
          {!loading && (
            <>
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition font-semibold"
                  >
                    {t("topBar.login")}
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition font-semibold"
                  >
                    {t("topBar.signup")}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition font-semibold"
                >
                  {t("topBar.logout")}
                </button>
              )}
            </>
          )}

          {/* Language */}
          <button
            ref={btnRef}
            onClick={() => setLangOpen((v) => !v)}
            className="text-2xl text-gray-700 hover:text-indigo-600 transition"
          >
            🌐
          </button>
        </div>
      </div>

      {langOpen && menuPos &&
        createPortal(
          <div
            ref={(el) => {
              portalRef.current = el;
            }}
            className="absolute bg-white shadow-lg rounded-lg border p-2 w-28"
            style={{ left: menuPos.left, top: menuPos.top, zIndex: 999999 }}
          >
            <button
              onClick={() => changeLanguage("en")}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded"
            >
              English
            </button>
            <button
              onClick={() => changeLanguage("bg")}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded"
            >
              Български
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
