import React, { useEffect, useState, useRef } from "react";
import api from "../../api/api";
import type { Pigeon, CompetitionEntry } from "../../types";
import { useTranslation } from "react-i18next";
import type { AppUser } from "../utilities/UserContext";
import { QRCodeCanvas } from "qrcode.react";
import "./PedigreeTree.css";

interface PedigreeTreeProps {
  pigeon: Pigeon;
  generations?: number;
  competitions?: CompetitionEntry[];
  owner?: AppUser;
  logoUrl?: string;
}

interface TreeNode extends Pigeon {
  father?: TreeNode;
  mother?: TreeNode;
  competitions?: CompetitionEntry[];
}

export const PedigreeTree: React.FC<PedigreeTreeProps> = ({
  pigeon,
  competitions,
  generations = 3, // Default to 3 generations for a standard pedigree view
  owner,
  logoUrl,
}) => {
  const { t } = useTranslation();
  const [tree, setTree] = useState<TreeNode | null>(null);

  useEffect(() => {
    let cancelled = false;

    const normalize = (r?: string) => (r ? r.trim().toUpperCase() : undefined);

    const fetchParentByRing = async (ringNumber?: string) => {
      const rn = normalize(ringNumber);
      if (!rn) return undefined;
      try {
        const res = await api.get<Pigeon[]>(`/pigeons?ringNumber=${encodeURIComponent(rn)}`);
        return res.data.find((p) => normalize(p.ringNumber) === rn);
      } catch {
        return undefined;
      }
    };

    const buildTree = async (p: Pigeon | undefined, level: number, seen = new Set<string>()): Promise<TreeNode | undefined> => {
      if (!p || level <= 0) return p ? { ...p } : undefined;
      
      const key = normalize(p.ringNumber);
      if (key && seen.has(key)) return { ...p };
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
      const built = await buildTree(pigeon, generations);
      if (!cancelled) setTree(built ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, [pigeon, generations]);
  
  const genderClass = (gender?: string) => {
    if (!gender) return "pigeon-gender-unknown";
    const lower = gender.toLowerCase();
    if (lower === "male") return "pigeon-gender-male";
    if (lower === "female") return "pigeon-gender-female";
    return "pigeon-gender-unknown";
  };
  
  const genderSymbol = (gender?: string) => {
    if (!gender) return "";
    const lower = gender.toLowerCase();
    if (lower === "male") return "♂";
    if (lower === "female") return "♀";
    return "";
  }

  const renderCompetitions = (comps?: CompetitionEntry[]) => {
    if (!comps || comps.length === 0) return null;
    return (
      <table className="pigeon-competitions">
        <tbody>
          {comps.slice(0, 3).map((c) => ( // Limit to 3 competitions for space
            <tr key={c.id}>
              <td>{c.competition?.name || "-"}</td>
              <td style={{ textAlign: "right" }}>{c.place ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderPigeonBox = (node?: TreeNode, isMain: boolean = false) => {
    if (!node) {
      // Render a placeholder box
      return <div className="pedigree-pigeon placeholder" />;
    }

    const birthDate = node.birthDate ? new Date(node.birthDate) : null;
    const monthYear = birthDate ? birthDate.toLocaleString("default", { month: "short", year: "numeric" }) : null;

    return (
      <div className={`pedigree-pigeon ${isMain ? "main-pigeon" : ""}`}>
        <div className="pigeon-header">
          <span className={`pigeon-ring ${genderClass(node.gender)}`}>{node.ringNumber || "-"}</span>
          {node.name && <span className="pigeon-name">{node.name}</span>}
          <span className={`pigeon-gender ${genderClass(node.gender)}`}>{genderSymbol(node.gender)}</span>
        </div>
        <div className="pigeon-details-row">
          {monthYear && <span>{monthYear}</span>}
          {monthYear && node.color && <span> - </span>}
          {node.color && <span>{node.color}</span>}
        </div>
        {isMain && renderCompetitions(competitions)}
      </div>
    );
  };

  const renderTree = (root: TreeNode) => {
    // Generation 1
    const G1 = root;
    // Generation 2
    const G2_father = G1?.father;
    const G2_mother = G1?.mother;
    // Generation 3
    const G3_ff = G2_father?.father;
    const G3_fm = G2_father?.mother;
    const G3_mf = G2_mother?.father;
    const G3_mm = G2_mother?.mother;

    return (
      <div className="pedigree-tree">
        {/* Gen 1 */}
        <div className="pedigree-generation g1">
          {renderPigeonBox(G1, true)}
        </div>
        {/* Gen 2 */}
        <div className="pedigree-generation g2">
          {renderPigeonBox(G2_father)}
          {renderPigeonBox(G2_mother)}
        </div>
        {/* Gen 3 */}
        <div className="pedigree-generation g3">
          {renderPigeonBox(G3_ff)}
          {renderPigeonBox(G3_fm)}
          {renderPigeonBox(G3_mf)}
          {renderPigeonBox(G3_mm)}
        </div>
      </div>
    );
  };


  if (!tree) return <div>Loading pedigree...</div>;

  return (
    <div className="pedigree-container">
      {owner && (
        <div className="pedigree-header">
          <div className="pedigree-owner-info">
            <div className="owner-name">{owner.firstName} {owner.lastName}</div>
            {owner.phoneNumber && <div>Phone: {owner.phoneNumber}</div>}
            <div>Email: {owner.email}</div>
            {owner.address && <div>Address: {owner.address}</div>}
          </div>
          {pigeon.id && <QRCodeCanvas value={`${window.location.origin}/public/pigeons/${pigeon.id}`} size={80} />}
        </div>
      )}

      {renderTree(tree)}

      {logoUrl && (
        <div className="pedigree-footer">
          <img src={logoUrl} alt="Loft Logo" />
        </div>
      )}
    </div>
  );
};
