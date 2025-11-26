import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import api from "../api/api";
import { FileText, Users, ArrowLeft } from "lucide-react";
import PigeonForm from "./PigeonForm";
import type { Pigeon, CompetitionEntry, Loft } from "../types";
import { useTranslation } from "react-i18next";

export default function PigeonPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pigeon, setPigeon] = useState<Pigeon | null>(null);
  const [parents, setParents] = useState<Pigeon[]>([]);
  const [children, setChildren] = useState<Pigeon[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [lofts, setLofts] = useState<Loft[]>([]);

  const sortedCompetitions = [...competitions];
  if (sortConfig) {
    sortedCompetitions.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      switch (sortConfig.key) {
        case "name":
          aValue = a.competition?.name || "";
          bValue = b.competition?.name || "";
          break;
        case "place":
          aValue = a.place ?? Number.MAX_SAFE_INTEGER;
          bValue = b.place ?? Number.MAX_SAFE_INTEGER;
          break;
        case "date":
          aValue = a.competition?.date ? new Date(a.competition.date).getTime() : 0;
          bValue = b.competition?.date ? new Date(b.competition.date).getTime() : 0;
          break;
        default:
          aValue = "";
          bValue = "";
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [pigeonRes, parentsRes, childrenRes, competitionsRes] = await Promise.all([
          api.get<Pigeon>(`/pigeons/${id}`),
          api.get<Pigeon[]>(`/pigeons/${id}/parents`).catch(() => ({ data: [] })),
          api.get<Pigeon[]>(`/pigeons/${id}/children`).catch(() => ({ data: [] })),
          api.get<CompetitionEntry[]>(`/pigeons/${id}/competitions`).catch(() => ({ data: [] })),
        ]);

        const fetchedPigeon = pigeonRes.data;
        setPigeon(fetchedPigeon);
        setChildren(childrenRes.data || []);
        setCompetitions(competitionsRes.data || []);

        // Merge parents from DB + ring numbers
        const parentsFromDB = parentsRes.data || [];
        const parentsList: Pigeon[] = [];

        if (fetchedPigeon.fatherRingNumber) {
          const father = parentsFromDB.find((p) => p.ringNumber === fetchedPigeon.fatherRingNumber);
          parentsList.push(
            father || {
              id: undefined,
              ringNumber: fetchedPigeon.fatherRingNumber,
              name: t("pigeonPage.notInDatabase"),
              gender: "male",
              color: "",
              status: "",
              birthDate: "",
            }
          );
        }

        if (fetchedPigeon.motherRingNumber) {
          const mother = parentsFromDB.find((p) => p.ringNumber === fetchedPigeon.motherRingNumber);
          parentsList.push(
            mother || {
              id: undefined,
              ringNumber: fetchedPigeon.motherRingNumber,
              name: t("pigeonPage.notInDatabase"),
              gender: "female",
              color: "",
              status: "",
              birthDate: "",
            }
          );
        }

        setParents(parentsList);
      } catch (err) {
        console.error(err);
        toast.error(t("pigeonPage.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, t]);

  useEffect(() => {
    const fetchLofts = async () => {
      try {
        const res = await api.get<Loft[]>("/lofts");
        setLofts(res.data);
      } catch (err) {
        console.error(t("pigeonPage.fetchLoftsError"), err);
      }
    };
    fetchLofts();
  }, [t]);

  const downloadPedigreePdf = async () => {
    if (!pigeon?.id) return;
    try {
      const res = await api.get(`/pigeons/${pigeon.id}/pedigree/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `pedigree_${pigeon.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t("pigeonPage.downloadedPdf"));
    } catch (err) {
      console.error(err);
      toast.error(t("pigeonPage.downloadPdfError"));
    }
  };

  const genderSymbol = (gender: string) => {
    if (!gender) return { symbol: "", color: "text-gray-600" };
    const lower = gender.toLowerCase();
    if (lower === "male") return { symbol: "♂", color: "text-blue-600" };
    if (lower === "female") return { symbol: "♀", color: "text-pink-600" };
    return { symbol: "", color: "text-gray-600" };
  };

  const handleEdit = () => {
    setEditingPigeon(pigeon);
    setOpenForm(true);
  };

  const updatePigeonData = async (updated: Pigeon) => {
    if (!updated.id) return;
    try {
      await api.patch(`/pigeons/${updated.id}`, updated);
      toast.success(t("pigeonPage.updateSuccess"));
      setPigeon(updated);
      setOpenForm(false);
    } catch (err) {
      console.error(err);
      toast.error(t("pigeonPage.updateError"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-3/5 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-40 bg-white rounded-2xl shadow-md p-4" />
              <div className="h-40 bg-white rounded-2xl shadow-md p-4" />
              <div className="h-40 bg-white rounded-2xl shadow-md p-4" />
            </div>
            <div className="h-56 bg-white rounded-2xl shadow-md p-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!pigeon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">{t("pigeonPage.notFound")}</h2>
            <p className="text-sm text-gray-600 mb-4">{t("pigeonPage.notFoundDesc")}</p>
            <button
              onClick={() => navigate("/pigeons")}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              {t("pigeonPage.backToList")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/pigeons")}
              className="flex items-center gap-2 px-3 py-2 bg-white/80 border border-gray-200 text-gray-800 rounded-lg hover:shadow transition"
            >
              <ArrowLeft className="w-4 h-4" /> <span className="text-sm">{t("pigeonPage.back")}</span>
            </button>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">{t("pigeonPage.pigeon")}</span>
              <h1 className="text-2xl font-bold text-gray-800">
                {pigeon.name} <span className="text-gray-400 text-base">({pigeon.ringNumber})</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow-sm transition"
            >
              {t("pigeonPage.editPigeon")}
            </button>

            <button
              onClick={downloadPedigreePdf}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              <FileText className="w-4 h-4" /> <span className="hidden sm:inline">{t("pigeonPage.downloadPedigree")}</span>
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white shadow-md rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">{t("pigeonPage.basicInfo")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500">{t("pigeonPage.name")}</div>
                <div className="font-medium text-gray-800">{pigeon.name || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">{t("pigeonPage.ring")}</div>
                <div className="font-medium text-gray-800">{pigeon.ringNumber || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">{t("pigeonPage.color")}</div>
                <div className="font-medium text-gray-800">{pigeon.color || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">{t("pigeonPage.gender")}</div>
                <div className={`font-medium ${genderSymbol(pigeon.gender).color}`}>
                  {genderSymbol(pigeon.gender).symbol}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">{t("pigeonPage.status")}</div>
                  <div className="font-medium text-gray-800">
                    {pigeon.status ? t(`pigeonsPage.${pigeon.status}`) : "-"}
                  </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">{t("pigeonPage.birthDate")}</div>
                <div className="font-medium text-gray-800">{pigeon.birthDate || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">{t("pigeonPage.loft")}</div>
                <div
                  className="font-medium text-blue-600 hover:underline cursor-pointer"
                  onClick={() => {
                    const loft = lofts.find((l) => l.id === pigeon.loftId);
                    if (loft) navigate(`/lofts/${loft.id}/pigeons`, { state: { loftName: loft.name } });
                  }}
                >
                  {lofts.find((l) => l.id === pigeon.loftId)?.name || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Relations */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-sm text-gray-500">{t("pigeonPage.relations")}</h3>
              <div className="mt-3">
                <div className="text-xs text-gray-500">{t("pigeonPage.parents")}</div>
                <div className="text-lg font-semibold text-gray-800">{parents.length}</div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-gray-500">{t("pigeonPage.children")}</div>
                <div className="text-lg font-semibold text-gray-800">{children.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Parents + Children */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parents */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" /> {t("pigeonPage.parents")}
            </h2>
            {parents.length === 0 ? (
              <p className="text-gray-500">{t("pigeonPage.noParents")}</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parents.map((p) => (
                  <li
                    key={p.ringNumber}
                    className="p-3 bg-gray-50 border border-gray-100 rounded-lg hover:shadow cursor-pointer transition"
                    onClick={() => p.id && navigate(`/pigeons/${p.id}`)}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.ringNumber}</div>
                    <div className={`text-sm mt-1 ${genderSymbol(p.gender).color}`}>
                      {genderSymbol(p.gender).symbol}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Children */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">{t("pigeonPage.children")}</h2>
            {children.length === 0 ? (
              <p className="text-gray-500">{t("pigeonPage.noChildren")}</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {children.map((c) => (
                  <li
                    key={c.id}
                    className="p-3 bg-gray-50 border border-gray-100 rounded-lg hover:shadow cursor-pointer transition"
                    onClick={() => c.id && navigate(`/pigeons/${c.id}`)}
                  >
                    <div className="font-medium">{c.name || "-"}</div>
                    <div className="text-sm text-gray-600">{c.ringNumber || "-"}</div>
                    <div className={`text-sm mt-1 ${genderSymbol(c.gender).color}`}>
                      {genderSymbol(c.gender).symbol}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Competitions */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">{t("pigeonPage.competitions")}</h2>
          {competitions.length === 0 ? (
            <p className="text-gray-500">{t("pigeonPage.noCompetitions")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      {t("pigeonPage.competition")}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={() => handleSort("place")}
                    >
                      {t("pigeonPage.position")}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      {t("pigeonPage.date")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedCompetitions.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/competitions/${c.competition?.id}`)}>
                      <td className="px-4 py-2">{c.competition?.name || "-"}</td>
                      <td className="px-4 py-2">{c.place ?? "-"}</td>
                      <td className="px-4 py-2">{c.competition?.date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {openForm && (
          <PigeonForm
            open={openForm}
            onClose={() => setOpenForm(false)}
            initialData={editingPigeon || undefined}
            onSubmit={updatePigeonData}
          />
        )}
      </div>
    </div>
  );
}
