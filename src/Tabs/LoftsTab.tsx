import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // <-- import
import api from "../api/api";
import type { Loft } from "../types";
import LoftCard from "../components/LoftCard";
import CreateEditLoftModal from "../components/CreateEditLoftModal";
import PageHeader from "../components/PageHeader";
import toast, { Toaster } from "react-hot-toast";

export function LoftsTab() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // <-- hook for navigation
  const [lofts, setLofts] = useState<Loft[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoft, setEditingLoft] = useState<Loft | undefined>(undefined);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loftToDelete, setLoftToDelete] = useState<Loft | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

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
      console.error(err);
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
      console.error(err);
      toast.error(
        editingLoft
          ? t("loftsPage.updateFailed")
          : t("loftsPage.createFailed")
      );
    }
  };

  const filteredLofts = lofts.filter((loft) =>
    loft.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <PageHeader
        title={t("loftsPage.title")}
        right={
          <input
            type="text"
            placeholder={t("loftsPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 w-64 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        }
        actions={
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-1"
          >
            + {t("loftsPage.createLoft")}
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLofts.map((loft) => (
          <LoftCard
            key={loft.id}
            loft={loft}
            onView={() => loft.id && navigate(`/lofts/${loft.id}/pigeons`)} // <-- correct route
            onEdit={handleEdit}
            onDelete={() => handleDeleteClick(loft)}
          />
        ))}
      </div>

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
