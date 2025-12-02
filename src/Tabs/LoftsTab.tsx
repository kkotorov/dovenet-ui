import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import type { Loft } from "../types";
import LoftCard from "../components/LoftCard";
import CreateEditLoftModal from "../components/CreateEditLoftModal";
import toast, { Toaster } from "react-hot-toast";
import { PigeonsTab } from "./PigeonsTab"; 

export function LoftsTab() {
  const { t } = useTranslation();

  const [lofts, setLofts] = useState<Loft[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoft, setEditingLoft] = useState<Loft | undefined>(undefined);
  const [selectedLoft, setSelectedLoft] = useState<Loft | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loftToDelete, setLoftToDelete] = useState<Loft | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "pigeons" | "capacity">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch lofts
  const fetchLofts = async () => {
    try {
      const res = await api.get("/lofts");
      setLofts(res.data);
    } catch (err) {
      setLofts([]);
      toast.error(t("loftsPage.fetchFailed"));
    }
  };

  useEffect(() => {
    fetchLofts();
  }, []);

  // Handlers
  const handleCreate = () => {
    setEditingLoft(undefined);
    setModalOpen(true);
  };

  const handleEdit = (loft: Loft) => {
    setEditingLoft(loft);
    setModalOpen(true);
  };

  const handleDeleteClick = (loft: Loft) => {
    setLoftToDelete(loft);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!loftToDelete) return;
    setDeleteLoading(true);

    try {
      await api.delete(`/lofts/${loftToDelete.id}`);
      setLofts((prev) => prev.filter((l) => l.id !== loftToDelete.id));
      toast.success(t("loftsPage.deleteSuccess"));
      setDeleteModalOpen(false);
      setLoftToDelete(null);
    } catch (err) {
      toast.error(t("loftsPage.deleteFailed"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (loft: Partial<Loft>) => {
    try {
      if (editingLoft) {
        const res = await api.put(`/lofts/${editingLoft.id}`, loft);
        setLofts((prev) =>
          prev.map((l) => (l.id === editingLoft.id ? res.data : l))
        );
        toast.success(t("loftsPage.updateSuccess"));
      } else {
        const res = await api.post("/lofts", loft);
        setLofts((prev) => [...prev, res.data]);
        toast.success(t("loftsPage.createSuccess"));
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(
        editingLoft
          ? t("loftsPage.updateFailed")
          : t("loftsPage.createFailed")
      );
    }
  };

  // Sorting
  const sortedLofts = useMemo(() => {
    const filtered = lofts.filter((loft) =>
      loft.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      if (sortBy === "capacity") return ((a.capacity || 0) - (b.capacity || 0)) * dir;
      if (sortBy === "pigeons") return ((a.pigeonCount || 0) - (b.pigeonCount || 0)) * dir;
      return 0;
    });
  }, [lofts, searchTerm, sortBy, sortDirection]);

  // ====== Step 3: Conditional render for PigeonsTab ======
  if (selectedLoft) {
    return (
      <PigeonsTab
        loftId={selectedLoft.id}
        loftName={selectedLoft.name}
        onNavigateBack={() => setSelectedLoft(null)}
      />
    );
  }

  // ====== Original LoftsTab content ======
  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {/* Top controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Search + Sort */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder={t("loftsPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 w-64 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
          >
            <option value="name">{t("loftsPage.sortByName")}</option>
            <option value="pigeons">{t("loftsPage.sortByPigeons")}</option>
            <option value="capacity">{t("loftsPage.sortByCapacity")}</option>
          </select>
          <button
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </button>
        </div>

        {/* Create button */}
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg border border-indigo-600 hover:bg-indigo-400 transition flex items-center gap-1"
        >
          + {t("loftsPage.createLoft")}
        </button>
      </div>

      {/* Loft Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedLofts.map((loft) => (
          <LoftCard
            key={loft.id}
            loft={loft}
            onView={() => setSelectedLoft(loft)} // ← show PigeonsTab
            onEdit={handleEdit}
            onDelete={() => handleDeleteClick(loft)}
          />
        ))}
      </div>

      {/* Modals */}
      <CreateEditLoftModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingLoft}
      />

      {deleteModalOpen && loftToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {t("loftsPage.deleteTitle")}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {t("loftsPage.deleteConfirm")}
            </p>
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
