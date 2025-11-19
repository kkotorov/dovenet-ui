import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import LoftCard from "../components/LoftCard";
import CreateEditLoftModal from "../components/CreateEditLoftModal";
import type { Loft } from "../types";

export default function LoftsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lofts, setLofts] = useState<Loft[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoft, setEditingLoft] = useState<Loft | undefined>(undefined);

  const fetchLofts = async () => {
    try {
      const res = await api.get("/lofts");
      setLofts(res.data);
    } catch {
      setLofts([]);
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

  const handleDelete = async (loftId: number) => {
    if (!confirm(t("loftsPage.deleteConfirm"))) return;
    try {
      await api.delete(`/lofts/${loftId}`);
      setLofts(prev => prev.filter(l => l.id !== loftId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewPigeons = (loftId: number) => {
    navigate(`/lofts/${loftId}/pigeons`);
  };

  const handleSubmit = async (loft: Partial<Loft>) => {
    try {
      if (editingLoft) {
        const res = await api.put(`/lofts/${editingLoft.id}`, loft);
        setLofts(prev => prev.map(l => (l.id === editingLoft.id ? res.data : l)));
      } else {
        const res = await api.post("/lofts", loft);
        setLofts(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t("loftsPage.title")}</h1>
        <div className="flex gap-3">
            <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
            ← {t("loftsPage.backToDashboard")}
            </button>
            <button
            onClick={handleCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-1"
            >
            + {t("loftsPage.createLoft")}
            </button>
        </div>
        </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lofts.map(loft => (
          <LoftCard
            key={loft.id}
            loft={loft}
            onView={handleViewPigeons}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <CreateEditLoftModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingLoft}
      />
    </div>
  );
}
