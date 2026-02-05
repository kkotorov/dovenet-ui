import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "../api/api";
import Button from "../components/utilities/Button";

export default function ConfirmEmailChangePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("confirmEmailChange.invalidToken"));
      return;
    }

    const verifyToken = async () => {
      try {
        await api.get(`/users/finalize-email-change?token=${token}`);
        setStatus("success");
        setMessage(t("confirmEmailChange.successMessage"));
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data || t("confirmEmailChange.errorMessage"));
      }
    };

    verifyToken();
  }, [token, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-800">{t("confirmEmailChange.verifying")}</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t("confirmEmailChange.titleSuccess")}</h2>
            <p className="text-gray-600">{message}</p>
            <Button onClick={() => navigate("/login")} className="mt-4 w-full">
              {t("confirmEmailChange.goToLogin")}
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t("confirmEmailChange.titleError")}</h2>
            <p className="text-gray-600">{message}</p>
            <Button onClick={() => navigate("/")} variant="secondary" className="mt-4 w-full">
              {t("confirmEmailChange.backHome")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}