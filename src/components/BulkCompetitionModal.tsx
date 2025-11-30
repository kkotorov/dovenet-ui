import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import { toast } from "react-hot-toast";

interface Competition {
  id: number;
  name: string;
}

interface BulkCompetitionModalProps {
  open: boolean;
  onClose: () => void;
  selectedPigeons: number[]; // IDs of pigeons to add to competition
}

export default function BulkCompetitionModal({ open, onClose, selectedPigeons }: BulkCompetitionModalProps) {
  const { t } = useTranslation();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [competitionId, setCompetitionId] = useState<number | "">("");

  // Fetch competitions
  useEffect(() => {
    if (!open) return;

    const fetchCompetitions = async () => {
      try {
        const res = await api.get("/competitions");
        setCompetitions(res.data);
      } catch (err) {
        console.error(err);
        toast.error(t("pigeonsPage.fetchCompetitionsFailed"));
      }
    };

    fetchCompetitions();
  }, [open, t]);

  // Reset fields when modal closes
  useEffect(() => {
    if (!open) {
      setCompetitionId("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!competitionId) {
      toast.error(t("pigeonsPage.selectCompetition"));
      return;
    }

    try {
        await Promise.all(
        selectedPigeons.map((pigeonId) =>
            api.post("/competition-entries", {
            competition: { id: competitionId },
            pigeon: { id: pigeonId },
            })
        )
    );


      toast.success(t("pigeonsPage.bulkCompetitionSuccess"));
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(t("pigeonsPage.bulkCompetitionFailed"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{t("pigeonsPage.addToCompetition")}</h2>

        <div className="flex flex-col gap-4">
          {/* Competition dropdown */}
          <div>
            <label className="font-medium">{t("pigeonsPage.selectCompetition")}:</label>
            <select
              value={competitionId}
              onChange={(e) => setCompetitionId(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("pigeonsPage.selectOption")}</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            {t("pigeonForm.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {t("pigeonsPage.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
