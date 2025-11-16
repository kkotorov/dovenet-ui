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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
            {user?.username[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("dashboardPage.welcome", { username: user?.username })}
          </h1>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Lofts */}
        <div
          onClick={() => navigate("/lofts")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-yellow-600 mb-2">
              {t("dashboardPage.lofts")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageLoftsText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/lofts");
            }}
            className="mt-4 w-full py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
          >
            {t("dashboardPage.manageLofts")}
          </button>
        </div>

        {/* Pigeons */}
        <div
          onClick={() => navigate("/pigeons")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">
              {t("dashboardPage.pigeons")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageYourPigeons")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/pigeons");
            }}
            className="mt-4 w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            {t("dashboardPage.managePigeons")}
          </button>
        </div>

        {/* Competitions */}
        <div
          onClick={() => navigate("/competitions")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-green-600 mb-2">
              {t("dashboardPage.competitions")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageCompetitionsText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/competitions");
            }}
            className="mt-4 w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            {t("dashboardPage.manageCompetitions")}
          </button>
        </div>

        {/* Profile / Settings */}
        <div
          onClick={() => navigate("/settings")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-pink-600 mb-2">
              {t("dashboardPage.profile")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageProfileText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/settings");
            }}
            className="mt-4 w-full py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
          >
            {t("dashboardPage.openSettings")}
          </button>
        </div>

        {/* Subscriptions */}
        <div
          onClick={() => navigate("/subscriptions")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-purple-600 mb-2">
              {t("dashboardPage.subscriptions")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageSubscriptionsText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/subscriptions");
            }}
            className="mt-4 w-full py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
          >
            {t("dashboardPage.manageSubscriptions")}
          </button>
        </div>

        {/* Breeding */}
        <div
          onClick={() => navigate("/breeding")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-orange-600 mb-2">
              {t("dashboardPage.breeding")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageBreedingText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/breeding");
            }}
            className="mt-4 w-full py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition"
          >
            {t("dashboardPage.manageBreeding")}
          </button>
        </div>

        {/* Pedigrees */}
        <div
          onClick={() => navigate("/pedigrees")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-teal-600 mb-2">
              {t("dashboardPage.pedigrees")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.managePedigreesText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/pedigrees");
            }}
            className="mt-4 w-full py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
          >
            {t("dashboardPage.managePedigrees")}
          </button>
        </div>

        {/* Statistics / Analytics */}
        <div
          onClick={() => navigate("/statistics")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-blue-600 mb-2">
              {t("dashboardPage.statistics")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageStatisticsText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/statistics");
            }}
            className="mt-4 w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {t("dashboardPage.viewStatistics")}
          </button>
        </div>

        {/* Notifications */}
        <div
          onClick={() => navigate("/notifications")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              {t("dashboardPage.notifications")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageNotificationsText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/notifications");
            }}
            className="mt-4 w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
          >
            {t("dashboardPage.viewNotifications")}
          </button>
        </div>

        {/* Inventory / Supplies */}
        <div
          onClick={() => navigate("/inventory")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {t("dashboardPage.inventory")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageInventoryText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/inventory");
            }}
            className="mt-4 w-full py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition"
          >
            {t("dashboardPage.manageInventory")}
          </button>
        </div>

        {/* Reports / Exports */}
        <div
          onClick={() => navigate("/reports")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-indigo-500 mb-2">
              {t("dashboardPage.reports")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageReportsText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/reports");
            }}
            className="mt-4 w-full py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition"
          >
            {t("dashboardPage.viewReports")}
          </button>
        </div>

        {/* Marketplace / Sales */}
        <div
          onClick={() => navigate("/marketplace")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-lime-600 mb-2">
              {t("dashboardPage.marketplace")}
            </h2>
            <p className="text-gray-500">{t("dashboardPage.manageMarketplaceText")}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/marketplace");
            }}
            className="mt-4 w-full py-2 bg-lime-600 text-white font-semibold rounded-lg hover:bg-lime-700 transition"
          >
            {t("dashboardPage.visitMarketplace")}
          </button>
        </div>

      </div>
    </div>
  );
}
