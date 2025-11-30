import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

interface BreedingSeason {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  totalPairs: number;
  totalOffspring: number;
}

export function BreedingTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mock data for now
  const [seasons, setSeasons] = useState<BreedingSeason[]>([
    { id: 1, name: "Spring 2025", startDate: "2025-03-01", endDate: "2025-05-31", totalPairs: 12, totalOffspring: 34 },
    { id: 2, name: "Fall 2025", startDate: "2025-09-01", endDate: "2025-11-30", totalPairs: 8, totalOffspring: 21 },
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("breedingPage.title")}</h1>
        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 flex items-center gap-2"
          onClick={() => alert("Create new season (mock)")}
        >
          <Plus className="w-4 h-4" /> {t("breedingPage.createSeason")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seasons.map((season) => (
          <div
            key={season.id}
            className="bg-white rounded-2xl shadow-lg p-5 cursor-pointer hover:shadow-2xl transition"
            onClick={() => navigate(`/breeding/${season.id}`)}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-2">{season.name}</h2>
            <p className="text-sm text-gray-500">
              {season.startDate} → {season.endDate}
            </p>
            <div className="mt-3 text-sm text-gray-700 flex justify-between">
              <span>{t("breedingPage.pairs")}: {season.totalPairs}</span>
              <span>{t("breedingPage.offspring")}: {season.totalOffspring}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
