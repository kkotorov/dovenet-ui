import { useTranslation } from "react-i18next";
import type { Pigeon } from "../types/index";


interface ParentModalProps {
  open: boolean;
  onClose: () => void;
  parents: Pigeon[];
  loading: boolean;
  pigeon?: Partial<Pigeon> | null;
}


export default function ParentModal({ open, onClose, parents, loading, pigeon }: ParentModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-lg">
        <h2 className="text-xl font-bold mb-4">{t("parentModal.title")}</h2>

        {loading && <div>{t("parentModal.loading")}...</div>}

        {!loading && (
          <>
            {parents.length > 0 ? (
              <div className="space-y-4">
                {parents.map((parent) => (
                  <div key={parent.id} className="border rounded-lg p-3 bg-gray-50">
                    <div>
                      <strong>
                        {parent.gender?.toLowerCase() === "male"
                          ? t("parentModal.father")
                          : t("parentModal.mother")}
                        :
                      </strong>
                    </div>
                    <div>{t("parentModal.name")}: {parent.name}</div>
                    <div>{t("parentModal.ringNumber")}: {parent.ringNumber}</div>
                    <div>{t("parentModal.color")}: {parent.color}</div>
                    <div>{t("parentModal.gender")}: {parent.gender}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div>{pigeon?.fatherRingNumber && (
                <div>
                    <strong>{t("parentModal.father")}:</strong> {pigeon.fatherRingNumber}
                    <span className="text-red-500 ml-1">({t("parentModal.notInDb")})</span>
                </div>
                )}</div>

                <div>{pigeon?.motherRingNumber && (
                <div>
                    <strong>{t("parentModal.mother")}:</strong> {pigeon.motherRingNumber}
                    <span className="text-red-500 ml-1">({t("parentModal.notInDb")})</span>
                </div>
                )}</div>
                {!pigeon?.fatherRingNumber && !pigeon?.motherRingNumber && (
                  <div className="text-gray-600">{t("parentModal.noInfo")}</div>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            {t("parentModal.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
