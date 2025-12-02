import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Competition } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (competition: Competition) => void;
  initialData?: Partial<Competition>;
}

export default function CompetitionFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const { t } = useTranslation();
  const [competition, setCompetition] = useState<Competition>({
    name: "",
    date: "",
    startLatitude: undefined,
    startLongitude: undefined,
    distanceKm: undefined,
    notes: "",
    temperatureC: undefined,
    windSpeedKmH: undefined,
    windDirection: "",
    rain: false,
    conditionsNotes: "",
    ...initialData,
  });

  useEffect(() => {
    if (open && initialData) setCompetition(prev => ({ ...prev, ...initialData }));
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, type } = target;

    let value: any;
    if (type === "number") {
      value = target.value ? Number(target.value) : undefined;
    } else if (type === "checkbox" && "checked" in target) {
      value = target.checked;
    } else {
      value = target.value;
    }

    setCompetition(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!competition.name.trim() || !competition.date) return;
    onSubmit(competition);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fadeInUp">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? t("competitionFormModal.editCompetition") : t("competitionFormModal.createCompetition")}
        </h2>

        {/* Basic Info */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("competitionFormModal.name")} *</label>
            <input
              name="name"
              value={competition.name}
              onChange={handleChange}
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("competitionFormModal.date")} *</label>
            <input
              type="date"
              name="date"
              value={competition.date}
              onChange={handleChange}
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Collapsible Sections */}
        <details className="mt-4 p-3 border rounded-lg">
          <summary className="font-medium cursor-pointer">{t("competitionFormModal.locationAndDistance")}</summary>
          <div className="flex flex-col gap-3 mt-2">
            <input
              type="number"
              step="any"
              name="startLatitude"
              placeholder={t("competitionFormModal.startLatitude")}
              value={competition.startLatitude ?? ""}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              step="any"
              name="startLongitude"
              placeholder={t("competitionFormModal.startLongitude")}
              value={competition.startLongitude ?? ""}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              name="distanceKm"
              placeholder={t("competitionFormModal.distance")}
              value={competition.distanceKm ?? ""}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </details>

        <details className="mt-4 p-3 border rounded-lg">
          <summary className="font-medium cursor-pointer">{t("competitionFormModal.weather")}</summary>
          <div className="flex flex-col gap-3 mt-2">
            <input
              type="number"
              name="temperatureC"
              placeholder={t("competitionFormModal.temperature")}
              value={competition.temperatureC ?? ""}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              name="windSpeedKmH"
              placeholder={t("competitionFormModal.windSpeed")}
              value={competition.windSpeedKmH ?? ""}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              name="windDirection"
              placeholder={t("competitionFormModal.windDirection")}
              value={competition.windDirection ?? ""}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="rain"
                checked={competition.rain || false}
                onChange={handleChange}
              />
              <label>{t("competitionFormModal.rain")}</label>
            </div>
            <textarea
              name="conditionsNotes"
              placeholder={t("competitionFormModal.conditionsNotes")}
              value={competition.conditionsNotes ?? ""}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </details>

        <details className="mt-4 p-3 border rounded-lg">
          <summary className="font-medium cursor-pointer">{t("competitionFormModal.notes")}</summary>
          <textarea
            name="notes"
            placeholder={t("competitionFormModal.notes")}
            value={competition.notes ?? ""}
            onChange={handleChange}
            className="mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 w-full"
          />
        </details>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
            {t("competitionFormModal.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!competition.name.trim() || !competition.date}
            className={`px-4 py-2 rounded-lg text-white transition ${
              !competition.name.trim() || !competition.date
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {initialData ? t("competitionFormModal.save") : t("competitionFormModal.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
