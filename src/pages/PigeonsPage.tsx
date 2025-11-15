import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PigeonForm from "./PigeonForm";
import api from "../api/api";

interface Pigeon {
  id?: number;
  ringNumber: string;
  name: string;
  color: string;
  gender: string;
  status: string;
  birthDate: string;
  fatherRingNumber?: string;
  motherRingNumber?: string;
}

export default function PigeonsPage() {
  const { t } = useTranslation();
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);
  const [highlightedParentIds, setHighlightedParentIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<keyof Pigeon>("ringNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const navigate = useNavigate();

  const fetchPigeons = async () => {
    try {
      const res = await api.get<Pigeon[]>("/pigeons");
      setPigeons(res.data);
    } catch (err) {
      console.error(t("pigeonsPage.fetchFailed"), err);
    }
  };

  const createPigeon = async (pigeon: Pigeon) => {
    try {
      await api.post("/pigeons", pigeon);
      fetchPigeons();
    } catch (err) {
      console.error(t("pigeonsPage.createFailed"), err);
    }
  };

  const updatePigeon = async (pigeon: Pigeon) => {
    try {
      if (!pigeon.id) throw new Error(t("pigeonsPage.idRequired"));
      await api.put(`/pigeons/${pigeon.id}`, pigeon);
      fetchPigeons();
    } catch (err) {
      console.error(t("pigeonsPage.updateFailed"), err);
    }
  };

  const deletePigeon = async (id: number) => {
    try {
      await api.delete(`/pigeons/${id}`);
      fetchPigeons();
    } catch (err) {
      console.error(t("pigeonsPage.deleteFailed"), err);
    }
  };

  const downloadPedigreePdf = async (id: number) => {
    try {
      const res = await api.get(`/pigeons/${id}/pedigree/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `pedigree_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(t("pigeonsPage.downloadFailed"), err);
    }
  };

  const fetchParents = async (id: number) => {
    try {
      const res = await api.get<Pigeon[]>(`/pigeons/${id}/parents`);
      const parentIds = res.data.map((p) => p.id!);
      setHighlightedParentIds(parentIds);
      setTimeout(() => setHighlightedParentIds([]), 5000);
    } catch (err) {
      console.error(t("pigeonsPage.fetchParentsFailed"), err);
      alert(t("pigeonsPage.fetchParentsFailed"));
    }
  };

  const handleEdit = (pigeon: Pigeon) => {
    setEditingPigeon(pigeon);
    setOpenForm(true);
  };

  const genderSymbol = (gender: string) => {
    if (!gender) return { symbol: "", color: "inherit" };
    const lower = gender.toLowerCase();
    if (lower === "male") return { symbol: "♂", color: "text-blue-600" };
    if (lower === "female") return { symbol: "♀", color: "text-pink-600" };
    return { symbol: "", color: "inherit" };
  };

  const handleSort = (field: keyof Pigeon) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedPigeons = [...pigeons].sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    fetchPigeons();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          {t("pigeonsPage.managePigeons")} 🕊️
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            ← {t("pigeonsPage.backToDashboard")}
          </button>
          <button
            onClick={() => {
              setEditingPigeon(null);
              setOpenForm(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + {t("pigeonsPage.createPigeon")}
          </button>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[
                ["id", t("pigeonsPage.id")],
                ["ringNumber", t("pigeonsPage.ringNumber")],
                ["name", t("pigeonsPage.name")],
                ["color", t("pigeonsPage.color")],
                ["gender", t("pigeonsPage.gender")],
                ["status", t("pigeonsPage.status")],
                ["birthDate", t("pigeonsPage.birthDate")]
              ].map(([field, label]) => (
                <th
                  key={field}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort(field as keyof Pigeon)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {sortField === field && (sortOrder === "asc" ? "↑" : "↓")}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                {t("pigeonsPage.actions")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {sortedPigeons.map((p) => (
              <tr
                key={p.id}
                className={`cursor-pointer hover:bg-gray-50 ${
                  highlightedParentIds.includes(p.id!) ? "bg-green-100" : ""
                }`}
                onClick={() => handleEdit(p)}
              >
                <td className="px-4 py-3">{p.id}</td>
                <td className="px-4 py-3">{p.ringNumber}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.color}</td>
                <td className={`px-4 py-3 font-bold ${genderSymbol(p.gender).color}`}>
                  {genderSymbol(p.gender).symbol}
                </td>
                <td className="px-4 py-3">{t(`pigeonsPage.${p.status}`)}</td>
                <td className="px-4 py-3">{p.birthDate}</td>
                <td className="px-4 py-3 flex justify-center gap-1 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(p);
                    }}
                    className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                    title={t("pigeonsPage.editPigeon")}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePigeon(p.id!);
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    title={t("pigeonsPage.deletePigeon")}
                  >
                    🗑️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPedigreePdf(p.id!);
                    }}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    title={t("pigeonsPage.downloadPedigree")}
                  >
                    📄
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchParents(p.id!);
                    }}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    title={t("pigeonsPage.getParents")}
                  >
                    👨‍👩‍👧
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openForm && (
        <PigeonForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={(pigeon: Pigeon) => {
            if (editingPigeon?.id) {
              updatePigeon(pigeon);
            } else {
              createPigeon(pigeon);
            }
          }}
          initialData={editingPigeon || undefined}
        />
      )}
    </div>
  );
}

