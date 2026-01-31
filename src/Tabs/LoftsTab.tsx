import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { Loft } from "../types";
import LoftCard from "../components/lofts/LoftCard";
import CreateEditLoftModal from "../components/lofts/CreateEditLoftModal";
import toast, { Toaster } from "react-hot-toast";
import { PigeonsTab } from "./PigeonsTab"; 
import {
  getLofts,
  createLoft,
  updateLoft,
  deleteLoft
} from "../api/lofts";
import ConfirmDeleteModal from "../components/utilities/ConfirmDeleteModal";
import Button from "../components/utilities/Button";
import { usePageHeader } from "../components/utilities/PageHeaderContext";

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

  const { setHeader, clearHeader } = usePageHeader();

  // Fetch lofts
  const fetchLofts = async () => {
    try {
      const res = await getLofts();
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
  const handleCreate = useCallback(() => {
    setEditingLoft(undefined);
    setModalOpen(true);
  }, []);

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
      await deleteLoft(loftToDelete.id);
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
        const res = await updateLoft(editingLoft.id, loft);
        setLofts((prev) =>
          prev.map((l) => (l.id === editingLoft.id ? res.data : l))
        );
        toast.success(t("loftsPage.updateSuccess"));
      } else {
        const res = await createLoft(loft);
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

  // Update TopBar Header
  useEffect(() => {
    if (selectedLoft) return; // Let PigeonsTab handle the header if active

    setHeader({
      title: null,
      right: (
        <input
          type="text"
          placeholder={t("loftsPage.searchPlaceholder")}
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
              <option value="name">{t("loftsPage.sortByName")}</option>
              <option value="pigeons">{t("loftsPage.sortByPigeons")}</option>
              <option value="capacity">{t("loftsPage.sortByCapacity")}</option>
            </select>
            <Button
              variant="secondary"
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              className="px-3"
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </Button>
          </div>
          <Button onClick={handleCreate}>+ {t("loftsPage.createLoft")}</Button>
        </>
      ),
    });

    return () => clearHeader();
  }, [selectedLoft, searchTerm, sortBy, sortDirection, t, setHeader, handleCreate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBackToLofts = useCallback(() => setSelectedLoft(null), []);

  // ====== Step 3: Conditional render for PigeonsTab ======
  if (selectedLoft) {
    return (
      <PigeonsTab
        loftId={selectedLoft.id}
        loftName={selectedLoft.name}
        onNavigateBack={handleBackToLofts}
      />
    );
  }

  // ====== Original LoftsTab content ======
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <Toaster position="top-right" />

      {/* Loft Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0 mt-4">
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

    <ConfirmDeleteModal
      open={deleteModalOpen}
      title={t("loftsPage.deleteTitle")}
      message={t("loftsPage.deleteConfirm")}
      cancelLabel={t("common.cancel")}
      deleteLabel={t("common.delete")}
      loading={deleteLoading}
      onCancel={() => setDeleteModalOpen(false)}
      onConfirm={handleDelete}
    />
    </div>
  );
}
