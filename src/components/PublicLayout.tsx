import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import i18n from "../i18n";
import { useState, useRef, useEffect } from "react";

export default function PublicLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect current page (hide navbar on landing)
  const hideTopBar = location.pathname === "/";

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setLangOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">

      {/* Top bar (hidden on landing page) */}
      {!hideTopBar && (
        <div className="
          w-full px-6 py-4 bg-white/70 backdrop-blur-lg shadow-sm
          flex items-center justify-between z-50
        ">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="text-2xl font-bold text-indigo-600">DoveNet</span>
            {/* A small glowing indicator (cool SaaS touch) */}
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow"></span>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-6">

            {/* Login */}
            <button
              onClick={() => navigate("/login")}
              className="text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              {t("login")}
            </button>

            {/* Register */}
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition font-semibold"
            >
              {t("register")}
            </button>

            {/* Language selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="text-2xl text-gray-700 hover:text-indigo-600 transition"
              >
                🌐
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border p-2 w-28 z-50">
                  <button
                    onClick={() => changeLanguage("en")}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage("bg")}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                  >
                    Български
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
