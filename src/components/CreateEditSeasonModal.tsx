import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BreedingSeasonDTO } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BreedingSeasonDTO) => void;
  initialData?: Partial<BreedingSeasonDTO>;
}

export default function CreateEditSeasonModal({ open, onClose, onSubmit, initialData }: Props) {
  const { t } = useTranslation();

  const [form, setForm] = useState<Partial<BreedingSeasonDTO>>({
    name: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        id: initialData?.id,
        name: initialData?.name || "",
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
      });
    }
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    onSubmit(form as BreedingSeasonDTO);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeInUp">
        <h2 className="text-2xl font-bold mb-4">{initialData ? t("breedingPage.editSeason") : t("breedingPage.createSeason")}</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("breedingPage.seasonName")}</label>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className="mt-1 px-3 py-2 border rounded-lg"
              placeholder={t("breedingPage.seasonName")}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("breedingPage.startDate")}</label>
            <input type="date" name="startDate" value={form.startDate || ""} onChange={handleChange} className="mt-1 px-3 py-2 border rounded-lg" />
          </div>

          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("breedingPage.endDate")}</label>
            <input type="date" name="endDate" value={form.endDate || ""} onChange={handleChange} className="mt-1 px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">{t("common.cancel")}</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            {initialData ? t("common.save") : t("common.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
