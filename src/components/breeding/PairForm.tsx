import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BreedingPairDTO, Pigeon } from "../../types";
import toast from "react-hot-toast";

interface PairFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: BreedingPairDTO) => void;
  initialData?: Partial<BreedingPairDTO>;
  seasonId: number;
  pigeonsMale: Pigeon[];
  pigeonsFemale: Pigeon[];
}

export default function PairForm({
  open,
  onClose,
  onSubmit,
  initialData,
  seasonId,
  pigeonsMale,
  pigeonsFemale,
}: PairFormProps) {
  const { t } = useTranslation();

  const [maleId, setMaleId] = useState<number | undefined>(initialData?.maleId);
  const [femaleId, setFemaleId] = useState<number | undefined>(initialData?.femaleId);
  const [breedingDate, setBreedingDate] = useState(initialData?.breedingDate ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  useEffect(() => {
    if (open) {
      setMaleId(initialData?.maleId);
      setFemaleId(initialData?.femaleId);
      setBreedingDate(initialData?.breedingDate ?? "");
      setNotes(initialData?.notes ?? "");
    }
  }, [open, initialData]);

  // Prevent selecting the same pigeon
  useEffect(() => {
    if (maleId && femaleId && maleId === femaleId) {
      setFemaleId(undefined);
      toast.error(t("breedingPage.cannotSelectSame"));
    }
  }, [maleId, femaleId, t]);

  const handleSubmit = () => {
    if (!maleId || !femaleId) {
      toast.error(t("breedingPage.selectMaleFemale"));
      return;
    }

    onSubmit({
      id: initialData?.id,
      seasonId,
      maleId,
      femaleId,
      maleRing: pigeonsMale.find((p) => p.id === maleId)?.ringNumber,
      femaleRing: pigeonsFemale.find((p) => p.id === femaleId)?.ringNumber,
      breedingDate,
      notes,
      offspringIds: initialData?.offspringIds ?? [],
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-fadeInUp">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? t("breedingPage.editPair") : t("breedingPage.createPair")}
        </h2>

        <div className="grid grid-cols-1 gap-4">
        {/* Male Pigeon */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("breedingPage.male")}</label>
            <select
            value={maleId ?? ""}
            onChange={(e) => setMaleId(Number(e.target.value))}
            className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            disabled={!!initialData} // disable if editing
            >
            <option value="">{t("breedingPage.selectMale")}</option>
            {pigeonsMale.map((p) => (
                <option key={p.id} value={p.id}>
                {p.ringNumber} {p.name && `(${p.name})`}
                </option>
            ))}
            </select>
        </div>

        {/* Female Pigeon */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("breedingPage.female")}</label>
            <select
            value={femaleId ?? ""}
            onChange={(e) => setFemaleId(Number(e.target.value))}
            className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            disabled={!!initialData} // disable if editing
            >
            <option value="">{t("breedingPage.selectFemale")}</option>
            {pigeonsFemale.map((p) => (
                <option key={p.id} value={p.id}>
                {p.ringNumber} {p.name && `(${p.name})`}
                </option>
            ))}
            </select>
        </div>

        {/* Breeding Date */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("breedingPage.breedingDate")}</label>
            <input
            type="date"
            value={breedingDate}
            onChange={(e) => setBreedingDate(e.target.value)}
            className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        {/* Notes */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("breedingPage.notes")}</label>
            <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows={3}
            />
        </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {initialData ? t("common.update") : t("common.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
