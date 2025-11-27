import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast, { Toaster } from "react-hot-toast";
import PigeonForm from "../pages/PigeonForm";
import ParentModal from "../pages/ParentModal";
import BulkUpdateModal from "../components/BulkUpdateModal";
import api from "../api/api";
import { Edit2, Trash2, FileText, Users, Eye } from "lucide-react";
import PageHeader from "../components/PageHeader";
import type { Pigeon, Loft } from "../types";
import { useNavigate } from "react-router-dom";

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
          <>
            <button
              onClick={() => {
                setEditingPigeon(null);
                setOpenForm(true);
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg border border-indigo-600 hover:bg-indigo-400 transition"
            >
              + {t("pigeonsPage.createPigeon")}
            </button>
          </>
        }
      />

      {/* Bulk actions toolbar */}
      {selectedPigeons.length > 0 && (
        <div className="
          fixed bottom-6 left-1/2 -translate-x-1/2 
          bg-white shadow-xl rounded-xl px-6 py-3 
          flex items-center gap-4 z-50
          border border-gray-200
        ">
          <span className="font-semibold">{selectedPigeons.length} selected</span>

          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {t("pigeonsPage.bulkUpdate")}
          </button>

          <button
            onClick={() => confirmDelete()}
            className="p-2 text-red-700 rounded-md hover:bg-red-100 transition flex items-center justify-center"
            title={t("pigeonsPage.deleteSelected")}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* New: Deselect all button */}
          <button
            onClick={() => {
              setSelectedPigeons([]);
              setLastSelectedIndex(null);
            }}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            {t("common.clear")}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedPigeons.length === pigeons.length && pigeons.length > 0}
                  onChange={toggleSelectAll}
                />
                
              </th>
              {[
                ["ringNumber", t("pigeonsPage.ringNumber")],
                ["name", t("pigeonsPage.name")],
                ["color", t("pigeonsPage.color")],
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
              className={`hover:bg-gray-50 cursor-pointer ${
                selectedPigeons.includes(p.id!) ? "bg-blue-50" : ""
              }`}
              onClick={(e) => toggleSelect(p.id, index, e)}
            >

                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedPigeons.includes(p.id!)}
                    onChange={(e) => toggleSelect(p.id, index, e)}
                  />
                </td>

                <td className="px-4 py-3 font-bold">{p.ringNumber}</td>
                <td className="px-4 py-3">{p.name || ""}</td>
                <td className="px-4 py-3">{p.color || ""}</td>
                <td className={`px-4 py-3 font-bold ${genderSymbol(p.gender).color}`}>
                  {genderSymbol(p.gender).symbol}
                </td>
                <td className="px-4 py-3">{p.status ? t(`pigeonsPage.${p.status}`) : ""}</td>
                <td className="px-4 py-3">{p.birthDate || ""}</td>
                <td className="px-4 py-3">{lofts.find((l) => l.id === p.loftId)?.name || "-"}</td>
                <td
                  className="px-4 py-3 flex justify-center gap-2 flex-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => navigate(`/pigeons/${p.id}`)}
                    className="p-2 text-indigo-700 rounded-md hover:bg-indigo-100 transition flex items-center justify-center"
                    title={t("pigeonsPage.viewPigeon")}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 text-yellow-700 rounded-md hover:bg-yellow-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(p)}
                    className="p-2 text-red-700 rounded-md hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadPedigreePdf(p.id!)}
                    className="p-2 text-blue-700 rounded-md hover:bg-blue-100 transition"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchParents(p.id!, p)}
                    className="p-2 text-green-700 rounded-md hover:bg-green-100 transition"
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

