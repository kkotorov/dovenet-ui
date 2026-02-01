import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import api from "../../api/api";
import { Users, Trash2, Edit2, Download, Calendar, Hash, Palette, Activity, Award, Home } from "lucide-react";
import BackButton from "../../components/utilities/BackButton";
import PigeonForm from "../../components/pigeons/PigeonForm";
import type { Pigeon, CompetitionEntry, Loft } from "../../types";
import { useTranslation } from "react-i18next";
import { PedigreeTree } from "../../components/pigeons/PedigreeTree";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useUser } from "../../components/utilities/UserContext";
import ConfirmDeleteModal from "../../components/utilities/ConfirmDeleteModal";

export default function PigeonPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pigeon, setPigeon] = useState<Pigeon | null>(null);
  const [parents, setParents] = useState<Pigeon[]>([]);
  const [children, setChildren] = useState<Pigeon[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionEntry[]>([]);
  const [selectedCompetitionIds, setSelectedCompetitionIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>({ key: "date", direction: "desc" });
  const [lofts, setLofts] = useState<Loft[]>([]);
  const { user } = useUser();
  const [showOwnerInfo, setShowOwnerInfo] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [generations, setGenerations] = useState(4);

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

  const toggleCompetitionSelect = (id: number) => {
    setSelectedCompetitionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCompetitions = () => {
    if (selectedCompetitionIds.length === competitions.length) {
      setSelectedCompetitionIds([]);
    } else {
      setSelectedCompetitionIds(competitions.map((c) => c.id!).filter(Boolean));
    }
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
        setSelectedCompetitionIds([]);

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

  const handleDelete = async () => {
  if (!pigeon?.id) return;
    try {
      await api.delete(`/pigeons/${pigeon.id}`);
      toast.success(t("pigeonPage.deleteSuccess"));
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error(t("pigeonPage.deleteFailed"));
    }
  };

  const treeRef = useRef<HTMLDivElement>(null);

  const downloadPedigreePdf = async () => {
    if (!treeRef.current) return;

    const canvas = await html2canvas(treeRef.current, {
      scale: 2,
      useCORS: true,
      onclone: (clonedDoc) => {
        // Replace inputs with spans for clean rendering
        const inputs = clonedDoc.querySelectorAll("input");
        inputs.forEach((input) => {
          const span = clonedDoc.createElement("span");
          span.textContent = input.value;
          span.className = input.className;
          span.style.cssText = input.style.cssText;
          span.style.display = "inline-block";
          if (input.parentElement) {
            input.parentElement.replaceChild(span, input);
          }
        });

        // Replace selects with spans
        const selects = clonedDoc.querySelectorAll("select");
        selects.forEach((select) => {
          const span = clonedDoc.createElement("span");
          const selectedOption = select.options[select.selectedIndex];
          span.textContent = selectedOption ? selectedOption.text : "";
          span.className = select.className;
          span.style.cssText = select.style.cssText;
          span.style.display = "inline-block";
          if (select.parentElement) {
            select.parentElement.replaceChild(span, select);
          }
        });

        // Remove buttons and ignored elements
        const toRemove = clonedDoc.querySelectorAll("button, [data-html2canvas-ignore]");
        toRemove.forEach((el) => el.remove());
      },
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 20, 20, pdfWidth - 40, pdfHeight - 40);
    pdf.save(`pedigree_${pigeon?.ringNumber}.pdf`);
  };

  const genderSymbol = (gender: string) => {
    if (!gender) return { symbol: "", color: "text-gray-600" };
    const lower = gender.toLowerCase();
    if (lower === "male") return { symbol: "♂", color: "text-blue-600" };
    if (lower === "female") return { symbol: "♀", color: "text-rose-600" };
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

  const getThemeColors = (gender?: string) => {
    const lower = gender?.toLowerCase();
    if (lower === "female") {
      return {
        background: "bg-gradient-to-r from-rose-600 to-rose-500",
        badge: "text-rose-100 bg-rose-700/30"
      };
    }
    return {
      background: "bg-gradient-to-r from-blue-600 to-blue-500",
      badge: "text-blue-100 bg-blue-700/30"
    };
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
              onClick={() => navigate(-1)}
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <BackButton />
          
          <div className="flex items-center gap-3">
            {/* Edit */}
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white text-yellow-600 rounded-full shadow-sm hover:shadow-md transition-all"
              title={t("pigeonPage.editPigeon")}
            >
              <Edit2 className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">{t("pigeonPage.editPigeon")}</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-full shadow-sm hover:shadow-md transition-all"
              title={t("pigeonsPage.delete")}
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">{t("pigeonsPage.delete")}</span>
            </button>

            {/* Download Pedigree */}
            <button
              onClick={downloadPedigreePdf}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-sm hover:shadow-md hover:bg-blue-700 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">{t("pigeonPage.downloadPedigree")}</span>
            </button>
          </div>
        </div>

        {/* Hero / Basic Info Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/50">
          {/* Top Banner with Name and Ring */}
          <div className={`${getThemeColors(pigeon.gender).background} p-8 text-white`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {pigeon.name || <span className="italic opacity-70">{t("pigeonPage.unnamed")}</span>}
                </h1>
                <div className={`flex items-center gap-2 mt-2 ${getThemeColors(pigeon.gender).badge} w-fit px-3 py-1 rounded-lg backdrop-blur-sm`}>
                  <Hash className="w-4 h-4" />
                  <span className="font-mono text-lg">{pigeon.ringNumber}</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm`}>
                <span className="text-2xl drop-shadow-sm">{genderSymbol(pigeon.gender).symbol}</span>
                <span className="font-semibold capitalize tracking-wide">{pigeon.gender || "-"}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Palette className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t("pigeonPage.color")}</span>
              </div>
              <p className="text-lg font-medium text-gray-900">{pigeon.color || "-"}</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t("pigeonPage.status")}</span>
              </div>
              <p className="text-lg font-medium text-gray-900">
                {pigeon.status ? t(`pigeonsPage.${pigeon.status}`) : "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t("pigeonPage.birthDate")}</span>
              </div>
              <p className="text-lg font-medium text-gray-900">{pigeon.birthDate || "-"}</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Home className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t("pigeonPage.loft")}</span>
              </div>
              <p
                className="text-lg font-medium text-blue-600 hover:underline cursor-pointer"
                onClick={() => {
                  const loft = lofts.find((l) => l.id === pigeon.loftId);
                  if (loft) navigate(`/lofts/${loft.id}/pigeons`, { state: { loftName: loft.name } });
                }}
              >
                {lofts.find((l) => l.id === pigeon.loftId)?.name || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Parents + Children */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parents */}
          <div className="bg-white rounded-3xl shadow-xl border border-white/50 p-6">
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
          <div className="bg-white rounded-3xl shadow-xl border border-white/50 p-6">
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
      <div className="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-xl">
                        <Award className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{t("pigeonPage.competitions")}</h2>
                </div>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
                    {competitions.length}
                </span>
            </div>
            <p className="text-sm text-gray-500 ml-1">
                {t("pigeonPage.selectCompetitionsForPedigree")}
            </p>
        </div>
        {competitions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{t("pigeonPage.noCompetitions")}</div>
        ) : (
          <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={competitions.length > 0 && selectedCompetitionIds.length === competitions.length}
                      onChange={toggleSelectAllCompetitions}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    {t("pigeonPage.competition")}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    {t("pigeonPage.date")}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                    onClick={() => handleSort("distance")}
                  >
                    {t("pigeonPage.distance")}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                    onClick={() => handleSort("place")}
                  >
                    {t("pigeonPage.position")}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                    onClick={() => handleSort("score")}
                  >
                    {t("pigeonPage.score")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCompetitions.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/competitions/${c.competition?.id}`)}
                  >
                    <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedCompetitionIds.includes(c.id!)}
                        onChange={() => toggleCompetitionSelect(c.id!)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2">{c.competition?.name || "-"}</td>
                    <td className="px-4 py-2">{c.competition?.date || "-"}</td>
                    <td className="px-4 py-2">{c.actualDistanceKm ?? "-"}</td>
                    <td className="px-4 py-2">{c.place ?? "-"}</td>
                    <td className="px-4 py-2">{c.score ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


        <div className="flex flex-wrap items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showOwnerInfo"
              checked={showOwnerInfo}
              onChange={(e) => setShowOwnerInfo(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="showOwnerInfo" className="text-sm text-gray-700 font-medium">
              {t("pigeonPage.showOwnerInfo")}
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 font-medium">{t("pigeonPage.generations")}:</span>
            {[3, 4, 5].map((gen) => (
              <label key={gen} className="flex items-center gap-1 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="generations"
                  value={gen}
                  checked={generations === gen}
                  onChange={() => setGenerations(gen)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                {gen}
              </label>
            ))}
          </div>
        </div>

          {/* Pedigree Tree */}
          <div ref={treeRef} className="p-6">  {/* only padding, no border/shadow/bg */}
            {pigeon && (
              <PedigreeTree
                pigeon={{ ...pigeon }}
                generations={generations}
                competitions={sortedCompetitions.filter((c) => selectedCompetitionIds.includes(c.id!))}
                owner={showOwnerInfo && user ? user : undefined}  // <-- filter out null
              />
            )}
          </div>
        </div>

        {openForm && (
          <PigeonForm
            open={openForm}
            onClose={() => setOpenForm(false)}
            initialData={editingPigeon || undefined}
            onSubmit={updatePigeonData}
          />
        )}

      <ConfirmDeleteModal
        open={showDeleteModal} 
        title={t("pigeonsPage.deleteTitle")}
        message={t("pigeonsPage.deleteConfirm")}
        cancelLabel={t("common.cancel")}
        deleteLabel={t("common.delete")}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
      </div>
  );
}
