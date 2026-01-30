import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
}

export default function BackButton({ onClick, label, className = "" }: BackButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = onClick || (() => navigate(-1));
  const text = label || t("pigeonPage.back");

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="font-medium">{text}</span>
    </button>
  );
}