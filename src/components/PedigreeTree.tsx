import React, { useEffect, useState } from "react";
import api from "../api/api";
import type { Pigeon } from "../types";
import { useTranslation } from "react-i18next";

interface PedigreeTreeProps {
  pigeon: Pigeon;
  generations: number;
  boxWidth?: number;
  boxHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
}

interface TreeNode extends Pigeon {
  father?: TreeNode;
  mother?: TreeNode;
}

export const PedigreeTree: React.FC<PedigreeTreeProps> = ({
  pigeon,
  generations,
  boxWidth = 140,
  boxHeight = 60,
  horizontalSpacing = 50,
  verticalSpacing = 20,
}) => {
  const { t } = useTranslation();
  const [tree, setTree] = useState<TreeNode | null>(null);

  useEffect(() => {
    let cancelled = false;

    // normalize ring numbers for robust matching
    const normalize = (r?: string) => (r ? r.trim().toUpperCase() : r);

    // fetch by ringNumber but perform exact match among returned results
    const fetchParentByRing = async (ringNumber?: string) => {
      if (!ringNumber) return undefined;
      const rn = normalize(ringNumber) as string;
      try {
        const res = await api.get<Pigeon[]>(`/pigeons?ringNumber=${encodeURIComponent(rn)}`);
        if (!Array.isArray(res.data) || res.data.length === 0) return undefined;
        // exact match in returned array
        const exact = res.data.find((p) => p.ringNumber && p.ringNumber.trim().toUpperCase() === rn);
        return exact || undefined;
      } catch (err) {
        // swallow network errors for pedigree building
        return undefined;
      }
    };

    // build tree recursively; avoid repeated nodes via seen set to prevent cycles
    const buildTree = async (p: Pigeon | undefined, level: number, seen = new Set<string | number>()) : Promise<TreeNode | undefined> => {
      if (!p || level <= 0) return p ? ({ ...p } as TreeNode) : undefined;

      // protect from cycles: use id if present else ringNumber
      const key = p.id ?? p.ringNumber;
      if (key && seen.has(key)) return { ...p } as TreeNode;
      if (key) seen.add(key);

      const node: TreeNode = { ...p };

      // If the pigeon object already contains father/mother nested objects (pre-resolved),
      // use them directly. This allows PigeonPage to pass a pigeon that already has parents.
      // (Your Pigeon type currently doesn't have father/mother fields, but this is defensive.)
      const hasFatherObj = (p as any).father && typeof (p as any).father === "object";
      const hasMotherObj = (p as any).mother && typeof (p as any).mother === "object";

      const fatherPromise = (async () => {
        if (hasFatherObj) return (p as any).father as Pigeon;
        // try to use fatherRingNumber if present
        return await fetchParentByRing(p.fatherRingNumber);
      })();

      const motherPromise = (async () => {
        if (hasMotherObj) return (p as any).mother as Pigeon;
        return await fetchParentByRing(p.motherRingNumber);
      })();

      const [father, mother] = await Promise.all([fatherPromise, motherPromise]);

      if (father) node.father = await buildTree(father, level - 1, new Set(seen));
      if (mother) node.mother = await buildTree(mother, level - 1, new Set(seen));

      return node;
    };

    // Kick off
    (async () => {
      try {
        const built = await buildTree(pigeon, generations);
        if (!cancelled) setTree(built ?? null);
      } catch (err) {
        console.error("Pedigree build error", err);
        if (!cancelled) setTree(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pigeon, generations]);

  if (!tree) return <div>Loading pedigree...</div>;

  // Left-to-right tree rendering (unchanged layout logic)
  const renderTreeLR = (node: TreeNode | undefined) => {
    if (!node) return <div style={{ width: boxWidth, height: boxHeight }} />;

    const fatherElem = renderTreeLR(node.father);
    const motherElem = renderTreeLR(node.mother);

    return (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: horizontalSpacing }}>
        {/* Child Box */}
        <div
          style={{
            width: boxWidth,
            height: boxHeight,
            border: "2px solid #4B5563",
            borderRadius: 8,
            backgroundColor: "#F3F4F6",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: 4,
          }}
        >
          <div style={{ fontWeight: 600 }}>{node.name || t("pigeonPage.notInDatabase")}</div>
          <div style={{ fontSize: 12 }}>{node.ringNumber}</div>
          <div
            style={{
              fontSize: 12,
              color: node.gender?.toLowerCase() === "male" ? "#3B82F6" : "#EC4899",
            }}
          >
            {node.gender?.toLowerCase() === "male" ? "♂" : node.gender?.toLowerCase() === "female" ? "♀" : ""}
          </div>
        </div>

        {/* Parents Stack */}
        {(node.father || node.mother) && (
          <div style={{ display: "flex", flexDirection: "column", gap: verticalSpacing }}>
            {fatherElem}
            {motherElem}
          </div>
        )}
      </div>
    );
  };

  return <div style={{ display: "flex", justifyContent: "flex-start" }}>{renderTreeLR(tree)}</div>;
};
