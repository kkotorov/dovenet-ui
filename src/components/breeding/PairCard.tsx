import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit2, Trash2, Plus, User, Users, Minus } from "lucide-react";
import type { BreedingPairDTO, Pigeon } from "../../types";

interface PairCardProps {
  pair: BreedingPairDTO;
  userPigeons: Pigeon[];
  onEdit: (pair: BreedingPairDTO) => void;
  onDelete: (pairId: number) => void;
  onAddOffspring: (pairId: number) => void;
  onRemoveOffspring: (pairId: number, offspringIds: number[]) => void;
}

export default function PairCard({
  pair,
  userPigeons,
  onEdit,
  onDelete,
  onAddOffspring,
  onRemoveOffspring,
}: PairCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [removeOffspringModalOpen, setRemoveOffspringModalOpen] = useState(false);
  const [selectedOffspringIds, setSelectedOffspringIds] = useState<number[]>(pair.offspringIds || []);

  const offspringList = (pair.offspringIds || []).map((id) =>
    userPigeons.find((p) => p.id === id)
  );

  const handleRemoveOffspringConfirm = () => {
    onRemoveOffspring(pair.id!, selectedOffspringIds);
    setRemoveOffspringModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition">
      {/* Header */}
      <div className="bg-indigo-50 flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-700" />
          <button
            onClick={() => navigate(`/pigeons/${pair.maleId}`)}
            className="text-sm font-semibold text-blue-800 hover:underline"
          >
            {pair.maleRing ?? pair.maleId}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-pink-700" />
          <button
            onClick={() => navigate(`/pigeons/${pair.femaleId}`)}
            className="text-sm font-semibold text-pink-800 hover:underline"
          >
            {pair.femaleRing ?? pair.femaleId}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        <div className="text-gray-600 text-sm">
          <span className="font-semibold">{t("breedingPage.breedingDate")}: </span>
          {pair.breedingDate ?? "-"}
        </div>
        <div className="text-gray-600 text-sm">
          <span className="font-semibold">{t("breedingPage.notes")}: </span>
          {pair.notes ?? "-"}
        </div>

        {/* Offspring */}
        <div className="mt-2 flex flex-wrap gap-2">
          {offspringList.length > 0 ? (
            offspringList.map((p) => (
              <button
                key={p?.id}
                onClick={() => p && navigate(`/pigeons/${p.id}`)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  p?.gender?.toLowerCase() === "male"
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                } transition`}
              >
                {p?.ringNumber}{p?.name ? ` (${p.name})` : ""}
              </button>
            ))
          ) : (
            <span className="text-gray-400 text-sm">{t("breedingPage.noOffspring")}</span>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-2 p-3 border-t border-gray-100 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(pair)}
            className="p-1 text-yellow-600 rounded-md hover:bg-yellow-100 transition flex items-center justify-center"
            title={t("breedingPage.editPair")}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddOffspring(pair.id!)}
            className="p-1 text-green-600 rounded-md hover:bg-green-100 transition flex items-center justify-center"
            title={t("breedingPage.addOffspring")}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRemoveOffspringModalOpen(true)}
            className="p-1 text-red-600 rounded-md hover:bg-red-100 transition flex items-center justify-center"
            title={t("breedingPage.removeOffspring")}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(pair.id!)}
            className="p-1 text-red-700 rounded-md hover:bg-red-100 transition flex items-center justify-center"
            title={t("breedingPage.deletePair")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Remove Offspring Modal */}
      {removeOffspringModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t("breedingPage.removeOffspringTitle")}</h2>
            <p className="text-sm text-gray-600 mb-4">{t("breedingPage.removeOffspringSelect")}</p>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
              {(pair.offspringIds || []).map(id => {
                const p = userPigeons.find(p => p.id === id);
                if (!p) return null;
                const isChecked = selectedOffspringIds.includes(id);
                return (
                  <label key={id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) setSelectedOffspringIds(prev => prev.filter(pid => pid !== id));
                        else setSelectedOffspringIds(prev => [...prev, id]);
                      }}
                    />
                    {p.ringNumber}{p.name ? ` (${p.name})` : ""}
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setRemoveOffspringModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleRemoveOffspringConfirm}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
