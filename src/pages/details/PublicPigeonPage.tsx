import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import type { Pigeon } from "../../types";

export default function PublicPigeonPage() {
  const { id } = useParams();
  const [pigeon, setPigeon] = useState<Pigeon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/pigeons/public/${id}`);
        setPigeon(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!pigeon) return <p style={{ padding: 20 }}>Pigeon not found.</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 10 }}>
        {pigeon.name || pigeon.ringNumber}
      </h1>

      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: "1px solid #ddd",
          background: "#fafafa",
          marginBottom: 25,
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>Pigeon Information</h2>

        <ul style={{ lineHeight: "1.8" }}>
          <li><strong>Ring Number:</strong> {pigeon.ringNumber}</li>
          <li><strong>Name:</strong> {pigeon.name}</li>
          <li><strong>Color:</strong> {pigeon.color}</li>
          <li><strong>Gender:</strong> {pigeon.gender}</li>
          <li><strong>Status:</strong> {pigeon.status}</li>
          <li><strong>Birth Date:</strong> {pigeon.birthDate}</li>
          <li><strong>Father Ring:</strong> {pigeon.fatherRingNumber}</li>
          <li><strong>Mother Ring:</strong> {pigeon.motherRingNumber}</li>
        </ul>
      </div>

      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: "1px solid #ddd",
          background: "#fafafa",
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>Competition Results</h2>
      </div>

      <p style={{ marginTop: 40, fontSize: 12, color: "#777" }}>
        This is a public, read-only pigeon profile.  
      </p>
    </div>
  );
}
