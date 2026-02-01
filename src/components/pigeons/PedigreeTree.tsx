import React, { useEffect, useState } from "react";
import api from "../../api/api";
import type { Pigeon, CompetitionEntry } from "../../types";
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
  customCompetitions?: { id: string | number; text: string }[];
}

export const PedigreeTree: React.FC<PedigreeTreeProps> = ({
  pigeon,
  competitions,
  generations = 4, // Default to 4 generations for a standard pedigree view
  owner,
  logoUrl,
}) => {
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

      // Fetch competitions for parents (Gen 2) and grandparents (Gen 3)
      if (p.id) {
        let limit = 0;
        if (level === generations - 1) limit = 6; // Gen 2 (Parents)
        else if (level === generations - 2) limit = 3; // Gen 3 (Grandparents)

        if (limit > 0) {
        try {
          const res = await api.get<CompetitionEntry[]>(`/pigeons/${p.id}/competitions`);
          const comps = res.data || [];
          node.customCompetitions = comps.slice(0, limit).map((c) => {
            const parts = [];
            if (c.competition?.name) parts.push(c.competition.name);
            if (c.place !== undefined && c.place !== null) parts.push(`${c.place}`);
            return {
              id: c.id || Math.random(),
              text: parts.join(" - "),
            };
          });
        } catch (e) { /* ignore */ }
        }
      }
      
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
      if (!cancelled && built) {
        // Initialize root competitions from prop
        built.customCompetitions = (competitions || []).map((c) => {
          const parts = [];
          if (c.competition?.name) parts.push(c.competition.name);
          if (c.place !== undefined && c.place !== null) parts.push(`${c.place}`);
          return {
            id: c.id || Math.random(),
            text: parts.join(" - "),
          };
        });
        setTree(built);
      } else if (!cancelled) setTree(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [pigeon, generations]);
  
  // Sync competitions prop to root node when it changes (e.g. checkboxes)
  useEffect(() => {
    setTree((prev) => {
      if (!prev) return null;
      const newTree = { ...prev };
      newTree.customCompetitions = (competitions || []).map((c) => {
          const parts = [];
          if (c.competition?.name) parts.push(c.competition.name);
          if (c.place !== undefined && c.place !== null) parts.push(`${c.place}`);
          return {
            id: c.id || Math.random(),
            text: parts.join(" - "),
          };
      });
      return newTree;
    });
  }, [competitions]);

  const getPath = (genIndex: number, nodeIndex: number) => {
    const path: ('father' | 'mother')[] = [];
    let currIdx = nodeIndex;
    for (let g = genIndex; g > 0; g--) {
      path.unshift(currIdx % 2 === 0 ? 'father' : 'mother');
      currIdx = Math.floor(currIdx / 2);
    }
    return path;
  };

  const getOrCreateNode = (root: TreeNode, path: ('father' | 'mother')[]) => {
    let curr = root;
    for (const dir of path) {
      if (!curr[dir]) curr[dir] = { ringNumber: "", name: "", gender: "" } as TreeNode;
      curr = curr[dir]!;
    }
    return curr;
  };

  const handleCompetitionChange = (genIndex: number, nodeIndex: number, compIndex: number, value: string) => {
    if (!tree) return;
    const newTree = JSON.parse(JSON.stringify(tree));
    const node = getOrCreateNode(newTree, getPath(genIndex, nodeIndex));
    
    if (node.customCompetitions && node.customCompetitions[compIndex]) {
        node.customCompetitions[compIndex].text = value;
    }
    setTree(newTree);
  };

  const addCompetitionRow = (genIndex: number, nodeIndex: number) => {
    if (!tree) return;
    const newTree = JSON.parse(JSON.stringify(tree));
    const node = getOrCreateNode(newTree, getPath(genIndex, nodeIndex));
    
    if (!node.customCompetitions) node.customCompetitions = [];
    node.customCompetitions.push({ id: Math.random(), text: "" });
    setTree(newTree);
  };

  const removeCompetitionRow = (genIndex: number, nodeIndex: number, compIndex: number) => {
    if (!tree) return;
    const newTree = JSON.parse(JSON.stringify(tree));
    const node = getOrCreateNode(newTree, getPath(genIndex, nodeIndex));
    
    if (node.customCompetitions) {
      node.customCompetitions = node.customCompetitions.filter((_, i) => i !== compIndex);
    }
    setTree(newTree);
  };

  const handleNodeChange = (genIndex: number, nodeIndex: number, field: keyof Pigeon, value: string) => {
    if (!tree) return;

    // Deep clone tree to avoid mutation
    const newTree = JSON.parse(JSON.stringify(tree));

    const path = getPath(genIndex, nodeIndex);
    const curr = getOrCreateNode(newTree, path);

    (curr as any)[field] = value;
    setTree(newTree);
  };

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

  const renderCompetitions = (node: TreeNode | undefined, genIndex: number, nodeIndex: number) => {
    const compRows = node?.customCompetitions || [];
    return (
      <div className="w-full text-xs mt-1 px-1">
        <table className="w-full border-collapse">
          <tbody>
            {compRows.map((row, idx) => (
              <tr key={row.id}>
                <td className="p-0 align-middle">
                  <input
                    type="text"
                    value={row.text}
                    onChange={(e) => handleCompetitionChange(genIndex, nodeIndex, idx, e.target.value)}
                    className="w-full bg-transparent outline-none px-1 py-0.5 text-xs text-gray-800 placeholder-gray-400"
                    placeholder="Competition details..."
                  />
                </td>
                <td className="p-0 w-4 text-center align-middle" data-html2canvas-ignore="true">
                   <button onClick={() => removeCompetitionRow(genIndex, nodeIndex, idx)} className="text-red-400 hover:text-red-600 font-bold leading-none">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={() => addCompetitionRow(genIndex, nodeIndex)}
          className="mt-1 text-[10px] text-blue-600 hover:underline w-full text-center block"
          data-html2canvas-ignore="true"
        >
          + Add Row
        </button>
      </div>
    );
  };

  const renderPigeonBox = (node: TreeNode | undefined, isMain: boolean, nodeIndex: number, genIndex: number) => {
    const birthDate = node?.birthDate ? new Date(node.birthDate) : null;
    const monthYear = birthDate ? birthDate.toLocaleString("default", { month: "short", year: "numeric" }) : null;

    let displayGender = node?.gender;
    if (genIndex > 0) {
      displayGender = nodeIndex % 2 === 0 ? "male" : "female";
    }

    return (
      <div key={nodeIndex} className={`pedigree-pigeon ${isMain ? "main-pigeon" : ""}`}>
        <div className="pigeon-header">
          <input
            className={`pigeon-ring ${genderClass(displayGender)}`}
            value={node?.ringNumber || ""}
            onChange={(e) => handleNodeChange(genIndex, nodeIndex, "ringNumber", e.target.value)}
            placeholder="Ring"
            style={{ background: "transparent", border: "none", width: "100%", textAlign: "center", fontWeight: "bold" }}
          />
          
          <input
            className="pigeon-name"
            value={node?.name || ""}
            onChange={(e) => handleNodeChange(genIndex, nodeIndex, "name", e.target.value)}
            placeholder="Name"
            style={{ background: "transparent", border: "none", width: "100%", textAlign: "center", fontSize: "0.9em" }}
          />

          <span
            className={`pigeon-gender ${genderClass(displayGender)}`}
            style={{ fontWeight: "bold", textAlign: "center", width: "20px", display: "inline-block" }}
          >
             {genderSymbol(displayGender)}
          </span>
        </div>
        <div className="pigeon-details-row">
          {monthYear && <span>{monthYear}</span>}
          {monthYear && node?.color && <span> - </span>}
          {node?.color && <span>{node.color}</span>}
        </div>
        {genIndex < 3 && renderCompetitions(node, genIndex, nodeIndex)}
      </div>
    );
  };

  const renderTree = (root: TreeNode) => {
    const generationsList: (TreeNode | undefined)[][] = [];
    let currentGen: (TreeNode | undefined)[] = [root];

    for (let i = 0; i < generations; i++) {
      generationsList.push(currentGen);
      if (i < generations - 1) {
        const nextGen: (TreeNode | undefined)[] = [];
        currentGen.forEach((node) => {
          nextGen.push(node?.father);
          nextGen.push(node?.mother);
        });
        currentGen = nextGen;
      }
    }

    return (
      <div className={`pedigree-tree gens-${generations}`}>
        {generationsList.map((nodes, genIndex) => (
          <div key={genIndex} className={`pedigree-generation g${genIndex + 1}`}>
            {nodes.map((node, nodeIndex) => (
              renderPigeonBox(node, genIndex === 0, nodeIndex, genIndex)
            ))}
          </div>
        ))}
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
