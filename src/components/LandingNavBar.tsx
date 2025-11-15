import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

export default function LandingNavbar() {
  const { t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!localStorage.getItem("token"); // check login

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
    setLangOpen(false);
  };

  return (
    <nav className="w-full py-6 px-8 flex items-center justify-between bg-transparent absolute top-0 left-0 z-50">
      {/* Logo */}
      <div
        className="text-2xl font-bold text-indigo-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        {t("appName")}
      </div>

      {/* Center Menu */}
      <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
        <a href="#features" className="hover:text-indigo-600 transition">
          {t("landingNavbar.features")}
        </a>
        <a href="#pricing" className="hover:text-indigo-600 transition">
          {t("landingNavbar.pricing")}
        </a>
        <a href="#faq" className="hover:text-indigo-600 transition">
          {t("landingNavbar.faq")}
        </a>
        <a href="#support" className="hover:text-indigo-600 transition">
          {t("landingNavbar.support")}
        </a>
        <a href="#about" className="hover:text-indigo-600 transition">
          {t("landingNavbar.aboutUs")}
        </a>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-6">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium">
              {t("topBar.login")}
            </Link>

            <Link
              to="/register"
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
            >
              {t("topBar.signup")}
            </Link>
          </>
        ) : (
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
          >
            {t("landingNavbar.goToDashboard")}
          </button>
        )}

        {/* Language Icon */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="text-2xl text-gray-700 hover:text-indigo-600 transition"
          >
            🌐
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border p-2 w-28">
              <button
                onClick={() => changeLanguage("en")}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
              >
                {t("topBar.languageEnglish")}
              </button>
              <button
                onClick={() => changeLanguage("bg")}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
              >
                {t("topBar.languageBulgarian")}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
