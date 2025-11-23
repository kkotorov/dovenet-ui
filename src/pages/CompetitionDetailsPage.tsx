import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import PageHeader from "../components/PageHeader";
import CompetitionEntryForm from "../components/CompetitionEntryForm";
import type { Pigeon, Competition, CompetitionEntry } from "../types";
import { Edit2, Trash2 } from "lucide-react";

export default function CompetitionDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { competitionId } = useParams<{ competitionId: string }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [userPigeons, setUserPigeons] = useState<Pigeon[]>([]);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CompetitionEntry | null>(null);

  const fetchEntries = async () => {
    try {
      const res = await api.get<CompetitionEntry[]>(`/competition-entries/competition/${competitionId}`);
      setEntries(res.data);
    } catch (err) {
      console.error("Failed to fetch competition entries", err);
      setEntries([]);
    }
  };

  const fetchUserPigeons = async () => {
    try {
      const res = await api.get<Pigeon[]>("/pigeons");
      setUserPigeons(res.data);
    } catch {
      setUserPigeons([]);
    }
  };

  const fetchCompetition = async () => {
    try {
      const res = await api.get<Competition>(`/competitions/${competitionId}`);
      setCompetition(res.data);
    } catch (err) {
      console.error("Failed to fetch competition", err);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchUserPigeons();
    fetchCompetition();
  }, [competitionId]);

  const handleDelete = async (id?: number) => {
    if (!id || !confirm(t("competitionEntryForm.deleteConfirm"))) return;
    try {
      await api.delete(`/competition-entries/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Failed to delete entry", err);
    }
  };

  const handleCreateOrUpdate = async (entry: CompetitionEntry) => {
    try {
      if (editingEntry?.id) {
        await api.patch(`/competition-entries/${editingEntry.id}`, entry);
      } else {
        await api.post(`/competition-entries`, entry);
      }
      setOpenForm(false);
      setEditingEntry(null);
      fetchEntries();
    } catch (err) {
      console.error("Failed to save entry", err);
    }
  };

  // 🔍 FILTER ENTRIES BY SEARCH
  const filteredEntries = entries.filter((e) => {
    const ring = e.pigeon.ringNumber?.toLowerCase() ?? "";
    const name = e.pigeon.name?.toLowerCase() ?? "";
    const term = searchTerm.toLowerCase();
    return ring.includes(term) || name.includes(term);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">

      <PageHeader
        title={t("competitionDetailsPage.title")}
        right={
          <input
            type="text"
            placeholder={t("competitionDetailsPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 w-64 rounded-lg border border-gray-300 
                       focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        }
        actions={
          <>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              ← {t("competitionDetailsPage.back")}
            </button>

            <button
              onClick={() => {
                setEditingEntry(null);
                setOpenForm(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              + {t("competitionDetailsPage.addPigeon")}
            </button>
          </>
        }
      />

      {/* Entries Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-white mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t("competitionEntryForm.pigeon")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t("competitionEntryForm.place")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t("competitionEntryForm.score")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t("competitionEntryForm.distance")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t("competitionEntryForm.flightTime")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t("competitionEntryForm.notes")}</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t("competitionEntryForm.actions")}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredEntries.map((e, idx) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3">
                  {e.pigeon.ringNumber} {e.pigeon.name && `(${e.pigeon.name})`}
                </td>
                <td className="px-4 py-3">{e.place ?? ""}</td>
                <td className="px-4 py-3">{e.score ?? ""}</td>
                <td className="px-4 py-3">{e.actualDistanceKm ?? ""}</td>
                <td className="px-4 py-3">{e.flightTimeHours ?? ""}</td>
                <td className="px-4 py-3">{e.notes ?? ""}</td>

                <td className="px-4 py-3 flex justify-center gap-2">
                  <button
                    onClick={() => { setEditingEntry(e); setOpenForm(true); }}
                    className="p-2 text-yellow-700 rounded-md hover:bg-yellow-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(e.id)}
                    className="p-2 text-red-700 rounded-md hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CompetitionEntryForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleCreateOrUpdate}
        userPigeons={userPigeons}
        competition={competition}
        initialData={editingEntry || undefined}
      />
    </div>
  );
}

