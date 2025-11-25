import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Edit2, Trash2, MapPin, Cloud, Wind, Droplet } from "lucide-react";
import CompetitionFormModal from "../components/CompetitionFormModal";
import PageHeader from "../components/PageHeader";

export interface Competition {
  id?: number;
  name: string;
  date: string;
  startLatitude?: number | null;
  startLongitude?: number | null;
  distanceKm?: number | null;
  notes?: string;
  temperatureC?: number | null;
  windSpeedKmH?: number | null;
  windDirection?: string;
  rain?: boolean | null;
  conditionsNotes?: string;
}

export default function CompetitionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingCompetition, setEditingCompetition] =
    useState<Competition | null>(null);

  const fetchCompetitions = async () => {
    try {
      const res = await api.get<Competition[]>("/competitions");
      setCompetitions(res.data);
    } catch (err) {
      console.error("Failed to fetch competitions", err);
      setCompetitions([]);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleCreateOrUpdate = async (competition: Competition) => {
    try {
      if (competition.id) {
        await api.patch(`/competitions/${competition.id}`, competition);
      } else {
        await api.post("/competitions", competition);
      }
      fetchCompetitions();
      setOpenForm(false);
    } catch (err) {
      console.error("Failed to save competition", err);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm(t("competitionsPage.deleteConfirm"))) return;
    try {
      await api.delete(`/competitions/${id}`);
      setCompetitions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete competition", err);
    }
  };

  const filteredCompetitions = competitions.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <PageHeader
        title={t("competitionsPage.title")}
        right={
          <input
            type="text"
            placeholder={t("competitionsPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 w-64 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        }
        actions={
          <>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              ← {t("competitionsPage.back")}
            </button>

            <button
              onClick={() => {
                setEditingCompetition(null);
                setOpenForm(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              + {t("competitionsPage.createCompetition")}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetitions.map((c) => (
          <div
            key={c.id}
            className="relative bg-white shadow-lg rounded-2xl p-5 hover:shadow-2xl transition cursor-pointer"
          >
            {/* TOP-LEVEL OVERLAY → catches clicks unless blocked */}
            <div
              onClick={() => navigate(`/competitions/${c.id}`)}
              className="absolute inset-0 z-20"
            />

            {/* Card content below the overlay */}
            <div className="relative z-30 pointer-events-none">
              <div className="flex justify-between items-start mb-3">
                <div className="pointer-events-none">
                  <h2 className="text-lg font-bold text-gray-800">{c.name}</h2>
                  <p className="text-sm text-gray-500">{c.date}</p>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCompetition(c);
                      setOpenForm(true);
                    }}
                    className="p-2 text-yellow-700 rounded-md hover:bg-yellow-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c.id);
                    }}
                    className="p-2 text-red-700 rounded-md hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pointer-events-none">
                {c.distanceKm != null && (
                  <p className="text-sm text-gray-700 pointer-events-none">
                    <strong>{t("competitionFormModal.distance")}:</strong>{" "}
                    {c.distanceKm} km
                  </p>
                )}

                {/* MAP BUTTON (shrink wrap + independent click) */}
                {c.startLatitude != null && c.startLongitude != null && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://www.google.com/maps?q=${c.startLatitude},${c.startLongitude}`,
                        "_blank"
                      );
                    }}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition text-sm font-medium w-fit pointer-events-auto"
                  >
                    <MapPin className="w-4 h-4" />
                    {c.startLatitude.toFixed(2)}, {c.startLongitude.toFixed(2)}
                  </button>
                )}

                {(c.temperatureC != null ||
                  c.windSpeedKmH != null ||
                  c.rain != null ||
                  c.conditionsNotes) && (
                  <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200 pointer-events-none">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1 pointer-events-none">
                      <Cloud className="w-4 h-4" />{" "}
                      {t("competitionFormModal.weather")}
                    </h3>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-700 pointer-events-none">
                      {c.temperatureC != null && (
                        <div className="flex items-center gap-1 pointer-events-none">
                          <Cloud className="w-4 h-4" /> {c.temperatureC}°C
                        </div>
                      )}

                      {c.windSpeedKmH != null && c.windDirection && (
                        <div className="flex items-center gap-1 pointer-events-none">
                          <Wind className="w-4 h-4" /> {c.windSpeedKmH} km/h{" "}
                          {c.windDirection}
                        </div>
                      )}

                      {c.rain != null && (
                        <div className="flex items-center gap-1 pointer-events-none">
                          <Droplet className="w-4 h-4" />{" "}
                          {c.rain ? t("common.yes") : t("common.no")}
                        </div>
                      )}
                    </div>

                    {c.conditionsNotes && (
                      <p className="mt-2 text-xs text-gray-600 italic pointer-events-none">
                        {c.conditionsNotes}
                      </p>
                    )}
                  </div>
                )}

                {c.notes && (
                  <p className="mt-3 text-sm text-gray-600 italic pointer-events-none">
                    {c.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {openForm && (
        <CompetitionFormModal
          open={openForm}
          initialData={editingCompetition || undefined}
          onClose={() => setOpenForm(false)}
          onSubmit={handleCreateOrUpdate}
        />
      )}
    </div>
  );
}
