import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function SubscriptionWallPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {t("subscriptionWall.title")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("subscriptionWall.message")}
        </p>
        <button
          onClick={() => navigate("/dashboard?tab=subscriptions")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {t("subscriptionWall.button")}
        </button>
      </div>
    </div>
  );
}
