// Full implementation with lighter sidebar color
// React + TailwindCSS
// Replace your DashboardPage.tsx with this file content

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import type { User } from "../api/auth";
import {
  Home, Users, Trophy, Settings, CreditCard, Feather, Layers,
  BarChart2, Bell, Archive, FileText, ShoppingCart,
  ChevronLeft, ChevronRight, Menu
} from "lucide-react";

import { PigeonsTab } from "../Tabs/PigeonsTab";
import { CompetitionsTab } from "../Tabs/CompetitionsTab";
import { UserSettingsTab } from "../Tabs/UserSettingsTab";
import { useSearchParams } from "react-router-dom";
import { LoftsTab } from "../Tabs/LoftsTab";
import { SubscriptionsTab } from "../Tabs/SubscriptionsTab";

interface TabItem {
  title: string;
  icon: React.ReactNode;
  key: string;
  content: React.ReactNode;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "lofts";

  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
    setMobileOpen(false);
  };

  const tabs: TabItem[] = [
    { key: "lofts", title: t("dashboardPage.lofts"), icon: <Home />, content: <LoftsTab /> },
    { key: "pigeons", title: t("dashboardPage.pigeons"), icon: <Users />, content: <PigeonsTab onNavigateBack={() => handleTabChange("pigeons")} /> },
    { key: "competitions", title: t("dashboardPage.competitions"), icon: <Trophy />, content: <CompetitionsTab /> },
    { key: "profile", title: t("dashboardPage.profile"), icon: <Settings />, content: <UserSettingsTab /> },
    { key: "subscriptions", title: t("dashboardPage.subscriptions"), icon: <CreditCard />, content: <SubscriptionsTab /> },
    { key: "breeding", title: t("dashboardPage.breeding"), icon: <Feather />, content: <div>{t("dashboardPage.manageBreedingText")}</div> },
    { key: "pedigrees", title: t("dashboardPage.pedigrees"), icon: <Layers />, content: <div>{t("dashboardPage.managePedigreesText")}</div> },
    { key: "statistics", title: t("dashboardPage.statistics"), icon: <BarChart2 />, content: <div>{t("dashboardPage.manageStatisticsText")}</div> },
    { key: "notifications", title: t("dashboardPage.notifications"), icon: <Bell />, content: <div>{t("dashboardPage.manageNotificationsText")}</div> },
    { key: "inventory", title: t("dashboardPage.inventory"), icon: <Archive />, content: <div>{t("dashboardPage.manageInventoryText")}</div> },
    { key: "reports", title: t("dashboardPage.reports"), icon: <FileText />, content: <div>{t("dashboardPage.manageReportsText")}</div> },
    { key: "marketplace", title: t("dashboardPage.marketplace"), icon: <ShoppingCart />, content: <div>{t("dashboardPage.manageMarketplaceText")}</div> },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex relative">

      {/* Floating Hamburger Menu for Mobile */}
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-6 left-6 z-50 bg-indigo-500 text-white p-3 rounded-full shadow-lg">
        <Menu size={22} />
      </button>

      {/* SIDEBAR - lighter color */}
      <div className={`fixed md:static top-0 left-0 h-full md:h-auto z-40 bg-indigo-500 border border-indigo-600 shadow-xl transition-all duration-300 ${collapsed ? "w-20" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} rounded-r-3xl p-6 flex flex-col space-y-4`}>

        {/* Close mobile sidebar when clicking outside */}
        {mobileOpen && <div className="fixed inset-0 bg-black/30 md:hidden z-30" onClick={() => setMobileOpen(false)}></div>}

        {/* Collapse Button (only desktop) */}
        <button onClick={() => setCollapsed(!collapsed)} className="self-end hidden md:block text-white drop-shadow">
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-400 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
            {user?.username[0].toUpperCase()}
          </div>
          {!collapsed && <h1 className="text-lg font-semibold text-white drop-shadow-lg">{t("dashboardPage.welcome", { username: user?.username })}</h1>}
        </div>

        {/* Tabs */}
<div className="flex flex-col space-y-2 mt-4">
  {tabs.map(tab => (
    <button
      key={tab.key}
      onClick={() => handleTabChange(tab.key)}
      className={`
        flex items-center gap-3 rounded-xl transition backdrop-blur-xl
        ${collapsed ? "justify-center px-0 py-3 w-full" : "justify-start px-4 py-3"}
        ${activeTab === tab.key
          ? "bg-indigo-400 text-white shadow-lg"
          : "bg-indigo-400/70 text-white hover:bg-indigo-300/70"
        }
      `}
    >
      <span className="flex-shrink-0">{tab.icon}</span>
      {!collapsed && <span>{tab.title}</span>}
    </button>
  ))}
</div>



      </div>

      {/* CONTENT */}
      <div className="flex-1 md:ml-6 mt-20 md:mt-0 p-6 bg-white rounded-3xl shadow-xl min-h-[400px] overflow-auto">
        {tabs.find(tab => tab.key === activeTab)?.content}
      </div>
    </div>
  );
}