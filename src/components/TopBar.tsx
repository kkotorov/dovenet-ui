import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import i18n from "../i18n";
import { createPortal } from "react-dom";

export default function TopBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [langOpen, setLangOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number } | null>(
    null
  );

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const hideTopBar = location.pathname === "/";

  useEffect(() => {
    if (!langOpen) return;
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const left = rect.right - 112; 
    const top = rect.bottom + scrollY + 8;
    setMenuPos({ left: Math.max(left, 8), top });
  }, [langOpen]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      setLangOpen(false);
    };
    if (langOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [langOpen]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setLangOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (hideTopBar) return null;

  return (
    <>
      <div className="w-full px-6 py-4 bg-white/70 backdrop-blur-lg shadow-sm flex items-center justify-between z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-2xl font-bold text-indigo-600">DoveNet</span>
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow" />
        </div>

        <div className="flex items-center gap-6">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition font-semibold"
              >
                {t("topBar.login")}
              </button>
              <button
                onClick={() => navigate("/signup")}
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

          <div className="relative">
            <button
              ref={btnRef}
              onClick={() => setLangOpen((s) => !s)}
              className="text-2xl text-gray-700 hover:text-indigo-600 transition"
              aria-haspopup="true"
              aria-expanded={langOpen}
            >
              🌐
            </button>
          </div>
        </div>
      </div>

      {langOpen && menuPos &&
        createPortal(
          <div
            ref={(el) => {
              portalRef.current = el;
            }}
            className="bg-white shadow-lg rounded-lg border p-2 w-28"
            style={{
              position: "absolute",
              left: `${menuPos.left}px`,
              top: `${menuPos.top}px`,
              zIndex: 2147483647,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            <button
              onClick={() => changeLanguage("en")}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
            >
              {t("topBar.languageEnglish")}
            </button>
            <button
              onClick={() => changeLanguage("bg")}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
            >
              {t("topBar.languageBulgarian")}
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
