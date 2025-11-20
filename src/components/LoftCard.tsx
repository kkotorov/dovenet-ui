import type { Loft } from "../types/index";
import { useTranslation } from "react-i18next";
import { Pencil, Trash, MapPin } from "lucide-react";

interface LoftCardProps {
  loft: Loft;
  onView: (loftId: number) => void;
  onEdit: (loft: Loft) => void;
  onDelete: (loftId: number) => void;
}

export default function LoftCard({ loft, onView, onEdit, onDelete }: LoftCardProps) {
  const { t } = useTranslation();

  const openMaps = (lat?: number, lng?: number) => {
    if (!lat || !lng) return;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div
      onClick={() => onView(loft.id)}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between relative overflow-visible"
    >
      {/* Top-right action buttons */}
      <div className="absolute top-3 right-3 flex space-x-1 z-10">
        {/* Edit Button */}
        <div className="relative group">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(loft); }}
            className="p-2 text-yellow-700 rounded-md hover:bg-yellow-100 transition flex items-center justify-center"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <span className="absolute -top-7 right-0 whitespace-nowrap bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            {t("loftsPage.edit")}
          </span>
        </div>

        {/* Delete Button */}
        <div className="relative group">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(loft.id); }}
            className="p-2 text-red-700 rounded-md hover:bg-red-100 transition flex items-center justify-center"
          >
            <Trash className="w-4 h-4" />
          </button>
          <span className="absolute -top-7 right-0 whitespace-nowrap bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            {t("loftsPage.delete")}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex flex-col gap-2">
        {/* Name & Address */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-800">{loft.name}</h2>
          {loft.address && (
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <span>{loft.address}</span>
              {loft.gpsLatitude && loft.gpsLongitude && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openMaps(loft.gpsLatitude, loft.gpsLongitude); }}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                  title={t("loftsPage.openMap")}
                >
                  <MapPin className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loft Type */}
        <span className="text-sm text-gray-500">{t(`loftTypes.${loft.type}`)}</span>

        {/* Badges: Pigeon count + Capacity */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
            {loft.pigeonCount} {t("loftsPage.pigeons")}
          </span>
          {loft.capacity && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              {t("loftsPage.capacity")}: {loft.capacity}
            </span>
          )}
        </div>

        {/* Loft size & GPS coordinates */}
        <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600 text-sm">
          {loft.loftSize && <span>{t("loftsPage.loftSize")}: {loft.loftSize} m²</span>}
          {loft.gpsLatitude && loft.gpsLongitude && (
            <span className="text-gray-400 text-xs">
              {t("loftsPage.gps")}: {loft.gpsLatitude.toFixed(6)}, {loft.gpsLongitude.toFixed(6)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}



