import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import type { Pigeon } from "../types/index";

interface Loft {
  id: number;
  name: string;
  type: string;
}

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
    loftId: undefined,       // ← NEW
  });

  const [lofts, setLofts] = useState<Loft[]>([]); // ← NEW

  const [fatherSuggestions, setFatherSuggestions] = useState<string[]>([]);
  const [motherSuggestions, setMotherSuggestions] = useState<string[]>([]);

  const fatherRef = useRef<HTMLInputElement>(null);
  const motherRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    if (initialData) setPigeon(prev => ({ ...prev, ...initialData }));
  }, [initialData]);

  // Load all lofts
  useEffect(() => {
    const loadLofts = async () => {
      try {
        const res = await api.get("/lofts");
        setLofts(res.data);
      } catch {
        setLofts([]);
      }
    };
    loadLofts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPigeon(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(pigeon);
    onClose();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value && /^\d{0,4}-?\d{0,2}-?\d{0,2}$/.test(value)) {
      setPigeon(prev => ({ ...prev, birthDate: value }));
    } else if (!value) {
      setPigeon(prev => ({ ...prev, birthDate: "" }));
    }
  };

  // AUTOCOMPLETE
  const fetchRingSuggestions = async (query: string, type: "father" | "mother") => {
    if (!query || query.length < 2) {
      if (type === "father") setFatherSuggestions([]);
      else setMotherSuggestions([]);
      return;
    }

    try {
      const res = await api.get("/pigeons/search-rings", { params: { q: query } });

      if (type === "father") setFatherSuggestions(res.data);
      else setMotherSuggestions(res.data);
    } catch {
      if (type === "father") setFatherSuggestions([]);
      else setMotherSuggestions([]);
    }
  };

  const selectRing = (ring: string, type: "father" | "mother") => {
    if (type === "father") {
      setPigeon(prev => ({ ...prev, fatherRingNumber: ring }));
      setFatherSuggestions([]);
    } else {
      setPigeon(prev => ({ ...prev, motherRingNumber: ring }));
      setMotherSuggestions([]);
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
          {/* Ring Number */}
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
            <label className="font-medium text-gray-700">{t("pigeonForm.birthDate")}</label>
            <input
              type="date"
              name="birthDate"
              value={pigeon.birthDate}
              onChange={handleDateChange}
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Father Ring AutoComplete */}
          <div className="flex flex-col relative">
            <label className="font-medium text-gray-700">{t("pigeonForm.fatherRingNumber")}</label>
            <input
              ref={fatherRef}
              name="fatherRingNumber"
              value={pigeon.fatherRingNumber}
              onChange={(e) => {
                handleChange(e);
                fetchRingSuggestions(e.target.value, "father");
              }}
              placeholder={t("pigeonForm.fatherRingNumber")}
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              autoComplete="off"
            />

            {fatherSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-50">
                {fatherSuggestions.map((ring) => (
                  <li
                    key={ring}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectRing(ring, "father")}
                  >
                    {ring}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mother Ring AutoComplete */}
          <div className="flex flex-col relative">
            <label className="font-medium text-gray-700">{t("pigeonForm.motherRingNumber")}</label>
            <input
              ref={motherRef}
              name="motherRingNumber"
              value={pigeon.motherRingNumber}
              onChange={(e) => {
                handleChange(e);
                fetchRingSuggestions(e.target.value, "mother");
              }}
              placeholder={t("pigeonForm.motherRingNumber")}
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              autoComplete="off"
            />

            {motherSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-50">
                {motherSuggestions.map((ring) => (
                  <li
                    key={ring}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectRing(ring, "mother")}
                  >
                    {ring}
                  </li>
                ))}
              </ul>
            )}
          </div>


          {/* Loft*/}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">
            <label className="font-medium text-gray-700">
              {t("pigeonForm.loft")} <span className="text-gray-400">(optional)</span>
            </label>
            </label>
<select
  name="loftId"
  value={pigeon.loftId || ""}
  onChange={(e) =>
    setPigeon(prev => ({
      ...prev,
      loftId: e.target.value ? Number(e.target.value) : undefined
    }))
  }
  className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
>
  <option value="">{t("pigeonForm.selectLoft")}</option>
  {lofts.map(loft => (
    <option key={loft.id} value={loft.id}>
      {loft.name} ({t(`loftTypes.${loft.type}`) || loft.type})
    </option>
  ))}
</select>

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
