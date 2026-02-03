import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import api from "../../api/api";
import i18n from "../../i18n";
import { LogOut, Settings, Globe, ChevronDown, LifeBuoy } from "lucide-react";
import { usePageHeader } from "./PageHeaderContext";

export default function TopBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { user, setUser, loading } = useUser();
  const isLoggedIn = !!user;
  const hideTopBar = location.pathname === "/" || location.pathname === "/contact" || location.pathname === "/about" || location.pathname === "/privacy" || location.pathname === "/terms" || location.pathname === "/cookies";

  const { title, right, actions } = usePageHeader();

  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
    setUserMenuOpen(false);
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
    setUserMenuOpen(false);
  };

  const getInitials = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`;
    return user.username?.substring(0, 2).toUpperCase() || "U";
  };

  if (hideTopBar) return null;

  return (
    <header
      className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-md border-b border-blue-200" : "bg-white/80 backdrop-blur-sm border-b border-blue-50 shadow-none"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              DoveNet
            </span>
            {title && (
              <>
                <div className="hidden md:block h-6 w-px bg-gray-300 mx-2" />
                <span className="hidden md:block text-lg font-medium text-gray-700 whitespace-nowrap">{title}</span>
              </>
            )}
          </div>

          {/* Center: Dynamic Search/Filters */}
          <div className="flex-1 flex justify-center px-4 min-w-0">
            {right && <div className="w-full max-w-md">{right}</div>}
          </div>

          <div className="flex items-center gap-4">
            {/* Dynamic Actions */}
            {actions && <div className="hidden md:flex items-center gap-2 mr-2">{actions}</div>}

            {/* Language Selector */}
            {!isLoggedIn && (
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title={t("common.language") || "Language"}
              >
                <Globe className="w-5 h-5" />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${i18n.language === 'en' ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage("bg")}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${i18n.language === 'bg' ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700'}`}
                  >
                    Български
                  </button>
                </div>
              )}
            </div>
            )}

            {!isLoggedIn && <div className="h-6 w-px bg-gray-200 mx-1" />}

            {!loading && (
              <>
                {!isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate("/login")}
                      className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      {t("topBar.login")}
                    </button>
                    <button
                      onClick={() => navigate("/register")}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg transition-all"
                    >
                      {t("topBar.signup")}
                    </button>
                  </div>
                ) : (
                  <div className="relative" ref={userRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                    >
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm border border-indigo-200">
                        {getInitials()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">
                        {user?.firstName || user?.username}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        
                        <button
                          onClick={() => { navigate("/dashboard?tab=profile"); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          {t("userSettingsPage.profileInfo") || "Profile"}
                        </button>
                        
                        <button
                          onClick={() => { navigate("/contact"); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <LifeBuoy className="w-4 h-4 text-gray-400" />
                          {t("topBar.support") || "Support"}
                        </button>
                        
                        <div className="my-1 border-t border-gray-100" />
                        
                        <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {t("common.language") || "Language"}
                        </div>
                        <button
                          onClick={() => changeLanguage("en")}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${i18n.language === 'en' ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => changeLanguage("bg")}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${i18n.language === 'bg' ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          Български
                        </button>
                        
                        <div className="my-1 border-t border-gray-100" />
                        
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          {t("topBar.logout")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
