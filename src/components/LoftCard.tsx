import type { Loft } from "../types/index";
import { useTranslation } from "react-i18next";
import { Pencil, Trash } from "lucide-react";

interface LoftCardProps {
  loft: Loft;
  onView: (loftId: number) => void;
  onEdit: (loft: Loft) => void;
  onDelete: (loftId: number) => void;
}

export default function LoftCard({ loft, onView, onEdit, onDelete }: LoftCardProps) {
  const { t } = useTranslation();

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
      <div className="p-6 flex flex-col gap-3">
        <h2 className="text-xl font-bold text-gray-800">{loft.name}</h2>
        <span className="text-sm text-gray-500">{t(`loftTypes.${loft.type}`)}</span>

        {/* Pigeon Count Badge */}
        <div className="mt-2 inline-flex items-center gap-2">
          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
            {loft.pigeons?.length || 0} {t("loftsPage.pigeons")}
          </span>
        </div>
      </div>
    </div>
  );
}
