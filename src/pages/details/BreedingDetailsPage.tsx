import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/api";
import PairForm from "../../components/breeding/PairForm";
import PigeonForm from "../../components/pigeons/PigeonForm";
import { Edit2, Trash2, Plus, User, Users, Minus} from "lucide-react";
import type { BreedingPairDTO, Pigeon, BreedingSeasonDTO } from "../../types";
import PageHeader from "../../components/utilities/PageHeader";

export default function BreedingSeasonDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: seasonId } = useParams<{ id: string }>();

  const [pairs, setPairs] = useState<BreedingPairDTO[]>([]);
  const [userPigeons, setUserPigeons] = useState<Pigeon[]>([]);
  const [seasonMeta, setSeasonMeta] = useState<BreedingSeasonDTO | null>(null);

  const [openPairForm, setOpenPairForm] = useState(false);
  const [editingPair, setEditingPair] = useState<BreedingPairDTO | null>(null);

  const [openOffspringForm, setOpenOffspringForm] = useState(false);
  const [activePairId, setActivePairId] = useState<number | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pairToDelete, setPairToDelete] = useState<number | null>(null);

  const [searchText, setSearchText] = useState("");

  const [removeOffspringModalOpen, setRemoveOffspringModalOpen] = useState(false);
  const [activeRemovePairId, setActiveRemovePairId] = useState<number | null>(null); 
  const [selectedOffspringIds, setSelectedOffspringIds] = useState<number[]>([]);


  // ------------------------
  // Fetchers
  // ------------------------
  const fetchPairs = async () => {
    if (!seasonId) return;
    try {
      const res = await api.get<BreedingPairDTO[]>(`/breeding/seasons/${seasonId}/pairs`);
      setPairs(res.data);
    } catch (err) {
      console.error("Failed to fetch pairs", err);
      toast.error(t("breedingPage.fetchPairsFailed"));
      setPairs([]);
    }
  };

  const fetchSeason = async () => {
    if (!seasonId) return;
    try {
      const res = await api.get<BreedingSeasonDTO>(`/breeding/seasons/${seasonId}`);
      setSeasonMeta(res.data);
    } catch (err) {
      console.error("Failed to fetch season", err);
      setSeasonMeta(null);
    }
  };

  const fetchUserPigeons = async () => {
    try {
      const res = await api.get<Pigeon[]>("/pigeons");
      setUserPigeons(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pigeons", err);
      toast.error(t("breedingPage.fetchPigeonsFailed"));
      setUserPigeons([]);
    }
  };

  useEffect(() => {
    fetchPairs();
    fetchSeason();
    fetchUserPigeons();
  }, [seasonId]);

  const pigeonsMale = useMemo(
    () => userPigeons.filter((p) => p.gender?.toLowerCase() === "male"),
    [userPigeons]
  );

  const pigeonsFemale = useMemo(
    () => userPigeons.filter((p) => p.gender?.toLowerCase() === "female"),
    [userPigeons]
  );

  // ------------------------
  // Handlers
  // ------------------------
  const handleCreateOrUpdatePair = async (dto: BreedingPairDTO) => {
    try {
      if (dto.id) {
        await api.patch(`/breeding/pairs/${dto.id}`, dto);
        toast.success(t("breedingPage.pairUpdated"));
      } else {
        await api.post(`/breeding/seasons/${seasonId}/pairs`, dto);
        toast.success(t("breedingPage.pairCreated"));
      }
      setOpenPairForm(false);
      setEditingPair(null);
      await fetchPairs();
    } catch (err) {
      console.error("Failed to save pair", err);
      toast.error(t("breedingPage.saveFailed"));
    }
  };

  const handleDeletePair = async () => {
    if (!pairToDelete) return;
    try {
      await api.delete(`/breeding/pairs/${pairToDelete}`);
      setPairs((prev) => prev.filter((p) => p.id !== pairToDelete));
      toast.success(t("breedingPage.pairDeleted"));
    } catch (err) {
      console.error("Failed to delete pair", err);
      toast.error(t("breedingPage.deleteFailed"));
    } finally {
      setDeleteModalOpen(false);
      setPairToDelete(null);
    }
  };

  const handleOpenOffspringForm = (pairId: number) => {
    setActivePairId(pairId);
    setOpenOffspringForm(true);
  };

  const handleCreateOffspring = async (pigeon: Pigeon) => {
    try {
      if (!activePairId) return;
      const res = await api.post<Pigeon>("/pigeons", pigeon);
      const newPigeon = res.data;
      await api.post<BreedingPairDTO>(`/breeding/pairs/${activePairId}/offspring/${newPigeon.id}`);
      toast.success(t("breedingPage.offspringCreated"));
      setOpenOffspringForm(false);
      setActivePairId(null);
      await fetchPairs();
      await fetchUserPigeons();
    } catch (err) {
      console.error(err);
      toast.error(t("breedingPage.createOffspringFailed"));
    }
  };

  const handleRemoveSelectedOffspring = async () => {
  if (!activeRemovePairId) return;

  try {
    await Promise.all(selectedOffspringIds.map(id =>
      api.delete(`/breeding/pairs/${activeRemovePairId}/offspring/${id}`)
    ));
    toast.success(t("breedingPage.offspringRemoved"));
    setRemoveOffspringModalOpen(false);
    setActiveRemovePairId(null);
    setSelectedOffspringIds([]);
    await fetchPairs();
  } catch (err) {
    console.error(err);
    toast.error(t("breedingPage.removeOffspringFailed"));
  }
};


  const handleOpenRemoveOffspringModal = (pairId: number) => {
    setActiveRemovePairId(pairId);
    const pair = pairs.find(p => p.id === pairId);
    setSelectedOffspringIds(pair?.offspringIds || []);
    setRemoveOffspringModalOpen(true);
  };


  // ------------------------
  // Filtered pairs
  // ------------------------
  const filteredPairs = pairs.filter(pair => {
    const male = userPigeons.find(p => p.id === pair.maleId)?.ringNumber?.toLowerCase() ?? "";
    const female = userPigeons.find(p => p.id === pair.femaleId)?.ringNumber?.toLowerCase() ?? "";
    const term = searchText.toLowerCase();
    return male.includes(term) || female.includes(term);
  });

  if (!seasonId) return <div className="p-6">{t("breedingPage.noSeasonSelected")}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <Toaster position="top-right" />

<PageHeader
  title={seasonMeta?.name ?? t("breedingPage.seasonDetails")}
  right={
    <input
      type="text"
      placeholder={t("breedingPage.searchPair")}
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      className="px-4 py-2 border rounded-lg w-full md:w-64"
    />
  }
  actions={
    <>
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
      >
        ← {t("common.back")}
      </button>

      <button
        onClick={() => { setEditingPair(null); setOpenPairForm(true); }}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        <Plus className="w-4 h-4 inline mr-1" /> {t("breedingPage.addPair")}
      </button>
    </>
  }
/>


      {/* Pairs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPairs.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-6">{t("breedingPage.noPairs")}</div>
        ) : (
          filteredPairs.map((pair) => {
            const offspringList = (pair.offspringIds || []).map((id) =>
              userPigeons.find((p) => p.id === id)
            );

            return (
              <div key={pair.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition">
                {/* Header */}
                <div className="bg-indigo-50 flex justify-between items-center p-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-700" />
                    <button
                      onClick={() => navigate(`/pigeons/${pair.maleId}`)}
                      className="text-sm font-semibold text-blue-800 hover:underline"
                    >
                      {pair.maleRing ?? pair.maleId}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-700" />
                    <button
                      onClick={() => navigate(`/pigeons/${pair.femaleId}`)}
                      className="text-sm font-semibold text-pink-800 hover:underline"
                    >
                      {pair.femaleRing ?? pair.femaleId}
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="text-gray-600 text-sm">
                    <span className="font-semibold">{t("breedingPage.breedingDate")}: </span>
                    {pair.breedingDate ?? "-"}
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-semibold">{t("breedingPage.notes")}: </span>
                    {pair.notes ?? "-"}
                  </div>

                  {/* Offspring */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {offspringList.length > 0 ? (
                      offspringList.map((p) => (
                        <button
                          key={p?.id}
                          onClick={() => p && navigate(`/pigeons/${p.id}`)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            p?.gender?.toLowerCase() === "male"
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                          } transition`}
                        >
                          {p?.ringNumber}{p?.name ? ` (${p.name})` : ""}
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">{t("breedingPage.noOffspring")}</span>
                    )}
                  </div>
                </div>

                {/* Footer actions */}
                <div className="flex justify-end gap-2 p-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-2">
  {/* Edit Pair */}
  <button
    onClick={() => { setEditingPair(pair); setOpenPairForm(true); }}
    className="p-1 text-yellow-600 rounded-md hover:bg-yellow-100 transition flex items-center justify-center"
    title={t("breedingPage.editPair")}
  >
    <Edit2 className="w-4 h-4" />
  </button>

  {/* Add Offspring */}
  <button
    onClick={() => handleOpenOffspringForm(pair.id!)}
    className="p-1 text-green-600 rounded-md hover:bg-green-100 transition flex items-center justify-center"
    title={t("breedingPage.addOffspring")}
  >
    <Plus className="w-4 h-4" />
  </button>

  {/* Remove Offspring */}
  <button
    onClick={() => handleOpenRemoveOffspringModal(pair.id!)}
    className="p-1 text-red-600 rounded-md hover:bg-red-100 transition flex items-center justify-center"
    title={t("breedingPage.removeOffspring")}
  >
    <Minus className="w-4 h-4" /> {/* better than × for consistency with icons */}
  </button>

  {/* Delete Pair */}
  <button
    onClick={() => { setPairToDelete(pair.id ?? null); setDeleteModalOpen(true); }}
    className="p-1 text-red-700 rounded-md hover:bg-red-100 transition flex items-center justify-center"
    title={t("breedingPage.deletePair")}
  >
    <Trash2 className="w-4 h-4" />
  </button>
</div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Forms */}
      {openPairForm && (
        <PairForm
          open={openPairForm}
          onClose={() => { setOpenPairForm(false); setEditingPair(null); }}
          onSubmit={handleCreateOrUpdatePair}
          initialData={editingPair || undefined}
          seasonId={Number(seasonId)}
          pigeonsMale={pigeonsMale}
          pigeonsFemale={pigeonsFemale}
        />
      )}

      {openOffspringForm && (
        <PigeonForm
          open={openOffspringForm}
          onClose={() => { setOpenOffspringForm(false); setActivePairId(null); }}
          onSubmit={handleCreateOffspring}
        />
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t("breedingPage.deletePairTitle")}</h2>
            <p className="text-sm text-gray-600 mb-6">{t("breedingPage.deletePairConfirm")}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDeletePair}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {removeOffspringModalOpen && activeRemovePairId !== null && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{t("breedingPage.removeOffspringTitle")}</h2>
      <p className="text-sm text-gray-600 mb-4">{t("breedingPage.removeOffspringSelect")}</p>

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
        {(pairs.find(p => p.id === activeRemovePairId)?.offspringIds || []).map(id => {
          const p = userPigeons.find(p => p.id === id);
          if (!p) return null;
          const isChecked = selectedOffspringIds.includes(id);
          return (
            <label key={id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  if (isChecked) {
                    setSelectedOffspringIds(prev => prev.filter(pid => pid !== id));
                  } else {
                    setSelectedOffspringIds(prev => [...prev, id]);
                  }
                }}
              />
              {p.ringNumber}{p.name ? ` (${p.name})` : ""}
            </label>
          );
        })}
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setRemoveOffspringModalOpen(false)}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={handleRemoveSelectedOffspring}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
