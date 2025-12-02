import React, { useEffect, useState } from "react";
import api from "../../api/api";
import type { Pigeon, CompetitionEntry } from "../../types";
import { useTranslation } from "react-i18next";
import type { AppUser } from "../utilities/UserContext";

interface PedigreeTreeProps {
  pigeon: Pigeon;
  generations: number;
  competitions?: CompetitionEntry[];
  boxWidth?: number;
  boxHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  owner?: AppUser;
  logoUrl?: string; // optional loft logo
}

interface TreeNode extends Pigeon {
  father?: TreeNode;
  mother?: TreeNode;
  competitions?: CompetitionEntry[];
}

export const PedigreeTree: React.FC<PedigreeTreeProps> = ({
  pigeon,
  generations,
  competitions,
  boxWidth = 260,
  boxHeight = 160,
  horizontalSpacing = 60,
  verticalSpacing = 40,
  owner,
  logoUrl,
}) => {
  const { t } = useTranslation();
  const [tree, setTree] = useState<TreeNode | null>(null);

  // Build tree logic (same as before)
  useEffect(() => {
    let cancelled = false;

    const normalize = (r?: string) => (r ? r.trim().toUpperCase() : r);

    const fetchParentByRing = async (ringNumber?: string) => {
      if (!ringNumber) return undefined;
      const rn = normalize(ringNumber) as string;
      try {
        const res = await api.get<Pigeon[]>(`/pigeons?ringNumber=${encodeURIComponent(rn)}`);
        if (!Array.isArray(res.data) || res.data.length === 0) return undefined;
        return res.data.find((p) => p.ringNumber?.trim().toUpperCase() === rn);
      } catch {
        return undefined;
      }
    };

    const buildTree = async (p: Pigeon | undefined, level: number, seen = new Set<string | number>()): Promise<TreeNode | undefined> => {
      if (!p || level <= 0) return p ? ({ ...p } as TreeNode) : undefined;
      const key = p.id ?? p.ringNumber;
      if (key && seen.has(key)) return { ...p } as TreeNode;
      if (key) seen.add(key);

      const node: TreeNode = { ...p };
      const hasFatherObj = (p as any).father && typeof (p as any).father === "object";
      const hasMotherObj = (p as any).mother && typeof (p as any).mother === "object";

      const fatherPromise = (async () =>
        hasFatherObj ? (p as any).father as Pigeon : await fetchParentByRing(p.fatherRingNumber)
      )();
      const motherPromise = (async () =>
        hasMotherObj ? (p as any).mother as Pigeon : await fetchParentByRing(p.motherRingNumber)
      )();

      const [father, mother] = await Promise.all([fatherPromise, motherPromise]);

      if (father) node.father = await buildTree(father, level - 1, new Set(seen));
      if (mother) node.mother = await buildTree(mother, level - 1, new Set(seen));

      return node;
    };

    (async () => {
      const built = await buildTree(pigeon, generations);
      if (!cancelled) setTree(built ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, [pigeon, generations]);

  if (!tree) return <div>Loading pedigree...</div>;

  const genderSymbol = (gender?: string) => {
    if (!gender) return { symbol: "", color: "#6B7280" };
    const lower = gender.toLowerCase();
    if (lower === "male") return { symbol: "♂", color: "#3B82F6" };
    if (lower === "female") return { symbol: "♀", color: "#EC4899" };
    return { symbol: "", color: "#6B7280" };
  };

  const renderCompetitions = (competitions?: CompetitionEntry[]) => {
    if (!competitions || competitions.length === 0) return null;
    return (
      <table style={{ fontSize: 10, width: "100%", marginTop: 4, borderCollapse: "collapse" }}>
        <tbody>
          {competitions.map((c) => (
            <tr key={c.id}>
              <td style={{ padding: 2 }}>{c.competition?.name || "-"}</td>
              <td style={{ padding: 2 }}>{c.competition?.date || "-"}</td>
              <td style={{ padding: 2, textAlign: "right" }}>{c.actualDistanceKm ?? "-"}</td>
              <td style={{ padding: 2, textAlign: "right" }}>{c.place ?? "-"}</td>
              <td style={{ padding: 2, textAlign: "right" }}>{c.score ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderTreeLR = (node: TreeNode | undefined, level: number = 0) => {
  if (!node) return <div style={{ width: boxWidth, height: boxHeight }} />;

  const fatherElem = renderTreeLR(node.father, level + 1);
  const motherElem = renderTreeLR(node.mother, level + 1);

  const birthDate = node.birthDate ? new Date(node.birthDate) : null;
  const monthYear = birthDate
    ? birthDate.toLocaleString("default", { month: "short", year: "numeric" })
    : "-";

  const competitionsToShow = level <= 1 ? (level === 0 ? competitions : node.competitions) : undefined;

  // Scale box based on generation level
  // level 0 = main pigeon = full size
  // level 1 = parents = 80%
  // level 2+ = grandparents = 60% etc.
  const scale = Math.max(0.6, 1 - 0.2 * level);
  const scaledWidth = boxWidth * scale;
  const scaledHeight = boxHeight * scale;

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: horizontalSpacing }}>
      <div
        style={{
          width: scaledWidth,
          minHeight: scaledHeight,
          border: "2px solid #4B5563",
          borderRadius: 10,
          backgroundColor: "#F3F4F6",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          textAlign: "center",
          padding: 8 * scale, // scale padding too
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 8 * scale, alignItems: "center", fontWeight: 600, fontSize: 14 * scale }}>
          <span>{node.ringNumber || "-"}</span>
          <span style={{ color: genderSymbol(node.gender).color }}>{genderSymbol(node.gender).symbol}</span>
        </div>
        <div style={{ fontSize: 14 * scale, fontWeight: 500, marginTop: 6 * scale }}>
          {node.name || t("pigeonPage.notInDatabase")}
        </div>
        <div style={{ fontSize: 12 * scale, color: "#6B7280", marginTop: 2 * scale }}>{monthYear}</div>
        {competitionsToShow && (
          <div style={{ width: "100%", marginTop: 4 * scale }}>
            {renderCompetitions(competitionsToShow)}
          </div>
        )}
      </div>

      {(node.father || node.mother) && (
        <div style={{ display: "flex", flexDirection: "column", gap: verticalSpacing }}>
          {fatherElem}
          {motherElem}
        </div>
      )}
    </div>
  );
};


  // Header + owner info (certificate style)
  const renderHeader = () => (
    <div style={{ textAlign: "center", marginBottom: 16 }}>
      <h1 style={{ margin: 0 }}>Pedigree</h1>
      {logoUrl && <img src={logoUrl} alt="Loft Logo" style={{ height: 60, marginTop: 8 }} />}
      {owner && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            border: "1px solid #888",
            borderRadius: 6,
            backgroundColor: "#F9FAFB",
            fontSize: 12,
            lineHeight: 1.3,
          }}
        >
          <div> {owner.firstName} {owner.lastName}</div>
          {owner.phoneNumber && <div>Phone: {owner.phoneNumber}</div>}
          <div>Email: {owner.email}</div>
          {owner.address && <div>Address: {owner.address}</div>}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: 20, backgroundColor: "#fff", border: "1px solid #ccc" }}>
      {renderHeader()}
      <div>{renderTreeLR(tree)}</div>
    </div>
  );
};
