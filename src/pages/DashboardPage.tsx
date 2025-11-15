import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import type { User } from "../api/auth";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
            {user?.username[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("welcome", { username: user?.username })}
          </h1>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Pigeons */}
        <div
          onClick={() => navigate("/pigeons")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">
              {t("pigeons")}
            </h2>
            <p className="text-gray-500">{t("manageYourPigeons")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/pigeons");
            }}
            className="mt-4 w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            {t("managePigeons")}
          </button>
        </div>

        {/* Subscriptions */}
        <div
          onClick={() => navigate("/subscriptions")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-purple-600 mb-2">
              {t("subscriptions")}
            </h2>
            <p className="text-gray-500">{t("manageSubscriptionsText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/subscriptions");
            }}
            className="mt-4 w-full py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
          >
            {t("manageSubscriptions")}
          </button>
        </div>

        {/* Competitions */}
        <div
          onClick={() => navigate("/competitions")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-green-600 mb-2">
              {t("competitions")}
            </h2>
            <p className="text-gray-500">{t("manageCompetitionsText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/competitions");
            }}
            className="mt-4 w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            {t("manageCompetitions")}
          </button>
        </div>

        {/* Lofts */}
        <div
          onClick={() => navigate("/lofts")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-yellow-600 mb-2">
              {t("lofts")}
            </h2>
            <p className="text-gray-500">{t("manageLoftsText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/lofts");
            }}
            className="mt-4 w-full py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
          >
            {t("manageLofts")}
          </button>
        </div>

        {/* Profile / Settings */}
        <div
          onClick={() => navigate("/settings")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-pink-600 mb-2">
              {t("profile")}
            </h2>
            <p className="text-gray-500">{t("manageProfileText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/settings");
            }}
            className="mt-4 w-full py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
          >
            {t("openSettings")}
          </button>
        </div>
      </div>
    </div>
  );
}
