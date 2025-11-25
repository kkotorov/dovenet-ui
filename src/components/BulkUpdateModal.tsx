import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/api";

interface Loft {
  id: number;
  name: string;
}

interface BulkUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    gender?: string;
    status?: string;
    loftId?: number;
    fatherRingNumber?: string;
    motherRingNumber?: string;
    birthDate?: string;
  }) => void;
  lofts: Loft[];
}

export default function BulkUpdateModal({ open, onClose, onSubmit, lofts }: BulkUpdateModalProps) {
  const { t } = useTranslation();

  const [gender, setGender] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loftId, setLoftId] = useState<number | "">("");
  const [fatherRingNumber, setFatherRingNumber] = useState<string>("");
  const [motherRingNumber, setMotherRingNumber] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");

  const [fatherSuggestions, setFatherSuggestions] = useState<string[]>([]);
  const [motherSuggestions, setMotherSuggestions] = useState<string[]>([]);

  const fatherRef = useRef<HTMLInputElement>(null);
  const motherRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setGender("");
      setStatus("");
      setLoftId("");
      setFatherRingNumber("");
      setMotherRingNumber("");
      setBirthDate("");
      setFatherSuggestions([]);
      setMotherSuggestions([]);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    const data: {
      gender?: string;
      status?: string;
      loftId?: number;
      fatherRingNumber?: string;
      motherRingNumber?: string;
      birthDate?: string;
    } = {};

    if (gender) data.gender = gender;
    if (status) data.status = status;
    if (loftId !== "") data.loftId = Number(loftId);
    if (fatherRingNumber) data.fatherRingNumber = fatherRingNumber;
    if (motherRingNumber) data.motherRingNumber = motherRingNumber;
    if (birthDate) data.birthDate = birthDate;

    if (Object.keys(data).length > 0) {
      onSubmit(data);
      onClose();
    }
  };

  const fetchRingSuggestions = async (query: string, type: "father" | "mother") => {
    if (!query || query.length < 2) {
      type === "father" ? setFatherSuggestions([]) : setMotherSuggestions([]);
      return;
    }

    try {
      const res = await api.get("/pigeons/search-rings", { params: { q: query } });
      type === "father" ? setFatherSuggestions(res.data) : setMotherSuggestions(res.data);
    } catch {
      type === "father" ? setFatherSuggestions([]) : setMotherSuggestions([]);
    }
  };

  const selectRing = (ring: string, type: "father" | "mother") => {
    if (type === "father") {
      setFatherRingNumber(ring);
      setFatherSuggestions([]);
    } else {
      setMotherRingNumber(ring);
      setMotherSuggestions([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{t("bulkUpdateModal.bulkUpdate")}</h2>

        <div className="flex flex-col gap-4">
          {/* Gender */}
          <div>
            <label className="font-medium">{t("bulkUpdateModal.gender")}:</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("bulkUpdateModal.selectOption")}</option>
              <option value="male">{t("bulkUpdateModal.male")}</option>
              <option value="female">{t("bulkUpdateModal.female")}</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="font-medium">{t("bulkUpdateModal.status")}:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("bulkUpdateModal.selectOption")}</option>
              <option value="active">{t("bulkUpdateModal.active")}</option>
              <option value="retired">{t("bulkUpdateModal.retired")}</option>
              <option value="lost">{t("bulkUpdateModal.lost")}</option>
              <option value="deceased">{t("bulkUpdateModal.deceased")}</option>
              <option value="sold">{t("bulkUpdateModal.sold")}</option>
              <option value="gifted">{t("bulkUpdateModal.gifted")}</option>
              <option value="injured">{t("bulkUpdateModal.injured")}</option>
            </select>
          </div>

          {/* Loft */}
          <div>
            <label className="font-medium">{t("bulkUpdateModal.moveToLoft")}:</label>
            <select
              value={loftId}
              onChange={(e) => setLoftId(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("bulkUpdateModal.selectOption")}</option>
              {lofts.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Father Ring */}
          <div className="relative">
            <label className="font-medium">{t("bulkUpdateModal.fatherRingNumber")}:</label>
            <input
              type="text"
              value={fatherRingNumber}
              onChange={(e) => {
                setFatherRingNumber(e.target.value);
                fetchRingSuggestions(e.target.value, "father");
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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

          {/* Mother Ring */}
          <div className="relative">
            <label className="font-medium">{t("bulkUpdateModal.motherRingNumber")}:</label>
            <input
              type="text"
              value={motherRingNumber}
              onChange={(e) => {
                setMotherRingNumber(e.target.value);
                fetchRingSuggestions(e.target.value, "mother");
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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

          {/* Birth Date */}
          <div>
            <label className="font-medium">{t("bulkUpdateModal.birthDate")}:</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
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
            {t("pigeonForm.update")}
          </button>
        </div>
      </div>
    </div>
  );
}
