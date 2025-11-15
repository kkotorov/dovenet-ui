import React, { useState, useRef, useEffect } from "react";
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
  const [menuPos, setMenuPos] = useState<{ left: number; top: number } | null>(null);

  // hide topbar on landing (same behavior you had)
  const hideTopBar = location.pathname === "/";

  // compute & set portal position when opening
  useEffect(() => {
    if (!langOpen) return;

    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    // place the menu under the button, left aligned to button's right edge minus width later if needed
    const left = rect.right - 112; // 112 = approximate menu width (w-28 -> 7rem -> 112px)
    const top = rect.bottom + scrollY + 8; // 8px gap

    setMenuPos({ left: Math.max(left, 8), top }); // keep some left padding
  }, [langOpen]);

  // handle outside clicks (works with portal)
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const btn = btnRef.current;
      const portalEl = portalRef.current;
      // if click is inside button OR inside portal -> ignore
      if (btn && btn.contains(target)) return;
      if (portalEl && portalEl.contains(target)) return;
      // otherwise close
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
      <div
        className="
          w-full px-6 py-4 bg-white/70 backdrop-blur-lg shadow-sm
          flex items-center justify-between z-50
        "
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-2xl font-bold text-indigo-600">DoveNet</span>
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow" />
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-6">
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition font-semibold"
          >
            {t("logout")}
          </button>

          {/* Language selector (button) */}
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

      {/* Portal-rendered dropdown so it floats above everything and isn't clipped */}
      {langOpen && menuPos &&
        createPortal(
          <div
            // attach to ref so outside-click handler above can detect portal clicks
            ref={(el) => {
              portalRef.current = el;
            }}
            className="bg-white shadow-lg rounded-lg border p-2 w-28"
            style={{
              position: "absolute",
              left: `${menuPos.left}px`,
              top: `${menuPos.top}px`,
              zIndex: 2147483647, // extremely high to be safe
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            <button
              onClick={() => changeLanguage("en")}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
            >
              English
            </button>
            <button
              onClick={() => changeLanguage("bg")}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
            >
              Български
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
