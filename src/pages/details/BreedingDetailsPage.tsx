import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast, { Toaster } from "react-hot-toast";
import PairForm from "../../components/breeding/PairForm";
import PigeonForm from "../../components/pigeons/PigeonForm";
import type { BreedingPairDTO, Pigeon, BreedingSeasonDTO } from "../../types";
import PageHeader from "../../components/utilities/PageHeader";
import ConfirmDeleteModal from "../../components/utilities/ConfirmDeleteModal";
import PairCard from "../../components/breeding/PairCard";
import { getUserPigeons, createPigeon } from "../../api/pigeon";
import {
  getPairsForSeason,
  getBreedingSeason,
  deletePair,
  createPair,
  updatePair,
  addOffspring,
  removeOffspring
} from "../../api/breeding";

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

  // ------------------------
  // Fetchers
  // ------------------------
  const fetchPairs = async () => {
    if (!seasonId) return;
    try {
      const res = await getPairsForSeason(seasonId);
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
      const res = await getBreedingSeason(seasonId);
      setSeasonMeta(res.data);
    } catch (err) {
      console.error("Failed to fetch season", err);
      setSeasonMeta(null);
    }
  };

  const fetchUserPigeons = async () => {
    try {
      const res = await getUserPigeons();
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
      if (dto.id) await updatePair(dto)
      else await createPair(seasonId!, dto);

      toast.success(dto.id ? t("breedingPage.pairUpdated") : t("breedingPage.pairCreated"));
      setOpenPairForm(false);
      setEditingPair(null);
      await fetchPairs();
    } catch (err) {
      console.error("Failed to save pair", err);
      toast.error(t("breedingPage.saveFailed"));
    }
  };

  const handleDeletePair = async (pairId: number) => {
    try {
      await deletePair(pairId);
      setPairs((prev) => prev.filter((p) => p.id !== pairId));
      toast.success(t("breedingPage.pairDeleted"));
    } catch (err) {
      console.error("Failed to delete pair", err);
      toast.error(t("breedingPage.deleteFailed"));
    } finally {
      setDeleteModalOpen(false);
      setPairToDelete(null);
    }
  };

  const handleCreateOffspring = async (pigeon: Pigeon) => {
    if (!activePairId) return;
    try {
      const res = await createPigeon(pigeon);
      const newPigeon = res.data;
      await addOffspring(activePairId, newPigeon.id!)
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

  const handleRemoveOffspring = async (pairId: number, offspringIds: number[]) => {
    try {
      await Promise.all(offspringIds.map(id =>
        removeOffspring(pairId,id)
      ));
      toast.success(t("breedingPage.offspringRemoved"));
      await fetchPairs();
    } catch (err) {
      console.error(err);
      toast.error(t("breedingPage.removeOffspringFailed"));
    }
  };

  // ------------------------
  // Filtered pairs
  // ------------------------
  const filteredPairs = pairs.filter(pair => {
    const male = userPigeons.find(p => p.id === pair.maleId)?.ringNumber?.toLowerCase() ?? "";
    const female = userPigeons.find(p => p.id === pair.femaleId)?.ringNumber?.toLowerCase() ?? "";
    return male.includes(searchText.toLowerCase()) || female.includes(searchText.toLowerCase());
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
              {t("breedingPage.addPair")}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filteredPairs.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-6">{t("breedingPage.noPairs")}</div>
        ) : (
          filteredPairs.map(pair => (
            <PairCard
              key={pair.id}
              pair={pair}
              userPigeons={userPigeons}
              onEdit={(p) => { setEditingPair(p); setOpenPairForm(true); }}
              onDelete={(pId) => { setPairToDelete(pId); setDeleteModalOpen(true); }}
              onAddOffspring={(pId) => { setActivePairId(pId); setOpenOffspringForm(true); }}
              onRemoveOffspring={handleRemoveOffspring}
            />
          ))
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

      {openOffspringForm && activePairId !== null && (
        <PigeonForm
          open={openOffspringForm}
          onClose={() => { setOpenOffspringForm(false); setActivePairId(null); }}
          onSubmit={handleCreateOffspring}
        />
      )}

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title={t("breedingPage.deletePairTitle")}
        message={t("breedingPage.deletePairConfirm")}
        cancelLabel={t("common.cancel")}
        deleteLabel={t("common.delete")}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={() => pairToDelete && handleDeletePair(pairToDelete)}
      />
    </div>
  );
}