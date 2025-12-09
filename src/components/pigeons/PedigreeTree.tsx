import React, { useEffect, useState, useRef } from "react";
import api from "../../api/api";
import type { Pigeon, CompetitionEntry } from "../../types";
import { useTranslation } from "react-i18next";
import type { AppUser } from "../utilities/UserContext";
import { QRCodeCanvas } from "qrcode.react";

interface PedigreeTreeProps {
  pigeon: Pigeon;
  generations?: number;
  competitions?: CompetitionEntry[];
  boxWidth?: number;
  boxHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  owner?: AppUser;
  logoUrl?: string;
  pageWidth?: number;
  pageHeight?: number;
}

interface TreeNode extends Pigeon {
  father?: TreeNode;
  mother?: TreeNode;
  competitions?: CompetitionEntry[];
}

interface Position {
  node: TreeNode;
  x: number;
  y: number;
  showCompetitions?: boolean;
  includePhoto?: boolean;
  mainPigeon?: boolean;
  heightOverride?: number;
}

export const PedigreeTree: React.FC<PedigreeTreeProps> = ({
  pigeon,
  competitions,  
  generations = 2,
  boxWidth = 220,
  boxHeight = 160,
  horizontalSpacing = 40,
  verticalSpacing = 20,
  owner,
  logoUrl,
  pageWidth = 1123,
  pageHeight = 794,
}) => {
  const { t } = useTranslation();
  const [tree, setTree] = useState<TreeNode | null>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  // Build tree
  useEffect(() => {
    let cancelled = false;

    const normalize = (r?: string) => (r ? r.trim().toUpperCase() : r);

    const fetchParentByRing = async (ringNumber?: string) => {
      if (!ringNumber) return undefined;
      const rn = normalize(ringNumber);
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

      const fatherPromise = hasFatherObj ? Promise.resolve((p as any).father) : fetchParentByRing(p.fatherRingNumber);
      const motherPromise = hasMotherObj ? Promise.resolve((p as any).mother) : fetchParentByRing(p.motherRingNumber);

      const [father, mother] = await Promise.all([fatherPromise, motherPromise]);

      if (father) node.father = await buildTree(father, level - 1, new Set(seen));
      if (mother) node.mother = await buildTree(mother, level - 1, new Set(seen));

      return node;
    };

    (async () => {
      const built = await buildTree(pigeon, generations + 1);
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

  const renderCompetitions = (comps?: CompetitionEntry[]) => {
    if (!comps || comps.length === 0) return null;
    return (
      <table style={{ fontSize: 10, width: "100%", marginTop: 4, borderCollapse: "collapse" }}>
        <tbody>
          {comps.map((c) => (
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

  const renderBox = (node: TreeNode, showCompetitions?: boolean, includePhoto?: boolean, mainPigeon?: boolean, heightOverride?: number) => {
    const birthDate = node.birthDate ? new Date(node.birthDate) : null;
    const monthYear = birthDate
      ? birthDate.toLocaleString("default", { month: "short", year: "numeric" })
      : "-";

    const height = heightOverride ?? (mainPigeon ? boxHeight * 1.5 : boxHeight);

    return (
      <div
        style={{
          width: boxWidth,
          height,
          border: "2px solid #4B5563",
          borderRadius: 10,
          backgroundColor: "#F3F4F6",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          textAlign: "center",
          padding: 8,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 6, alignItems: "center", fontWeight: 600, fontSize: 14 }}>
          <span>{node.ringNumber || "-"}</span>
          <span style={{ color: genderSymbol(node.gender).color }}>{genderSymbol(node.gender).symbol}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{node.name || t("pigeonPage.notInDatabase")}</div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{monthYear}</div>
        {showCompetitions && node.competitions && renderCompetitions(node.competitions)}
      </div>
    );
  };

  const centerY = pageHeight / 2 - boxHeight / 2;
  const mainBoxHeight = boxHeight * 1.5;
  const mainTop = centerY;

  const positions: Position[] = [];

  // Calculate total tree width: main + parents + grandparents
  const treeDepth = 3; // main + parents + grandparents
  const totalWidth = treeDepth * boxWidth + (treeDepth - 1) * horizontalSpacing;
  const startX = (pageWidth - totalWidth) / 2; // shift to center

  // Main pigeon
  positions.push({
    node: {
      ...tree,
      competitions: competitions ?? [],
    },
    x: startX,
    y: mainTop,
    showCompetitions: true,
    includePhoto: true,
    mainPigeon: true,
    heightOverride: mainBoxHeight,
  });

  // Parents
  const parentX = startX + boxWidth + horizontalSpacing;
  const parentHeight = boxHeight * 1.1;

  if (tree.father) {
    const fatherTop = mainTop + mainBoxHeight / 2 - parentHeight;
    positions.push({ node: tree.father, x: parentX, y: fatherTop, showCompetitions: true, heightOverride: parentHeight });

    if (tree.father.father && tree.father.mother) {
      const gpHeight = parentHeight / 2 - verticalSpacing / 2;
      const grandX = parentX + boxWidth + horizontalSpacing;
      positions.push({ node: tree.father.father, x: grandX, y: fatherTop, showCompetitions: true, heightOverride: gpHeight });
      positions.push({ node: tree.father.mother, x: grandX, y: fatherTop + gpHeight + verticalSpacing, showCompetitions: true, heightOverride: gpHeight });
    }
  }

  if (tree.mother) {
    const motherTop = mainTop + mainBoxHeight / 2 + verticalSpacing;
    positions.push({ node: tree.mother, x: parentX, y: motherTop, showCompetitions: true, heightOverride: parentHeight });

    if (tree.mother.father && tree.mother.mother) {
      const gpHeight = parentHeight / 2 - verticalSpacing / 2;
      const grandX = parentX + boxWidth + horizontalSpacing;
      positions.push({ node: tree.mother.father, x: grandX, y: motherTop, showCompetitions: true, heightOverride: gpHeight });
      positions.push({ node: tree.mother.mother, x: grandX, y: motherTop + gpHeight + verticalSpacing, showCompetitions: true, heightOverride: gpHeight });
    }
  }

  return (
    <div
      ref={treeRef}
      style={{
        width: pageWidth,
        height: pageHeight,
        position: "relative",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        margin: "0 auto",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Owner + QR */}
      {owner && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#E5E7EB",
            padding: 10,
            borderRadius: 6,
            boxSizing: "border-box",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 600 }}>{owner.firstName} {owner.lastName}</div>
            {owner.phoneNumber && <div style={{ fontSize: 12 }}>Phone: {owner.phoneNumber}</div>}
            <div style={{ fontSize: 12 }}>Email: {owner.email}</div>
            {owner.address && <div style={{ fontSize: 12 }}>Address: {owner.address}</div>}
          </div>
          {pigeon.id && <QRCodeCanvas value={`${window.location.origin}/public/pigeons/${pigeon.id}`} size={80} />}
        </div>
      )}

      {/* Boxes */}
      {positions.map((p, idx) => (
        <div key={idx} style={{ position: "absolute", top: p.y, left: p.x }}>
          {renderBox(p.node, p.showCompetitions, p.includePhoto, p.mainPigeon, p.heightOverride)}
        </div>
      ))}

      {/* Footer logo */}
      {logoUrl && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
          <img src={logoUrl} alt="Loft Logo" style={{ height: 60 }} />
        </div>
      )}
    </div>
  );
};
