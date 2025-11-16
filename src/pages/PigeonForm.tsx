import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Pigeon } from '../types/index';

interface PigeonFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Pigeon) => void;
  initialData?: Partial<Pigeon>;
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
    if (initialData) setPigeon((prev) => ({ ...prev, ...initialData }));
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPigeon((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(pigeon);
    onClose();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow dates with 4-digit year
    if (value && /^\d{0,4}-?\d{0,2}-?\d{0,2}$/.test(value)) {
      setPigeon(prev => ({ ...prev, birthDate: value }));
    } else if (!value) {
      setPigeon(prev => ({ ...prev, birthDate: "" }));
    }
  };


  if (!open) return null;

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-fadeInUp">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? t("pigeonForm.updatePigeon") : t("pigeonForm.createPigeon")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ring Number (required) */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">
              {t("pigeonForm.ringNumber")} <span className="text-red-500">*</span>
            </label>
            <input
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={t("pigeonForm.ringNumber")}
              name="ringNumber"
              value={pigeon.ringNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Name */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">
              {t("pigeonForm.name")} <span className="text-gray-400">(optional)</span>
            </label>
            <input
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={t("pigeonForm.name")}
              name="name"
              value={pigeon.name}
              onChange={handleChange}
            />
          </div>

          {/* Color */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">
              {t("pigeonForm.color")} <span className="text-gray-400">(optional)</span>
            </label>
            <input
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={t("pigeonForm.color")}
              name="color"
              value={pigeon.color}
              onChange={handleChange}
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">
              {t("pigeonForm.gender")} <span className="text-gray-400">(optional)</span>
            </label>
            <select
              name="gender"
              value={pigeon.gender}
              onChange={handleChange}
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("pigeonForm.selectGender")}</option>
              <option value="male">{t("pigeonForm.male")}</option>
              <option value="female">{t("pigeonForm.female")}</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">
              {t("pigeonForm.status")} <span className="text-gray-400">(optional)</span>
            </label>
            <select
              name="status"
              value={pigeon.status}
              onChange={handleChange}
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("pigeonForm.selectStatus")}</option>
              <option value="active">{t("pigeonForm.active")}</option>
              <option value="retired">{t("pigeonForm.retired")}</option>
              <option value="lost">{t("pigeonForm.lost")}</option>
              <option value="deceased">{t("pigeonForm.deceased")}</option>
              <option value="sold">{t("pigeonForm.sold")}</option>
              <option value="gifted">{t("pigeonForm.gifted")}</option>
              <option value="injured">{t("pigeonForm.injured")}</option>
            </select>
          </div>

          {/* Birth Date */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">
              {t("pigeonForm.birthDate")} <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              name="birthDate"
              value={pigeon.birthDate}
              onChange={handleDateChange}
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Father Ring */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">
              {t("pigeonForm.fatherRingNumber")} <span className="text-gray-400">(optional)</span>
            </label>
            <input
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              name="fatherRingNumber"
              value={pigeon.fatherRingNumber}
              onChange={handleChange}
            />
          </div>

          {/* Mother Ring */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">
              {t("pigeonForm.motherRingNumber")} <span className="text-gray-400">(optional)</span>
            </label>
            <input
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              name="motherRingNumber"
              value={pigeon.motherRingNumber}
              onChange={handleChange}
            />
          </div>
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
            disabled={!pigeon.ringNumber.trim()}
            className={`px-4 py-2 rounded-lg text-white transition ${
              !pigeon.ringNumber.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {initialData ? t("pigeonForm.update") : t("pigeonForm.create")}
          </button>
        </div>

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
    </div>
  );
}
