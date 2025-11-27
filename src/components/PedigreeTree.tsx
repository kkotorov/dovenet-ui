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
    const buildTree = async (p: Pigeon, level: number): Promise<TreeNode> => {
      if (!p || level <= 0) return p;

      const node: TreeNode = { ...p };

      const fetchParent = async (ringNumber: string | undefined) => {
        if (!ringNumber) return undefined;
        try {
          const res = await api.get<Pigeon[]>(`/pigeons?ringNumber=${ringNumber}`);
          return res.data[0];
        } catch {
          return undefined;
        }
      };

      const [father, mother] = await Promise.all([
        fetchParent(p.fatherRingNumber),
        fetchParent(p.motherRingNumber),
      ]);

      if (father) node.father = await buildTree(father, level - 1);
      if (mother) node.mother = await buildTree(mother, level - 1);

      return node;
    };

    buildTree(pigeon, generations).then(setTree);
  }, [pigeon, generations]);

  if (!tree) return <div>Loading pedigree...</div>;

  // Left-to-right tree
  const renderTreeLR = (node: TreeNode | undefined): JSX.Element => {
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
