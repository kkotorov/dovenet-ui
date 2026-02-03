import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Edit2, Trash2 } from "lucide-react";
import CreateEditSeasonModal from "../components/breeding/CreateEditSeasonModal";
import type { BreedingSeasonDTO, BreedingSeasonCard } from "../types";
import ConfirmDeleteModal from "../components/utilities/ConfirmDeleteModal";
import {
  createBreedingSeason,
  updateBreedingSeason,
  deleteBreedingSeason,
} from "../api/breeding";
import Button from "../components/utilities/Button";
import { usePageHeader } from "../components/utilities/PageHeaderContext";
import api from "../api/api";

interface BreedingTabProps {
  adminUserId?: number;
  className?: string;
}

export function BreedingTab({ adminUserId, className }: BreedingTabProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [seasons, setSeasons] = useState<BreedingSeasonCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "pairs" | "offspring">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [openModal, setOpenModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<BreedingSeasonDTO | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSeasonId, setDeleteSeasonId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { setHeader, clearHeader } = usePageHeader();

  const fetchSeasons = async () => {
    try {
    const url = adminUserId ? `/admin/users/${adminUserId}/breeding-seasons` : "/breeding-seasons";
    const res = await api.get<BreedingSeasonDTO[]>(url);
    const mapped = res.data.map((s) => ({
      id: s.id,
      name: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      totalPairs: s.pairs.length,
      totalOffspring: s.pairs.reduce((acc, p) => acc + p.offspringIds.length, 0),
      dto: s,
    }));

      setSeasons(mapped);
    } catch (err) {
      console.error(err);
      toast.error(t("breedingPage.fetchError"));
      setSeasons([]);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  const handleCreateOrUpdate = async (season: BreedingSeasonDTO) => {
    try {
      if (season.id) {
        if (adminUserId) {
          await api.put(`/admin/breeding-seasons/${season.id}`, season);
        } else {
          await updateBreedingSeason(season);
        }
        toast.success(t("breedingPage.updateSuccess"));
      } else {
        if (adminUserId) {
          await api.post(`/admin/users/${adminUserId}/breeding-seasons`, season);
        } else {
          await createBreedingSeason(season);
        }
        toast.success(t("breedingPage.createSuccess"));
      }

      fetchSeasons();
      setOpenModal(false);
      setEditingSeason(null);
    } catch (err) {
      console.error(err);
      toast.error(t("breedingPage.saveError"));
    }
  };

  const handleDelete = async () => {
    if (!deleteSeasonId) return;
    setDeleteLoading(true);

    try {
      if (adminUserId) {
        await api.delete(`/admin/breeding-seasons/${deleteSeasonId}`);
      } else {
        await deleteBreedingSeason(deleteSeasonId);
      }
      setSeasons((prev) => prev.filter((s) => s.id !== deleteSeasonId));
      toast.success(t("breedingPage.seasonDeleted"));
      setDeleteModalOpen(false);
      setDeleteSeasonId(null);
    } catch (err) {
      console.error(err);
      toast.error(t("breedingPage.deleteError"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const sortSeasons = (list: BreedingSeasonCard[]) => {
    return [...list].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name) * dir;
        case "date": return (new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) * dir;
        case "pairs": return (a.totalPairs - b.totalPairs) * dir;
        case "offspring": return (a.totalOffspring - b.totalOffspring) * dir;
        default: return 0;
      }
    });
  };

  const filteredSeasons = sortSeasons(
    seasons.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    setHeader({
      title: null,
      right: (
        <input
          type="text"
          placeholder={t("breedingPage.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
        />
      ),
      actions: (
        <>
          <div className="flex gap-2 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm"
            >
              <option value="date">{t("breedingPage.sortByDate")}</option>
              <option value="name">{t("breedingPage.sortByName")}</option>
              <option value="pairs">{t("breedingPage.sortByPairs")}</option>
              <option value="offspring">{t("breedingPage.sortByOffspring")}</option>
            </select>
            <Button
              variant="secondary"
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              className="px-3"
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </Button>
          </div>
          <Button onClick={() => { setEditingSeason(null); setOpenModal(true); }}>
            + {t("breedingPage.createSeason")}
          </Button>
        </>
      ),
    });
    return () => clearHeader();
  }, [searchTerm, sortBy, sortDirection, t, setHeader]);

  return (
    <div className={className || "min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans"}>
      <Toaster position="top-right" />

      {/* Grid of seasons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0 mt-4">
        {filteredSeasons.map((s) => (
          <div
            key={s.id}
            className={`relative bg-white shadow-lg rounded-2xl p-5 transition flex flex-col h-full ${!adminUserId ? "hover:shadow-2xl cursor-pointer" : ""}`}
            onClick={() => !adminUserId && navigate(`/breeding/${s.id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{s.name}</h2>
                <p className="text-sm text-gray-500">{s.startDate} → {s.endDate}</p>
              </div>

              <div className="flex gap-2">
                {/* Edit Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSeason(s.dto);
                    setOpenModal(true);
                  }}
                  className="p-1 text-yellow-600 rounded-md hover:bg-yellow-100 transition flex items-center justify-center"
                  title={t("seasonsPage.edit")}
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (s.id) {
                      setDeleteSeasonId(s.id);
                      setDeleteModalOpen(true);
                    }
                  }}
                  className="p-1 text-red-600 rounded-md hover:bg-red-100 transition flex items-center justify-center"
                  title={t("seasonsPage.delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            <div className="flex flex-col gap-2 text-sm text-gray-700">
              <p><strong>{t("breedingPage.pairs")}:</strong> {s.totalPairs}</p>
              <p><strong>{t("breedingPage.offspring")}:</strong> {s.totalOffspring}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {openModal && (
        <CreateEditSeasonModal
          open={openModal}
          initialData={editingSeason || undefined}
          onClose={() => setOpenModal(false)}
          onSubmit={handleCreateOrUpdate}
        />
      )}

      {/* Delete */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title={t("breedingPage.deleteSeasonTitle")}
        message={t("breedingPage.deleteSeasonConfirm")}
        cancelLabel={t("common.cancel")}
        deleteLabel={t("common.delete")}
        loading={deleteLoading}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

    </div>
  );
}
