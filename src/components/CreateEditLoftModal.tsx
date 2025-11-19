import React, { useState, useEffect } from "react";
import type { Loft, LoftType } from "../types/index";
import { useTranslation } from "react-i18next";
import LoftTypeSelect from "./LoftTypeSelect";

interface CreateEditLoftModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (loft: Partial<Loft>) => void;
  initialData?: Partial<Loft>;
}

export default function CreateEditLoftModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: CreateEditLoftModalProps) {
  const { t } = useTranslation();
  const [loft, setLoft] = useState<Partial<Loft>>({
    name: "",
    type: "racing",
  });

  useEffect(() => {
    if (initialData) setLoft(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!loft.name?.trim()) return;
    onSubmit(loft);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeInUp">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? t("loftsPage.editLoft") : t("loftsPage.createLoft")}
        </h2>

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("loftsPage.loftName")}</label>
            <input
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={t("loftsPage.loftName")}
              name="name"
              value={loft.name || ""}
              onChange={handleChange}
            />
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("loftsPage.loftType")}</label>
            <LoftTypeSelect
              value={(loft.type as LoftType) || "racing"} // cast ensures type safety
              onChange={(val: LoftType) => setLoft((prev) => ({ ...prev, type: val }))}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            {t("loftsPage.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {initialData ? t("loftsPage.update") : t("loftsPage.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
