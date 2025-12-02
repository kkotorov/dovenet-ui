import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/api";
import { Edit2, Trash2, MapPin, Cloud, Wind, Droplet } from "lucide-react";
import CompetitionFormModal from "../components/competitions/CompetitionFormModal";
import type { Competition } from "../types";

export function CompetitionsTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCompetitionId, setDeleteCompetitionId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [sortBy, setSortBy] = useState<"name" | "date" | "distance">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");


  const fetchCompetitions = async () => {
    try {
      const res = await api.get<Competition[]>("/competitions");
      setCompetitions(res.data);
    } catch (err) {
      console.error("Failed to fetch competitions", err);
      toast.error(t("competitionsPage.fetchError"));
      setCompetitions([]);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleCreateOrUpdate = async (competition: Competition) => {
    try {
      if (competition.id) await api.patch(`/competitions/${competition.id}`, competition);
      else await api.post("/competitions", competition);

      toast.success(
        competition.id ? t("competitionsPage.updated") : t("competitionsPage.created")
      );
      fetchCompetitions();
      setOpenForm(false);
      setEditingCompetition(null);
    } catch (err) {
      console.error("Failed to save competition", err);
      toast.error(t("competitionsPage.saveFailed"));
    }
  };

  const handleDelete = async () => {
    if (!deleteCompetitionId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/competitions/${deleteCompetitionId}`);
      setCompetitions((prev) => prev.filter((c) => c.id !== deleteCompetitionId));
      toast.success(t("competitionsPage.deleted"));
      setDeleteModalOpen(false);
      setDeleteCompetitionId(null);
    } catch (err) {
      console.error("Failed to delete competition", err);
      toast.error(t("competitionsPage.deleteFailed"));
    } finally {
      setDeleteLoading(false);
    }
  };

    const sortCompetitions = (list: Competition[]) => {
    return [...list].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;

      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name) * dir;

        case "date":
          return (
            (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir
          );

        case "distance":
          const da = a.distanceKm ?? 0;
          const db = b.distanceKm ?? 0;
          return (da - db) * dir;

        default:
          return 0;
      }
    });
  };


  const filteredCompetitions = sortCompetitions(
    competitions.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );


  return (
    <div className="p-4">
      <Toaster position="top-right" />

      {/* Search and Create */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder={t("competitionsPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 w-64 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 py-2 rounded-lg border border-gray-300 bg-white"
          >
            <option value="date">{t("competitionsPage.sortByDate")}</option>
            <option value="name">{t("competitionsPage.sortByName")}</option>
            <option value="distance">{t("competitionsPage.sortByDistance")}</option>
          </select>

          {/* Asc/Desc toggle */}
          <button
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100"
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </button>
        </div>
          <button
            onClick={() => {
              setEditingCompetition(null);
              setOpenForm(true);
            }}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg border border-indigo-600 hover:bg-indigo-400 transition"
          >
            + {t("competitionsPage.createCompetition")}
          </button>
      </div>


      {/* Vertical list of competitions */}
      <div className="flex flex-col gap-4">
        {filteredCompetitions.map((c) => (
          <div
            key={c.id}
            className="relative bg-white shadow-lg rounded-2xl p-5 hover:shadow-2xl transition cursor-pointer"
            onClick={() => c.id && navigate(`/competitions/${c.id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{c.name}</h2>
                <p className="text-sm text-gray-500">{c.date}</p>
              </div>
              <div className="flex gap-2">
                {/* Edit Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCompetition(c);
                    setOpenForm(true);
                  }}
                  className="p-1 text-yellow-600 rounded-md hover:bg-yellow-100 transition flex items-center justify-center"
                  title={t("competitionFormModal.edit")}
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (c.id !== undefined) {
                      setDeleteCompetitionId(c.id);
                      setDeleteModalOpen(true);
                    }
                  }}
                  className="p-1 text-red-600 rounded-md hover:bg-red-100 transition flex items-center justify-center"
                  title={t("competitionFormModal.delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Optional info */}
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              {c.distanceKm != null && (
                <p>
                  <strong>{t("competitionFormModal.distance")}:</strong> {c.distanceKm} km
                </p>
              )}

              {c.startLatitude != null && c.startLongitude != null && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://www.google.com/maps?q=${c.startLatitude},${c.startLongitude}`,
                      "_blank"
                    );
                  }}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition w-fit"
                >
                  <MapPin className="w-4 h-4" />
                  {c.startLatitude.toFixed(2)}, {c.startLongitude.toFixed(2)}
                </button>
              )}

              {(c.temperatureC != null ||
                c.windSpeedKmH != null ||
                c.rain != null ||
                c.conditionsNotes) && (
                <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                    <Cloud className="w-4 h-4" /> {t("competitionFormModal.weather")}
                  </h3>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                    {c.temperatureC != null && (
                      <div className="flex items-center gap-1">
                        <Cloud className="w-4 h-4" /> {c.temperatureC}°C
                      </div>
                    )}
                    {c.windSpeedKmH != null && c.windDirection && (
                      <div className="flex items-center gap-1">
                        <Wind className="w-4 h-4" /> {c.windSpeedKmH} km/h {c.windDirection}
                      </div>
                    )}
                    {c.rain != null && (
                      <div className="flex items-center gap-1">
                        <Droplet className="w-4 h-4" /> {c.rain ? t("common.yes") : t("common.no")}
                      </div>
                    )}
                  </div>

                  {c.conditionsNotes && (
                    <p className="mt-2 text-xs text-gray-600 italic">{c.conditionsNotes}</p>
                  )}
                </div>
              )}

              {c.notes && <p className="mt-3 text-sm text-gray-600 italic">{c.notes}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {openForm && (
        <CompetitionFormModal
          open={openForm}
          initialData={editingCompetition || undefined}
          onClose={() => setOpenForm(false)}
          onSubmit={handleCreateOrUpdate}
        />
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t("competitionsPage.deleteTitle")}</h2>
            <p className="text-sm text-gray-600 mb-6">{t("competitionsPage.deleteConfirmText")}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                disabled={deleteLoading}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                disabled={deleteLoading}
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
