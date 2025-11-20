import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PigeonForm from "./PigeonForm";
import ParentModal from "./ParentModal";
import api from "../api/api";
import { Edit2, Trash2, FileText, Users } from "lucide-react";

export interface Pigeon {
  id?: number;
  ringNumber: string;
  name: string;
  color: string;
  gender: string;
  status: string;
  birthDate: string;
  loftId?: number;
  fatherRingNumber?: string;
  motherRingNumber?: string;
  owner?: { id: number };
}

export default function PigeonsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loftId } = useParams<{ loftId: string }>();
  const location = useLocation();
  const loftName = location.state?.loftName || "";

  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);
  const [sortField, setSortField] = useState<keyof Pigeon>("ringNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const [showParentsModal, setShowParentsModal] = useState(false);
  const [selectedPigeon, setSelectedPigeon] = useState<Pigeon | null>(null);
  const [parents, setParents] = useState<Pigeon[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  const fetchPigeons = async () => {
    try {
      const url = loftId ? `/pigeons/loft/${loftId}` : "/pigeons";
      const res = await api.get<Pigeon[]>(url);
      setPigeons(res.data);
    } catch (err) {
      console.error(t("pigeonsPage.fetchFailed"), err);
      setPigeons([]);
    }
  };

  useEffect(() => {
    fetchPigeons();
  }, [loftId]);

  const createPigeon = async (pigeon: Pigeon) => {
    try {
      if (loftId) pigeon.loftId = Number(loftId);
      await api.post("/pigeons", pigeon);
      fetchPigeons();
    } catch (err) {
      console.error(t("pigeonsPage.createFailed"), err);
    }
  };

  const updatePigeon = async (pigeon: Pigeon) => {
    try {
      if (!pigeon.id) throw new Error(t("pigeonsPage.idRequired"));
      await api.patch(`/pigeons/${pigeon.id}`, pigeon);
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

  const fetchParents = async (id: number, pigeon: Pigeon) => {
    setSelectedPigeon(pigeon);
    setShowParentsModal(true);
    setLoadingParents(true);

    try {
      const res = await api.get<Pigeon[]>(`/pigeons/${id}/parents`);
      setParents(res.data);
    } catch (err) {
      console.error(t("pigeonsPage.fetchParentsFailed"), err);
      setParents([]);
    }

    setLoadingParents(false);
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

  // Filter pigeons by search term
  const filteredPigeons = pigeons.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.ringNumber.toLowerCase().includes(term) ||
      (p.name?.toLowerCase().includes(term) ?? false) ||
      (p.color?.toLowerCase().includes(term) ?? false)
    );
  });

  const sortedPigeons = [...filteredPigeons].sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      {/* Header + breadcrumbs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          {loftName
            ? `${t("pigeonsPage.managePigeons")} 🕊️ (${loftName})`
            : t("pigeonsPage.managePigeons")}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(loftId ? "/lofts" : "/dashboard")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            ← {t("pigeonsPage.back")}
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

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={t("pigeonsPage.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Table */}
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
              <tr key={p.id} className="cursor-pointer hover:bg-gray-50">
                <td className="px-4 py-3">{p.id ?? ""}</td>
                <td className="px-4 py-3 font-bold">{p.ringNumber}</td>
                <td className="px-4 py-3">{p.name || ""}</td>
                <td className="px-4 py-3">{p.color || ""}</td>
                <td
                  className={`px-4 py-3 font-bold ${genderSymbol(p.gender).color}`}
                >
                  {genderSymbol(p.gender).symbol}
                </td>
                <td className="px-4 py-3">{p.status ? t(`pigeonsPage.${p.status}`) : ""}</td>
                <td className="px-4 py-3">{p.birthDate || ""}</td>
                <td className="px-4 py-3 flex justify-center gap-2 flex-wrap">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                    className="relative group p-2 text-yellow-700 rounded-md transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("pigeonsPage.edit")}
                    </span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePigeon(p.id!); }}
                    className="relative group p-2 text-red-700 rounded-md transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("pigeonsPage.delete")}
                    </span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadPedigreePdf(p.id!); }}
                    className="relative group p-2 text-blue-700 rounded-md transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("pigeonsPage.download")}
                    </span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); fetchParents(p.id!, p); }}
                    className="relative group p-2 text-green-700 rounded-md transition"
                  >
                    <Users className="w-4 h-4" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("pigeonsPage.parents")}
                    </span>
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
            if (editingPigeon?.id) updatePigeon(pigeon);
            else createPigeon(pigeon);
          }}
          initialData={editingPigeon || undefined}
        />
      )}

      <ParentModal
        open={showParentsModal}
        onClose={() => setShowParentsModal(false)}
        parents={parents}
        loading={loadingParents}
        pigeon={selectedPigeon}
      />
    </div>
  );
}
