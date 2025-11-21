import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import AssignPigeonModal from "../components/AssignPigeonModal";

export interface CompetitionEntry {
  id?: number;
  pigeonId: number;
  pigeonRingNumber: string;
  place?: number | null;
  score?: number | null;
  actualDistanceKm?: number | null;
  flightTimeHours?: number | null;
  notes?: string;
}

export default function CompetitionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [competition, setCompetition] = useState<any>(null);
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [openAssignModal, setOpenAssignModal] = useState(false);

  const fetchCompetition = async () => {
    try {
      const res = await api.get(`/competitions/${id}`);
      setCompetition(res.data);
    } catch (err) {
      console.error("Failed to load competition", err);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await api.get(`/competition-entries/competition/${id}`);
      setEntries(res.data);
    } catch (err) {
      console.error("Failed to load entries", err);
    }
  };

  useEffect(() => {
    fetchCompetition();
    fetchEntries();
  }, [id]);

  const handleAssignPigeon = async (pigeonId: number) => {
    try {
      await api.post("/competition-entries", {
        competitionId: Number(id),
        pigeonId,
      });
      fetchEntries();
      setOpenAssignModal(false);
    } catch (err) {
      console.error("Failed to assign pigeon", err);
    }
  };

  const handleRemove = async (entryId: number) => {
    if (!confirm(t("competitionsPage.deleteConfirm"))) return;

    try {
      await api.delete(`/competition-entries/${entryId}`);
      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (err) {
      console.error("Failed to remove entry", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> {t("common.back")}
      </button>

      {/* Competition header */}
      {competition && (
        <div className="bg-white shadow rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold">{competition.name}</h1>
          <p className="text-gray-600">{competition.date}</p>
        </div>
      )}

      {/* Assigned pigeons */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t("competitionsPage.assignedPigeons")}</h2>

          <button
            onClick={() => setOpenAssignModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> {t("competitionsPage.assignPigeon")}
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="text-gray-500">{t("competitionsPage.noPigeonsAssigned")}</p>
        ) : (
          <ul className="divide-y">
            {entries.map(entry => (
              <li key={entry.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{entry.pigeonRingNumber}</p>
                  {entry.place && (
                    <p className="text-sm text-gray-600">
                      {t("competitionsPage.place")}: {entry.place}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleRemove(entry.id!)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assign modal */}
      {openAssignModal && (
        <AssignPigeonModal
          competitionId={Number(id)}
          open={openAssignModal}
          onClose={() => setOpenAssignModal(false)}
          onSelectPigeon={handleAssignPigeon}
        />
      )}
    </div>
  );
}
