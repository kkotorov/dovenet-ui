import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { useState } from 'react';

export default function PublicLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');
  const [openDropdown, setOpenDropdown] = useState(false);

  const changeLang = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang);
    setOpenDropdown(false);
  };

  const hideTopBar = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">

      {/* Top bar (hidden on Landing Page) */}
      {!hideTopBar && (
        <div className="w-full flex justify-end p-4 gap-6 bg-white/70 backdrop-blur-md shadow-sm relative">

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(!openDropdown)}
              className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-100 transition flex items-center gap-2"
            >
              {language === 'en' ? '🇬🇧 English' : '🇧🇬 Български'}
              <span className="text-gray-500">▼</span>
            </button>

            {openDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <button
                  onClick={() => changeLang('en')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => changeLang('bg')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  🇧🇬 Български
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <button
            onClick={() => navigate('/login')}
            className="text-gray-700 hover:text-blue-600 transition"
          >
            {t('login')}
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow"
          >
            {t('register')}
          </button>
        </div>
      )}

      {/* Page Content */}
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
