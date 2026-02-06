import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ReactGA from "react-ga4";
import Button from "./Button";

export default function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent === null) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);

    // Initialize GA immediately upon acceptance
    if (import.meta.env.PROD && import.meta.env.VITE_GA_MEASUREMENT_ID) {
      ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    }
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "false");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[200] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 text-center md:text-left">
          <p>
            {t("cookieBanner.message")}{" "}
            <Link to="/cookies" className="text-indigo-600 hover:underline font-medium">
              {t("cookieBanner.policy")}
            </Link>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t("cookieBanner.decline")}
          </button>
          <Button onClick={handleAccept} className="px-6 py-2 text-sm">
            {t("cookieBanner.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}