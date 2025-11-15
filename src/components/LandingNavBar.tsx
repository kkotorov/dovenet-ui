import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import i18n from "../i18n";

export default function LandingNavbar() {
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();
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
    setLangOpen(false);
  };

  return (
    <nav className="w-full py-6 px-8 flex items-center justify-between bg-transparent absolute top-0 left-0 z-50">
      {/* Logo */}
      <div
        className="text-2xl font-bold text-indigo-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        DoveNet
      </div>

      {/* Center Menu */}
      <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
        <a href="#features" className="hover:text-indigo-600 transition">Features</a>
        <a href="#pricing" className="hover:text-indigo-600 transition">Pricing</a>
        <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
        <a href="#support" className="hover:text-indigo-600 transition">Support</a>
        <a href="#about" className="hover:text-indigo-600 transition">About Us</a>
      </div>

      {/* Right side: Login/Signup + Language */}
      <div className="flex items-center gap-6">
        <Link to="/login" className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow hover:bg-indigo-50 transition">
          Login
        </Link>

        <Link
          to="/register"
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Sign Up
        </Link>
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
    </nav>
  );
}

