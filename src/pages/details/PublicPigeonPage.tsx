import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import api from "../../api/api";
import { ArrowLeft, Calendar, Hash, Palette, Activity, Award } from "lucide-react";
import type { Pigeon, CompetitionEntry } from "../../types";
import { useTranslation } from "react-i18next";

export default function PublicPigeonPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pigeon, setPigeon] = useState<Pigeon | null>(null);
  const [loading, setLoading] = useState(true);
  const [competitions, setCompetitions] = useState<CompetitionEntry[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const sortedCompetitions = [...competitions];
  if (sortConfig) {
    sortedCompetitions.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      switch (sortConfig.key) {
        case "name":
          aValue = a.competition?.name || "";
          bValue = b.competition?.name || "";
          break;
        case "place":
          aValue = a.place ?? Number.MAX_SAFE_INTEGER;
          bValue = b.place ?? Number.MAX_SAFE_INTEGER;
          break;
        case "date":
          aValue = a.competition?.date ? new Date(a.competition.date).getTime() : 0;
          bValue = b.competition?.date ? new Date(b.competition.date).getTime() : 0;
          break;
        default:
          aValue = "";
          bValue = "";
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const [pigeonRes, competitionsRes] = await Promise.all([
          api.get(`/pigeons/public/${id}`),
          api.get(`/pigeons/public/${id}/competitions`),
        ]);
        setPigeon(pigeonRes.data);
        setCompetitions(competitionsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const genderSymbol = (gender?: string) => {
    if (!gender) return { symbol: "", color: "text-gray-600" };
    const lower = gender.toLowerCase();
    if (lower === "male") return { symbol: "♂", color: "text-blue-600" };
    if (lower === "female") return { symbol: "♀", color: "text-rose-600" };
    return { symbol: "", color: "text-gray-600" };
  };

  const getThemeColors = (gender?: string) => {
    const lower = gender?.toLowerCase();
    if (lower === "female") {
      return {
        background: "bg-gradient-to-r from-rose-600 to-rose-500",
        badge: "text-rose-100 bg-rose-700/30"
      };
    }
    return {
      background: "bg-gradient-to-r from-blue-600 to-blue-500",
      badge: "text-blue-100 bg-blue-700/30"
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-3/5 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-40 bg-white rounded-2xl shadow-md p-4" />
              <div className="h-40 bg-white rounded-2xl shadow-md p-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pigeon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">{t("pigeonPage.notFound")}</h2>
            <p className="text-sm text-gray-600 mb-4">{t("pigeonPage.notFoundDesc")}</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              {t("pigeonPage.backToList")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">{t("pigeonPage.back")}</span>
            </button>
        </div>

        {/* Hero / Basic Info Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/50">
            {/* Top Banner with Name and Ring */}
            <div className={`${getThemeColors(pigeon.gender).background} p-8 text-white`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {pigeon.name || <span className="italic opacity-70">{t("pigeonPage.unnamed")}</span>}
                        </h1>
                        <div className={`flex items-center gap-2 mt-2 ${getThemeColors(pigeon.gender).badge} w-fit px-3 py-1 rounded-lg backdrop-blur-sm`}>
                            <Hash className="w-4 h-4" />
                            <span className="font-mono text-lg">{pigeon.ringNumber}</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm`}>
                        <span className="text-2xl drop-shadow-sm">{genderSymbol(pigeon.gender).symbol}</span>
                        <span className="font-semibold capitalize tracking-wide">{pigeon.gender || "-"}</span>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Palette className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t("pigeonPage.color")}</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900">{pigeon.color || "-"}</p>
                </div>
                
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t("pigeonPage.status")}</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                        {pigeon.status ? t(`pigeonsPage.${pigeon.status}`) : "-"}
                    </p>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t("pigeonPage.birthDate")}</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900">{pigeon.birthDate || "-"}</p>
                </div>
            </div>
        </div>

        {/* Competitions */}
        <div className="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 text-yellow-700 rounded-xl">
                      <Award className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{t("pigeonPage.competitions")}</h2>
              </div>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
                  {competitions.length}
              </span>
          </div>

          {competitions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                <p>{t("pigeonPage.noCompetitions")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleSort("name")}>{t("pigeonPage.competition")}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleSort("date")}>{t("pigeonPage.date")}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleSort("distance")}>{t("pigeonPage.distance")}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleSort("place")}>{t("pigeonPage.position")}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleSort("score")}>{t("pigeonPage.score")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedCompetitions.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{c.competition?.name || "-"}</td>
                      <td className="px-4 py-2">{c.competition?.date || "-"}</td>
                      <td className="px-4 py-2">{c.actualDistanceKm ?? "-"}</td>
                      <td className="px-4 py-2">{c.place ?? "-"}</td>
                      <td className="px-4 py-2">{c.score ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
