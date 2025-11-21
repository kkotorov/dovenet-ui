import React, { useEffect, useState } from "react";
import api from "../api/api";
import { X, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  competitionId: number;
  onClose: () => void;
  onSelectPigeon: (pigeonId: number) => void;
}

interface Pigeon {
  id: number;
  ringNumber: string;
  name?: string;
  gender?: string;
}

export default function AssignPigeonModal({
  open,
  competitionId,
  onClose,
  onSelectPigeon,
}: Props) {
  const { t } = useTranslation();

  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [assignedPigeonIds, setAssignedPigeonIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load all user's pigeons
  const fetchPigeons = async () => {
    try {
      const res = await api.get<Pigeon[]>("/pigeons");
      setPigeons(res.data);
    } catch (err) {
      console.error("Failed to load pigeons", err);
    }
  };

  // Load entries for this competition
  const fetchAssigned = async () => {
    try {
      const res = await api.get(`/competition-entries/competition/${competitionId}`);
      const ids = res.data.map((entry: any) => entry.pigeonId);
      setAssignedPigeonIds(ids);
    } catch (err) {
      console.error("Failed to load assigned pigeons", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPigeons();
      fetchAssigned();
    }
  }, [open]);

  if (!open) return null;

  const filtered = pigeons.filter((p) =>
    p.ringNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 animate-fadeInUp relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {t("competitionsPage.assignPigeon")}
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder={t("common.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-indigo-400"
        />

        {/* Pigeon list */}
        <div className="max-h-72 overflow-y-auto rounded-md border divide-y">
          {filtered.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              {t("common.noResults")}
            </p>
          ) : (
            filtered.map((p) => {
              const isAssigned = assignedPigeonIds.includes(p.id);

              return (
                <button
                  key={p.id}
                  disabled={isAssigned}
                  onClick={() => onSelectPigeon(p.id)}
                  className={`w-full flex items-center justify-between p-3 text-left transition ${
                    isAssigned
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "hover:bg-indigo-50"
                  }`}
                >
                  <div>
                    <p className="font-medium">{p.ringNumber}</p>
                    {p.name && (
                      <p className="text-sm text-gray-500">{p.name}</p>
                    )}
                  </div>

                  {isAssigned && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Cancel */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
