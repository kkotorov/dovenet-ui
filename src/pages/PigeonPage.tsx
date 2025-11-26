import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import api from "../api/api";
import { FileText, Users, ArrowLeft } from "lucide-react";

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

export interface CompetitionEntry {
  id: number;
  competitionName: string;
  position: number;
  date: string;
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

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (!pigeon) return <div className="p-6">Pigeon not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/pigeons")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-800">
          {pigeon.name} ({pigeon.ringNumber})
        </h1>

        <button
          onClick={downloadPedigreePdf}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FileText className="w-4 h-4" /> Download Pedigree PDF
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div><span className="font-semibold">Color:</span> {pigeon.color}</div>
          <div>
            <span className="font-semibold">Gender:</span>{" "}
            <span className={genderSymbol(pigeon.gender).color}>
              {genderSymbol(pigeon.gender).symbol} {pigeon.gender}
            </span>
          </div>
          <div><span className="font-semibold">Status:</span> {pigeon.status}</div>
          <div><span className="font-semibold">Birth Date:</span> {pigeon.birthDate}</div>
        </div>
      </div>

      {/* Parents */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" /> Parents
        </h2>
        {parents.length === 0 ? (
          <p className="text-gray-500">No parents recorded</p>
        ) : (
          <ul className="space-y-2">
            {parents.map((p) => (
              <li key={p.id} className="p-2 border border-gray-200 rounded-lg">
                {p.name} ({p.ringNumber}) - {p.gender}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Children */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Children</h2>
        {children.length === 0 ? (
          <p className="text-gray-500">No children recorded</p>
        ) : (
          <ul className="space-y-2">
            {children.map((c) => (
              <li key={c.id} className="p-2 border border-gray-200 rounded-lg">
                {c.name} ({c.ringNumber}) - {c.gender}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Competitions */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Competitions</h2>
        {competitions.length === 0 ? (
          <p className="text-gray-500">No competition records</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Competition</th>
                  <th className="px-4 py-2 text-left font-semibold">Position</th>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {competitions.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{comp.competitionName}</td>
                    <td className="px-4 py-2">{comp.position}</td>
                    <td className="px-4 py-2">{comp.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pedigree */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Pedigree</h2>
        {pedigree ? (
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(pedigree, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">No pedigree information available</p>
        )}
      </div>
    </div>
  );
}
