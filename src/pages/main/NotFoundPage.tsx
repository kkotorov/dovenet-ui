import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-600 flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-lg w-full">
        <h1 className="text-9xl font-extrabold text-white/20 select-none">404</h1>
        <h2 className="text-3xl font-bold text-white mt-4 mb-6">
          {t("notFound.title", "Page Not Found")}
        </h2>
        <p className="text-blue-100 text-lg mb-10">
          {t("notFound.message", "Oops! The page you are looking for does not exist. It might have been moved or deleted.")}
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-blue-50 transition-all transform hover:-translate-y-1"
        >
          <Home className="w-5 h-5" />
          {t("notFound.backHome", "Back to Home")}
        </Link>
      </div>
    </div>
  );
}