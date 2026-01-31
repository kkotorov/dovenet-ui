import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Edit2, Trash2, MapPin, Cloud, Wind, Droplet } from "lucide-react";
import CompetitionFormModal from "../components/competitions/CompetitionFormModal";
import ConfirmDeleteModal from "../components/utilities/ConfirmDeleteModal";
import type { Competition } from "../types";

import {
  getCompetitions,
  createCompetition,
  updateCompetition,
  deleteCompetition,
} from "../api/competition";
import PageHeader from "../components/utilities/PageHeader";
import Button from "../components/utilities/Button";

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

  const fetchCompetitionsList = async () => {
    try {
      const data = await getCompetitions();
      setCompetitions(data);
    } catch (err) {
      console.error("Failed to fetch competitions", err);
      toast.error(t("competitionsPage.fetchError"));
      setCompetitions([]);
    }
  };

  useEffect(() => {
    fetchCompetitionsList();
  }, []);

  const handleCreateOrUpdate = async (competition: Competition) => {
    try {
      if (competition.id) await updateCompetition(competition);
      else await createCompetition(competition);

      toast.success(
        competition.id ? t("competitionsPage.updated") : t("competitionsPage.created")
      );
      fetchCompetitionsList();
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
      await deleteCompetition(deleteCompetitionId);
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
          return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <Toaster position="top-right" />

      <PageHeader
        title={t("competitionsPage.manageCompetitions")}
        right={
          <input
            type="text"
            placeholder={t("competitionsPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        }
        actions={
          <>
            <div className="flex gap-2 items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="date">{t("competitionsPage.sortByDate")}</option>
                <option value="name">{t("competitionsPage.sortByName")}</option>
                <option value="distance">{t("competitionsPage.sortByDistance")}</option>
              </select>
              <Button
                variant="secondary"
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                className="px-3"
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>
            </div>
            <Button onClick={() => {
              setEditingCompetition(null);
              setOpenForm(true);
            }}>
              + {t("competitionsPage.createCompetition")}
            </Button>
          </>
        }
      />

      {/* Vertical list of competitions */}
      <div className="flex flex-col gap-4 relative z-0">
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

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title={t("competitionsPage.deleteTitle")}
        message={t("competitionsPage.deleteConfirmText")}
        cancelLabel={t("common.cancel")}
        deleteLabel={t("common.delete")}
        loading={deleteLoading}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

    </div>
  );
}
