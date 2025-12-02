import React, { useState, useEffect } from "react";
import type { Loft, LoftType } from "../../types"; 
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
    address: "",
    capacity: undefined,
    loftSize: undefined,
    gpsLatitude: undefined,
    gpsLongitude: undefined,
  });

  // Reset loft state whenever modal opens
  useEffect(() => {
    if (open) {
      setLoft({
        name: initialData?.name || "",
        type: (initialData?.type as LoftType) || "racing",
        address: initialData?.address || "",
        capacity: initialData?.capacity,
        loftSize: initialData?.loftSize,
        gpsLatitude: initialData?.gpsLatitude,
        gpsLongitude: initialData?.gpsLongitude,
      });
    }
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoft((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? (value ? Number(value) : undefined) : value,
    }));
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
          {initialData ? t("createEditLoftModal.titleEdit") : t("createEditLoftModal.titleCreate")}
        </h2>

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("createEditLoftModal.loftName")}</label>
            <input
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={t("createEditLoftModal.loftName")}
              name="name"
              value={loft.name || ""}
              onChange={handleChange}
            />
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("createEditLoftModal.loftType")}</label>
            <LoftTypeSelect
              value={(loft.type as LoftType) || "racing"}
              onChange={(val: LoftType) => setLoft((prev) => ({ ...prev, type: val }))}
            />
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("createEditLoftModal.address")}</label>
            <input
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={t("createEditLoftModal.address")}
              name="address"
              value={loft.address || ""}
              onChange={handleChange}
            />
          </div>

          {/* Capacity */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("createEditLoftModal.capacity")}</label>
            <input
              type="number"
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={t("createEditLoftModal.capacity")}
              name="capacity"
              value={loft.capacity ?? ""}
              onChange={handleChange}
            />
          </div>

          {/* Loft Size */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("createEditLoftModal.loftSize")}</label>
            <input
              type="number"
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={t("createEditLoftModal.loftSize")}
              name="loftSize"
              value={loft.loftSize ?? ""}
              onChange={handleChange}
            />
          </div>

          {/* GPS Latitude */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("createEditLoftModal.gpsLatitude")}</label>
            <input
              type="number"
              step="any"
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={t("createEditLoftModal.gpsLatitude")}
              name="gpsLatitude"
              value={loft.gpsLatitude ?? ""}
              onChange={handleChange}
            />
          </div>

          {/* GPS Longitude */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("createEditLoftModal.gpsLongitude")}</label>
            <input
              type="number"
              step="any"
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={t("createEditLoftModal.gpsLongitude")}
              name="gpsLongitude"
              value={loft.gpsLongitude ?? ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            {t("createEditLoftModal.cancelButton")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {initialData ? t("createEditLoftModal.saveButton") : t("createEditLoftModal.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
