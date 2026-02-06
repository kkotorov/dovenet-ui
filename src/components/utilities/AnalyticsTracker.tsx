import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (import.meta.env.PROD && import.meta.env.VITE_GA_MEASUREMENT_ID && consent === "true") {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }
  }, [location]);

  return null;
};

export default AnalyticsTracker;