import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import i18n from "../i18n";
import { useState, useRef, useEffect } from "react";

export default function TopBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear auth token
    navigate("/login"); // Redirect to login page
  };

  // Optionally hide topbar on landing
  const hideTopBar = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
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
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow"></span>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-6">
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition font-semibold"
            >
              {t("logout")}
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

      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
