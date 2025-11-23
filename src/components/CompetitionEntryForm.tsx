import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Pigeon, Competition, CompetitionEntry } from "../types";

interface CompetitionEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (entry: CompetitionEntry) => void;
  userPigeons: Pigeon[];
  competition: Competition | null;
  initialData?: CompetitionEntry;
}

export default function CompetitionEntryForm({
  open,
  onClose,
  onSubmit,
  userPigeons,
  competition,
  initialData,
}: CompetitionEntryFormProps) {
  const { t } = useTranslation();

  const [pigeonId, setPigeonId] = useState<number | undefined>(initialData?.pigeon.id);
  const [place, setPlace] = useState(initialData?.place ?? "");
  const [score, setScore] = useState(initialData?.score ?? "");
  const [distance, setDistance] = useState(initialData?.actualDistanceKm ?? "");
  const [flightTime, setFlightTime] = useState(initialData?.flightTimeHours ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

useEffect(() => {
  if (open) {
    if (initialData) {
      // Editing mode → populate with existing data
      setPigeonId(initialData.pigeon.id);
      setPlace(initialData.place ?? "");
      setScore(initialData.score ?? "");
      setDistance(initialData.actualDistanceKm ?? "");
      setFlightTime(initialData.flightTimeHours ?? "");
      setNotes(initialData.notes ?? "");
    } else {
      // Creating new entry → clear all fields
      setPigeonId(undefined);
      setPlace("");
      setScore("");
      setDistance("");
      setFlightTime("");
      setNotes("");
    }
  }
}, [open, initialData]);


  if (!open) return null;

  const handleSubmit = () => {
    if (!pigeonId || !competition) return;

    const pigeon = userPigeons.find((p) => p.id === pigeonId);
    if (!pigeon) return;

    onSubmit({
      id: initialData?.id,
      competition,
      pigeon,
      place: place ? Number(place) : undefined,
      score: score ? Number(score) : undefined,
      actualDistanceKm: distance ? Number(distance) : undefined,
      flightTimeHours: flightTime ? Number(flightTime) : undefined,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fadeInUp">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? t("competitionEntryForm.update") : t("competitionEntryForm.create")}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <label className="font-medium text-gray-700">{t("competitionEntryForm.selectPigeon")}</label>
            <select
            className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={pigeonId}
            onChange={(e) => setPigeonId(Number(e.target.value))}
            disabled={!!initialData} // disable if editing
            >
            <option value="">{t("competitionEntryForm.selectPigeon")}</option>
            {userPigeons.map((p) => (
                <option key={p.id} value={p.id}>
                {p.ringNumber} {p.name && `(${p.name})`}
                </option>
            ))}
            </select>

          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label>{t("competitionEntryForm.place")}</label>
              <input
                type="number"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col">
              <label>{t("competitionEntryForm.score")}</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col">
              <label>{t("competitionEntryForm.distance")}</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col">
              <label>{t("competitionEntryForm.flightTime")}</label>
              <input
                type="number"
                value={flightTime}
                onChange={(e) => setFlightTime(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label>{t("competitionEntryForm.notes")}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            {t("competitionEntryForm.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {initialData ? t("competitionEntryForm.update") : t("competitionEntryForm.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
