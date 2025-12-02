import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast, { Toaster } from "react-hot-toast";
import PigeonForm from "../pages/PigeonForm";
import ParentModal from "../pages/ParentModal";
import BulkUpdateModal from "../components/BulkUpdateModal";
import api from "../api/api";
import { Edit2, Trash2, Download, Users, Eye, Square, Trophy } from "lucide-react";
import PageHeader from "../components/PageHeader";
import type { Pigeon, Loft } from "../types";
import { useNavigate } from "react-router-dom";
import BulkCompetitionModal from "../components/BulkCompetitionModal";

interface PigeonsTabProps {
  loftId?: number;
  loftName?: string;
  onNavigateBack?: () => void;
}

export function PigeonsTab({ loftId, loftName }: PigeonsTabProps) {
  const navigate = useNavigate(); // ← add this
    
  const { t } = useTranslation();

  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [selectedPigeons, setSelectedPigeons] = useState<number[]>([]);
  const [lofts, setLofts] = useState<Loft[]>([]);

  const [openForm, setOpenForm] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);
  const [sortField, setSortField] = useState<keyof Pigeon>("ringNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const [showParentsModal, setShowParentsModal] = useState(false);
  const [selectedPigeon, setSelectedPigeon] = useState<Pigeon | null>(null);
  const [parents, setParents] = useState<Pigeon[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  const [showBulkModal, setShowBulkModal] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pigeonToDelete, setPigeonToDelete] = useState<Pigeon | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bulkDelete, setBulkDelete] = useState(false);

  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const [showBulkCompetitionModal, setShowBulkCompetitionModal] = useState(false);

  /** Fetch pigeons **/
  const fetchPigeons = async () => {
    try {
      const url = loftId ? `/pigeons/loft/${loftId}` : "/pigeons";
      const res = await api.get<Pigeon[]>(url);
      setPigeons(res.data);
      setSelectedPigeons([]);
      setLastSelectedIndex(null);
    } catch (err) {
      console.error(t("pigeonsPage.fetchFailed"), err);
      toast.error(t("pigeonsPage.fetchFailed"));
      setPigeons([]);
    }
  };

  /** Fetch lofts **/
  const fetchLofts = async () => {
    try {
      const res = await api.get<Loft[]>("/lofts");
      setLofts(res.data);
    } catch (err) {
      console.error("Failed to fetch lofts", err);
      toast.error(t("loftsPage.fetchFailed"));
      setLofts([]);
    }
  };

  useEffect(() => {
    fetchPigeons();
    fetchLofts();
  }, [loftId]);

  /** CRUD **/
  const createPigeon = async (pigeon: Pigeon) => {
    try {
      if (loftId) pigeon.loftId = loftId;
      await api.post("/pigeons", pigeon);
      toast.success(t("pigeonsPage.createSuccess"));
      fetchPigeons();
    } catch (err) {
      console.error(t("pigeonsPage.createFailed"), err);
      toast.error(t("pigeonsPage.createFailed"));
    }
  };

  const updatePigeon = async (pigeon: Pigeon) => {
    try {
      if (!pigeon.id) throw new Error(t("pigeonsPage.idRequired"));
      await api.patch(`/pigeons/${pigeon.id}`, pigeon);
      toast.success(t("pigeonsPage.updateSuccess"));
      fetchPigeons();
    } catch (err) {
      console.error(t("pigeonsPage.updateFailed"), err);
      toast.error(t("pigeonsPage.updateFailed"));
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      if (bulkDelete) {
        await Promise.all(selectedPigeons.map((id) => api.delete(`/pigeons/${id}`)));
        toast.success(t("pigeonsPage.bulkDeleteSuccess"));
        setSelectedPigeons([]);
      } else if (pigeonToDelete?.id) {
        await api.delete(`/pigeons/${pigeonToDelete.id}`);
        toast.success(t("pigeonsPage.deleteSuccess"));
      }
      fetchPigeons();
    } catch (err) {
      console.error(t("pigeonsPage.deleteFailed"), err);
      toast.error(t("pigeonsPage.deleteFailed"));
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setPigeonToDelete(null);
      setBulkDelete(false);
    }
  };

  const confirmDelete = (pigeon?: Pigeon) => {
    if (pigeon) {
      setPigeonToDelete(pigeon);
      setBulkDelete(false);
    } else {
      setBulkDelete(true);
    }
    setDeleteModalOpen(true);
  };

  /** Pedigree PDF **/
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
      toast.success(t("pigeonsPage.downloadSuccess"));
    } catch (err) {
      console.error(t("pigeonsPage.downloadFailed"), err);
      toast.error(t("pigeonsPage.downloadFailed"));
    }
  };

  /** Parents modal **/
  const fetchParents = async (id: number, pigeon: Pigeon) => {
    setSelectedPigeon(pigeon);
    setShowParentsModal(true);
    setLoadingParents(true);
    try {
      const res = await api.get<Pigeon[]>(`/pigeons/${id}/parents`);
      setParents(res.data);
    } catch (err) {
      console.error(t("pigeonsPage.fetchParentsFailed"), err);
      toast.error(t("pigeonsPage.fetchParentsFailed"));
      setParents([]);
    }
    setLoadingParents(false);
  };

  /** Editing **/
  const handleEdit = (pigeon: Pigeon) => {
    setEditingPigeon(pigeon);
    setOpenForm(true);
  };

  /** Gender display **/
  const genderSymbol = (gender: string) => {
    if (!gender) return { symbol: "", color: "inherit" };
    const lower = gender.toLowerCase();
    if (lower === "male") return { symbol: "♂", color: "text-blue-600" };
    if (lower === "female") return { symbol: "♀", color: "text-pink-600" };
    return { symbol: "", color: "inherit" };
  };

  /** Sorting **/
  const handleSort = (field: keyof Pigeon) => {
    if (sortField === field) setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  /** Filtering & sorting **/
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

  const toggleSelect = (
    id?: number,
    index?: number,
    event?: React.MouseEvent<any> | React.ChangeEvent<any>
  ) => {
    if (!id) return;
    const isShift = (event as React.MouseEvent)?.shiftKey ?? false;

    if (isShift && lastSelectedIndex !== null && index !== undefined) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);

      const rangeIds = sortedPigeons
        .slice(start, end + 1)
        .map((p) => p.id!)
        .filter(Boolean);

      setSelectedPigeons((prev) =>
        Array.from(new Set([...prev, ...rangeIds]))
      );
      return;
    }

    setSelectedPigeons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

    if (index !== undefined) setLastSelectedIndex(index);
  };

  const toggleSelectAll = () => {
    if (selectedPigeons.length === pigeons.length) setSelectedPigeons([]);
    else setSelectedPigeons(pigeons.map((p) => p.id!).filter(Boolean));
  };

    // Helper function
    const statusColor = (status?: string) => {
      switch (status) {
        case "active": return "bg-green-100 text-green-800";
        case "retired": return "bg-gray-200 text-gray-800";
        case "lost": return "bg-yellow-100 text-yellow-800";
        case "deceased": return "bg-red-100 text-red-800";
        case "sold": return "bg-purple-100 text-purple-800";
        case "gifted": return "bg-blue-100 text-blue-800";
        case "injured": return "bg-orange-100 text-orange-800";
        default: return "bg-gray-100 text-gray-800"; // fallback
      }
    };


  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
    <Toaster position="top-right" />

    <PageHeader
      title={loftName ? `${t("pigeonsPage.managePigeons")} in ${loftName}` : t("pigeonsPage.managePigeons")}
      right={
        <input
          type="text"
          placeholder={t("pigeonsPage.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 w-64 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
      }
      actions={
        <button
          onClick={() => { setEditingPigeon(null); setOpenForm(true); }}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg border border-indigo-600 hover:bg-indigo-400 transition"
        >
          + {t("pigeonsPage.createPigeon")}
        </button>
      }
    />

{/* ========================= Bulk Actions Toolbar ========================= */}
{selectedPigeons.length > 0 && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 
                bg-white shadow-xl rounded-xl px-4 py-2 
                flex items-center gap-3 z-50 border border-gray-200">
  <span className="font-medium text-gray-700">{selectedPigeons.length} selected</span>

  {/* Bulk Edit */}
  <button
    onClick={() => setShowBulkModal(true)}
    title={t("pigeonsPage.bulkUpdate")}
    className="p-2 rounded-md hover:bg-yellow-100 text-yellow-600 transition"
  >
    <Edit2 className="w-4 h-4" />
  </button>

  {/* Add to Competition */}
  <button
    onClick={() => setShowBulkCompetitionModal(true)}
    title={t("pigeonsPage.addToCompetition")}
    className="p-2 rounded-md hover:bg-indigo-100 text-indigo-600 transition"
  >
    <Trophy className="w-4 h-4" />
  </button>

  {/* Delete */}
  <button
    onClick={() => confirmDelete()}
    title={t("pigeonsPage.deleteSelected")}
    className="p-2 rounded-md hover:bg-red-100 text-red-600 transition"
  >
    <Trash2 className="w-4 h-4" />
  </button>

  {/* Deselect All */}
  <button
    onClick={() => { setSelectedPigeons([]); setLastSelectedIndex(null); }}
    title={t("common.clear")}
    className="p-2 rounded-md hover:bg-gray-100 text-gray-700 transition"
  >
    <Square className="w-4 h-4" />
  </button>
</div>
)}

    {/* ========================= Table ========================= */}
<div className="overflow-x-auto rounded-2xl shadow-lg bg-white mt-6">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50 sticky top-0 z-10">
      <tr>
        {/* Checkbox for select all */}
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={selectedPigeons.length === pigeons.length && pigeons.length > 0}
            onChange={toggleSelectAll}
          />
        </th>

        {/* Column headers with sorting */}
        {[
          ["ringNumber", t("pigeonsPage.ringNumber")],
          ["name", t("pigeonsPage.name")],
          ["gender", t("pigeonsPage.gender")],
          ["status", t("pigeonsPage.status")],
          ["birthDate", t("pigeonsPage.birthDate")],
          ["loftId", t("pigeonsPage.loft")],
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
      {sortedPigeons.map((p, index) => (
        <tr
          key={p.id}
          className={`
            cursor-pointer transition 
            hover:shadow-md hover:bg-gray-50
            ${selectedPigeons.includes(p.id!) ? "bg-blue-50 shadow-md" : index % 2 === 0 ? "bg-white" : "bg-gray-50"}
          `}
          onClick={(e) => toggleSelect(p.id, index, e)}
        >
          {/* Checkbox */}
          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selectedPigeons.includes(p.id!)}
              onChange={(e) => toggleSelect(p.id, index, e)}
            />
          </td>

          {/* Ring Number */}
          <td className="px-4 py-3 font-bold">{p.ringNumber}</td>

          {/* Name */}
          <td className="px-4 py-3">{p.name || "-"}</td>

          {/* Gender */}
          <td className="px-4 py-3">
            <span className={`font-bold ${genderSymbol(p.gender).color}`} title={p.gender || ""}>
              {genderSymbol(p.gender).symbol}
            </span>
          </td>

          {/* Status */}
          <td className="px-4 py-3">
            {p.status && (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(p.status)}`} title={t(`pigeonsPage.${p.status}`)}>
                {t(`pigeonsPage.${p.status}`)}
              </span>
            )}
          </td>

          {/* Birth Date */}
          <td className="px-4 py-3" title={p.birthDate || ""}>
            {p.birthDate || "-"}
          </td>

          {/* Loft */}
          <td className="px-4 py-3" title={lofts.find((l) => l.id === p.loftId)?.name || "-"}>
            {lofts.find((l) => l.id === p.loftId)?.name || "-"}
          </td>

  {/* Actions */}
<td className="px-4 py-3 flex justify-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
  {/* View */}
  <button
    onClick={() => navigate(`/pigeons/${p.id}`)}
    title={t("pigeonsPage.viewPigeon")}
    className="p-2 rounded-md hover:bg-indigo-100 text-indigo-600 transition"
  >
    <Eye className="w-4 h-4" />
  </button>

  {/* Edit */}
  <button
    onClick={() => handleEdit(p)}
    title={t("pigeonsPage.edit")}
    className="p-2 rounded-md hover:bg-yellow-100 text-yellow-600 transition"
  >
    <Edit2 className="w-4 h-4" />
  </button>

  {/* Pedigree PDF */}
  <button
    onClick={() => downloadPedigreePdf(p.id!)}
    title={t("pigeonsPage.download")}
    className="p-2 rounded-md hover:bg-blue-100 text-blue-600 transition"
  >
    <Download className="w-4 h-4" />
  </button>

  {/* Parents */}
  <button
    onClick={() => fetchParents(p.id!, p)}
    title={t("pigeonsPage.parents")}
    className="p-2 rounded-md hover:bg-green-100 text-green-600 transition"
  >
    <Users className="w-4 h-4" />
  </button>
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>



      {/* Pigeon Form */}
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

      {/* Parents Modal */}
      <ParentModal
        open={showParentsModal}
        onClose={() => setShowParentsModal(false)}
        parents={parents}
        loading={loadingParents}
        pigeon={selectedPigeon}
      />

      {/* Bulk Modal */}
      <BulkUpdateModal
        open={showBulkModal}
        lofts={lofts}
        onClose={() => setShowBulkModal(false)}
        onSubmit={async (data) => {
          try {
            await Promise.all(
              selectedPigeons.map((id) => api.patch(`/pigeons/${id}`, data))
            );

            toast.success(t("pigeonsPage.bulkUpdateSuccess"));

            fetchPigeons();
            setSelectedPigeons([]);
            setShowBulkModal(false);
          } catch (err) {
            console.error(err);
            toast.error(t("pigeonsPage.updateFailed"));
          }
        }}
      />

      {/* Bulk Competition Modal */}
      <BulkCompetitionModal
        open={showBulkCompetitionModal}
        selectedPigeons={selectedPigeons}
        onClose={() => setShowBulkCompetitionModal(false)}
      />

      {/* Confirm Delete */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {bulkDelete ? t("pigeonsPage.deleteSelectedTitle") : t("pigeonsPage.deleteTitle")}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {bulkDelete
                ? t("pigeonsPage.deleteSelectedConfirm")
                : t("pigeonsPage.deleteConfirm")}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                disabled={deleteLoading}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                disabled={deleteLoading}
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

