import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import type { User } from "../api/auth";
import {
  Home, Users, Trophy, Settings, CreditCard, Feather, Layers,
  BarChart2, Bell, Archive, FileText, ShoppingCart
} from "lucide-react";

import { PigeonsTab } from "../Tabs/PigeonsTab";
import { CompetitionsTab } from "../Tabs/CompetitionsTab";
import { UserSettingsTab } from "../Tabs/UserSettingsTab";
import { useSearchParams } from "react-router-dom";
import { LoftsTab } from "../Tabs/LoftsTab";

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

  // NEW: read tab from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "lofts";

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Sync URL → state whenever URL changes
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
  };

  const tabs: TabItem[] = [
    {
      key: "lofts",
      title: t("dashboardPage.lofts"),
      icon: <Home />,
      content: <LoftsTab />
    },
    {
      key: "pigeons",
      title: t("dashboardPage.pigeons"),
      icon: <Users />,
      content: (
        <PigeonsTab
          onNavigateBack={() => handleTabChange("pigeons")}
        />
      ),
    },
    {
      key: "competitions",
      title: t("dashboardPage.competitions"),
      icon: <Trophy />,
      content: <CompetitionsTab />
    },
    {
      key: "profile",
      title: t("dashboardPage.profile"),
      icon: <Settings />,
      content: <UserSettingsTab />
    },




    {
      key: "subscriptions",
      title: t("dashboardPage.subscriptions"),
      icon: <CreditCard />,
      content: <div>{t("dashboardPage.manageSubscriptionsText")}</div>,
    },
    {
      key: "breeding",
      title: t("dashboardPage.breeding"),
      icon: <Feather />,
      content: <div>{t("dashboardPage.manageBreedingText")}</div>,
    },
    {
      key: "pedigrees",
      title: t("dashboardPage.pedigrees"),
      icon: <Layers />,
      content: <div>{t("dashboardPage.managePedigreesText")}</div>,
    },
    {
      key: "statistics",
      title: t("dashboardPage.statistics"),
      icon: <BarChart2 />,
      content: <div>{t("dashboardPage.manageStatisticsText")}</div>,
    },
    {
      key: "notifications",
      title: t("dashboardPage.notifications"),
      icon: <Bell />,
      content: <div>{t("dashboardPage.manageNotificationsText")}</div>,
    },
    {
      key: "inventory",
      title: t("dashboardPage.inventory"),
      icon: <Archive />,
      content: <div>{t("dashboardPage.manageInventoryText")}</div>,
    },
    {
      key: "reports",
      title: t("dashboardPage.reports"),
      icon: <FileText />,
      content: <div>{t("dashboardPage.manageReportsText")}</div>,
    },
    {
      key: "marketplace",
      title: t("dashboardPage.marketplace"),
      icon: <ShoppingCart />,
      content: <div>{t("dashboardPage.manageMarketplaceText")}</div>,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex">
      
      {/* Sidebar */}
      <div className="flex flex-col w-64 space-y-2 sticky top-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
            {user?.username[0].toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            {t("dashboardPage.welcome", { username: user?.username })}
          </h1>
        </div>

        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.icon}
            <span>{tab.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 ml-6 p-6 bg-white rounded-2xl shadow min-h-[400px] overflow-auto">
        {tabs.find((tab) => tab.key === activeTab)?.content}
      </div>
    </div>
  );
}
