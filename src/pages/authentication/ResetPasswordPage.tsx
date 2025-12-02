import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api/api";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extract token from URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError(t("resetPasswordPage.passwordsMismatch"));
      return;
    }

    if (!token) {
      setError(t("resetPasswordPage.invalidToken"));
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/users/reset-password", {
        token,
        newPassword: password,
      });

      setMessage(
        res.data?.message || t("resetPasswordPage.successMessage")
      );

      // Automatically navigate to login after short delay
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("resetPasswordPage.errorMessage")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Title */}
        <h1 className="text-3xl font-bold text-indigo-600 text-center mb-2">
          {t("resetPasswordPage.title")}
        </h1>
        <p className="text-gray-500 text-center mb-6">
          {t("resetPasswordPage.subtitle")}
        </p>

        {/* Messages */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder={t("resetPasswordPage.newPasswordLabel")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder={t("resetPasswordPage.confirmPasswordLabel")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
          >
            {loading
              ? t("resetPasswordPage.resettingButton")
              : t("resetPasswordPage.resetButton")}
          </button>
        </form>

        {/* Back to Login */}
        <button
          onClick={() => navigate("/login")}
          className="mt-4 w-full text-indigo-600 hover:underline font-medium"
        >
          {t("resetPasswordPage.backToLogin")}
        </button>
      </div>
    </div>
  );
}
