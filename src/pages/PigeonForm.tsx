import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Pigeon } from '../types/index';

interface PigeonFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function PigeonForm({ open, onClose, onSubmit, initialData }: PigeonFormProps) {
  const { t } = useTranslation();

const [pigeon, setPigeon] = useState<Pigeon>({
  id: undefined,
  ringNumber: "",
  name: "",
  color: "",
  gender: "",
  status: "",
  birthDate: "",
  fatherRingNumber: "",
  motherRingNumber: "",
  owner: undefined,
});

  useEffect(() => {
    if (initialData) setPigeon(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPigeon((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(pigeon);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fadeInUp">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? t("pigeonForm.updatePigeon") : t("pigeonForm.createPigeon")}
        </h2>

        <div className="space-y-4">
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder={t("pigeonForm.ringNumber")}
            name="ringNumber"
            value={pigeon.ringNumber}
            onChange={handleChange}
          />
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder={t("pigeonForm.name")}
            name="name"
            value={pigeon.name}
            onChange={handleChange}
          />
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder={t("pigeonForm.color")}
            name="color"
            value={pigeon.color}
            onChange={handleChange}
          />

          {/* Gender Dropdown */}
          <select
            name="gender"
            value={pigeon.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{t("pigeonForm.selectGender")}</option>
            <option value="male">{t("pigeonForm.male")}</option>
            <option value="female">{t("pigeonForm.female")}</option>
          </select>

          {/* Status Dropdown */}
          <select
            name="status"
            value={pigeon.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{t("pigeonForm.selectStatus")}</option>
            <option value="alive">{t("pigeonForm.alive")}</option>
            <option value="deceased">{t("pigeonForm.deceased")}</option>
            <option value="sold">{t("pigeonForm.sold")}</option>
          </select>

          <input
            type="date"
            name="birthDate"
            value={pigeon.birthDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder={t("pigeonForm.fatherRingNumber")}
            name="fatherRingNumber"
            value={pigeon.fatherRingNumber}
            onChange={handleChange}
          />
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder={t("pigeonForm.motherRingNumber")}
            name="motherRingNumber"
            value={pigeon.motherRingNumber}
            onChange={handleChange}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            {t("pigeonForm.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {initialData ? t("pigeonForm.update") : t("pigeonForm.create")}
          </button>
        </div>
      </div>

      {/* Tailwind animation */}
      <style>
        {`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out; }
        `}
      </style>
    </div>
  );
}
