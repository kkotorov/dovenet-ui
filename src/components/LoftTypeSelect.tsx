import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { LoftType } from "../types/index";

interface LoftTypeOption {
  value: LoftType;
  labelKey: string;
}

interface LoftTypeGroup {
  label: string;
  options: LoftTypeOption[];
}

const loftTypeGroups: LoftTypeGroup[] = [
  {
    label: "Racing & Training",
    options: [
      { value: "racing", labelKey: "loftTypes.racing" },
      { value: "training", labelKey: "loftTypes.training" },
    ],
  },
  {
    label: "Breeding & Parent",
    options: [
      { value: "breeding", labelKey: "loftTypes.breeding" },
      { value: "parent", labelKey: "loftTypes.parent" },
    ],
  },
  {
    label: "Other",
    options: [
      { value: "young", labelKey: "loftTypes.young" },
      { value: "show", labelKey: "loftTypes.show" },
      { value: "quarantine", labelKey: "loftTypes.quarantine" },
      { value: "general", labelKey: "loftTypes.general" },
    ],
  },
];

interface LoftTypeSelectProps {
  value: LoftType;
  onChange: (val: LoftType) => void;
}

export default function LoftTypeSelect({ value, onChange }: LoftTypeSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        className="w-full px-3 py-2 border rounded-lg bg-white flex justify-between items-center focus:ring-2 focus:ring-indigo-500"
        onClick={() => setOpen(!open)}
      >
        {t(`loftTypes.${value}`)}
        <span className="ml-2">▾</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loftTypeGroups.map((group) => (
            <div key={group.label} className="px-2 py-1">
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">{group.label}</div>
              {group.options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer px-2 py-1 rounded flex items-center gap-2 hover:bg-gray-100"
                >
                  {t(option.labelKey)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
    
