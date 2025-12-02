import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api/api";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!token) {
      setError(t("verifyEmailPage.invalidLink"));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.get(`/users/verify?token=${token}`);
      setSuccess(res.data?.message || t("verifyEmailPage.successMessage"));
    } catch (err: any) {
      setError(err.response?.data?.message || t("verifyEmailPage.errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">

        {/* Title */}
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">
          {t("verifyEmailPage.title")}
        </h1>

        {/* Messages */}
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        {!success && (
          <button
            onClick={handleVerify}
            disabled={loading}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {t("verifyEmailPage.verifyButton")}
          </button>
        )}
        {success && (
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
          >
            {t("verifyEmailPage.goToLogin")}
          </button>
        )}
      </div>
    </div>
  );
}
