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
        <Card
          title={t("pigeons")}
          text={t("manageYourPigeons")}
          color="indigo"
          onClick={() => navigate("/pigeons")}
          buttonText={t("managePigeons")}
        />

        {/* Subscriptions */}
        <Card
          title={t("subscriptions")}
          text={t("manageSubscriptionsText")}
          color="purple"
          onClick={() => navigate("/subscriptions")}
          buttonText={t("manageSubscriptions")}
        />

        {/* Competitions */}
        <Card
          title={t("competitions")}
          text={t("manageCompetitionsText")}
          color="green"
          onClick={() => navigate("/competitions")}
          buttonText={t("manageCompetitions")}
        />

        {/* Lofts */}
        <Card
          title={t("lofts")}
          text={t("manageLoftsText")}
          color="yellow"
          onClick={() => navigate("/lofts")}
          buttonText={t("manageLofts")}
        />

        {/* Profile */}
        <Card
          title={t("profile")}
          text={t("manageProfileText")}
          color="pink"
          onClick={() => navigate("/settings")}
          buttonText={t("openSettings")}
        />
      </div>
    </div>
  );
}

// Reusable Card Component
interface CardProps {
  title: string;
  text: string;
  color: string; // Tailwind color prefix
  onClick: () => void;
  buttonText: string;
}

function Card({ title, text, color, onClick, buttonText }: CardProps) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    green: "bg-green-600 hover:bg-green-700",
    yellow: "bg-yellow-600 hover:bg-yellow-700",
    pink: "bg-pink-600 hover:bg-pink-700",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
    >
      <div>
        <h2 className={`text-lg font-semibold mb-2 text-${color}-600`}>{title}</h2>
        <p className="text-gray-500">{text}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`mt-4 w-full py-2 text-white font-semibold rounded-lg ${colorMap[color]} transition`}
      >
        {buttonText}
      </button>
    </div>
  );
}
