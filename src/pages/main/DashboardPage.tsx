import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Home, Users, Trophy, Settings, CreditCard, Feather,
  BarChart2, Archive, FileText, ChevronLeft, ChevronRight, Menu, Shield
} from "lucide-react";

import { PigeonsTab } from "../../Tabs/PigeonsTab";
import { CompetitionsTab } from "../../Tabs/CompetitionsTab";
import { UserSettingsTab } from "../../Tabs/UserSettingsTab";
import { LoftsTab } from "../../Tabs/LoftsTab";
import { SubscriptionsTab } from "../../Tabs/SubscriptionsTab";
import { BreedingTab } from "../../Tabs/BreedingTab";
import { AdminTab } from "../../Tabs/AdminTab";
import SubscriptionWallPage from "./SubscriptionWallPage";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../../components/utilities/UserContext";

interface TabItem {
  title: string;
  icon: React.ReactNode;
  key: string;
  content: React.ReactNode;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, loading, isSubscriptionActive } = useUser();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "lofts";

  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
    setMobileOpen(false);
  };

  const tabs: TabItem[] = [
    { key: "lofts", title: t("dashboardPage.lofts"), icon: <Home />, content: <LoftsTab /> },
    { key: "pigeons", title: t("dashboardPage.pigeons"), icon: <Users />, content: <PigeonsTab /> },
    { key: "competitions", title: t("dashboardPage.competitions"), icon: <Trophy />, content: <CompetitionsTab /> },
    { key: "breeding", title: t("dashboardPage.breeding"), icon: <Feather />, content: <BreedingTab /> },
    { key: "statistics", title: t("dashboardPage.statistics"), icon: <BarChart2 />, content: <div className="p-6">{t("dashboardPage.manageStatisticsText")}</div> },
    { key: "inventory", title: t("dashboardPage.inventory"), icon: <Archive />, content: <div className="p-6">{t("dashboardPage.manageInventoryText")}</div> },
    { key: "reports", title: t("dashboardPage.reports"), icon: <FileText />, content: <div className="p-6">{t("dashboardPage.manageReportsText")}</div> },
    { key: "profile", title: t("dashboardPage.profile"), icon: <Settings />, content: <UserSettingsTab /> },
    { key: "subscriptions", title: t("dashboardPage.subscriptions"), icon: <CreditCard />, content: <SubscriptionsTab /> },
  ];

  if (user?.role === "ADMIN") {
    tabs.push({
      key: "admin",
      title: "Admin Panel",
      icon: <Shield />,
      content: <AdminTab />
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // A user has access if they have a paid subscription OR if their trial period is still active.
  const isTrialActive =
    ((user?.subscription || "FREE").toUpperCase() === "FREE") &&
    user?.subscriptionValidUntil &&
    new Date(user.subscriptionValidUntil) > new Date();

  const hasAccess = isSubscriptionActive || isTrialActive;

  const content =
    !hasAccess && activeTab !== "subscriptions" && activeTab !== "profile" && activeTab !== "admin" ? (
      <SubscriptionWallPage />
    ) : (
      tabs.find((tab) => tab.key === activeTab)?.content
    );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded-lg shadow-md"
      >
        <Menu size={22} />
      </button>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-50
          bg-indigo-600 text-white shadow-lg md:shadow-none
          transition-all duration-300
          flex flex-col
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="self-end hidden md:block text-indigo-200 hover:text-white mb-6"
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>

          {/* Profile */}
          <div className={`flex items-center gap-4 mb-8 ${collapsed ? "justify-center" : "px-2"}`}>
            <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-sm shrink-0 border-2 border-indigo-400">
              {user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-medium text-indigo-100">
                  {t("dashboardPage.welcome", { username: "" })}
                </h1>
                <p className="text-base font-bold truncate">{user?.username}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  w-full flex items-center gap-3 rounded-lg transition-all duration-200
                  ${collapsed ? "justify-center p-3" : "px-4 py-3"}
                  ${
                    activeTab === tab.key
                      ? "bg-white text-indigo-600 shadow-sm font-medium"
                      : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                  }
                `}
                title={collapsed ? tab.title : ""}
              >
                <span className="shrink-0">{tab.icon}</span>
                {!collapsed && <span>{tab.title}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden h-16" /> {/* Spacer for mobile menu button */}
        <div className="flex-1 overflow-auto">
          {content}
        </div>
      </div>
    </div>
  );
}
