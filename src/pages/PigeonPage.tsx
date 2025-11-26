import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import api from "../api/api";
import { FileText, Users, ArrowLeft } from "lucide-react";
import PigeonForm from "./PigeonForm";
import type { CompetitionEntry } from "../types";

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

export default function PigeonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pigeon, setPigeon] = useState<Pigeon | null>(null);
  const [parents, setParents] = useState<Pigeon[]>([]);
  const [children, setChildren] = useState<Pigeon[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionEntry[]>([]);
  const [pedigree, setPedigree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          pigeonRes,
          parentsRes,
          childrenRes,
          competitionsRes,
          pedigreeRes,
        ] = await Promise.all([
          api.get<Pigeon>(`/pigeons/${id}`),
          api.get<Pigeon[]>(`/pigeons/${id}/parents`),
          api.get<Pigeon[]>(`/pigeons/${id}/children`),
          api.get<CompetitionEntry[]>(`/pigeons/${id}/competitions`),
          api.get(`/pigeons/${id}/pedigree`),
        ]);

        setPigeon(pigeonRes.data);
        setParents(parentsRes.data);
        setChildren(childrenRes.data);
        setCompetitions(competitionsRes.data);
        setPedigree(pedigreeRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load pigeon data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const downloadPedigreePdf = async () => {
    if (!pigeon?.id) return;
    try {
      const res = await api.get(`/pigeons/${pigeon.id}/pedigree/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `pedigree_${pigeon.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Downloaded pedigree PDF");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF");
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
      toast.success("Pigeon updated successfully");
      setPigeon(updated);
      setOpenForm(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update pigeon");
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
            <h2 className="text-xl font-semibold mb-2">Pigeon not found</h2>
            <p className="text-sm text-gray-600 mb-4">The requested pigeon could not be loaded.</p>
            <button
              onClick={() => navigate("/pigeons")}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Back to list
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
              <ArrowLeft className="w-4 h-4" /> <span className="text-sm">Back</span>
            </button>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Pigeon</span>
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
              Edit Pigeon
            </button>

            <button
              onClick={downloadPedigreePdf}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Download Pedigree</span>
            </button>
          </div>
        </div>

        {/* Top cards: Basic Info + quick stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic info card */}
          <div className="col-span-2 bg-white shadow-md rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Name</div>
                <div className="font-medium text-gray-800">{pigeon.name || "-"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500">Ring</div>
                <div className="font-medium text-gray-800">{pigeon.ringNumber || "-"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500">Color</div>
                <div className="font-medium text-gray-800">{pigeon.color || "-"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500">Gender</div>
                <div className={`font-medium ${genderSymbol(pigeon.gender).color}`}>
                  {genderSymbol(pigeon.gender).symbol} {pigeon.gender || "-"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500">Status</div>
                <div className="font-medium text-gray-800">{pigeon.status || "-"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500">Birth date</div>
                <div className="font-medium text-gray-800">{pigeon.birthDate || "-"}</div>
              </div>
            </div>
          </div>

          {/* Quick actions / meta card */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-sm text-gray-500">Relations</h3>
              <div className="mt-3">
                <div className="text-xs text-gray-500">Parents</div>
                <div className="text-lg font-semibold text-gray-800">{parents.length}</div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-gray-500">Children</div>
                <div className="text-lg font-semibold text-gray-800">{children.length}</div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
                className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Jump to Pedigree
              </button>
            </div>
          </div>
        </div>

        {/* Parents + Children */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parents */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" /> Parents
            </h2>

            {parents.length === 0 ? (
              <p className="text-gray-500">No parents recorded</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parents.map((p) => (
                  <li
                    key={p.id}
                    className="p-3 bg-gray-50 border border-gray-100 rounded-lg hover:shadow transition"
                  >
                    <div className="font-medium">{p.name || "-"}</div>
                    <div className="text-sm text-gray-600">{p.ringNumber || "-"}</div>
                    <div className={`text-sm mt-1 ${genderSymbol(p.gender).color}`}>
                      {genderSymbol(p.gender).symbol} {p.gender || "-"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Children */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Children</h2>

            {children.length === 0 ? (
              <p className="text-gray-500">No children recorded</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {children.map((c) => (
                  <li
                    key={c.id}
                    className="p-3 bg-gray-50 border border-gray-100 rounded-lg hover:shadow transition"
                  >
                    <div className="font-medium">{c.name || "-"}</div>
                    <div className="text-sm text-gray-600">{c.ringNumber || "-"}</div>
                    <div className={`text-sm mt-1 ${genderSymbol(c.gender).color}`}>
                      {genderSymbol(c.gender).symbol} {c.gender || "-"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Competitions */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Competitions</h2>

          {competitions.length === 0 ? (
            <p className="text-gray-500">No competition records</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Competition</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Position</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                {competitions.map((entry) => (
                    <tr key={entry.id} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-800">
                        {entry.competition?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                        {entry.place ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                        {entry.competition?.date || "-"}
                    </td>
                    </tr>
                ))}
                </tbody>

              </table>
            </div>
          )}
        </div>

        {/* Pedigree */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Pedigree</h2>

          {pedigree ? (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-[40vh]">
              {JSON.stringify(pedigree, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No pedigree information available</p>
          )}
        </div>
      </div>

      {/* Pigeon Form Modal (kept outside visual sections for cleaner DOM) */}
      {openForm && (
        <PigeonForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          initialData={editingPigeon || undefined}
          onSubmit={updatePigeonData}
        />
      )}
    </div>
  );
}
