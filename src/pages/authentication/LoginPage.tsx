import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginUser } from "../../api/auth";
import { useUser } from "../../components/utilities/UserContext";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      await refreshUser();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || t("loginPage.errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        
        <h1 className="text-3xl font-bold text-indigo-600 text-center mb-2">
          {t("loginPage.title")}
        </h1>
        <p className="text-gray-500 text-center mb-6">
          {t("loginPage.description")}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder={t("loginPage.emailLabel")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="password"
            placeholder={t("loginPage.passwordLabel")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
          >
            {loading ? t("loginPage.loggingInButton") : t("loginPage.loginButton")}
          </button>
        </form>

        <div className="flex flex-col gap-2 mt-4 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-indigo-600 hover:underline font-medium"
          >
            {t("loginPage.registerLink")}
          </button>

          <button
            onClick={() => navigate("/forgot-password")}
            className="text-gray-600 hover:underline font-medium"
          >
            {t("loginPage.forgotPasswordLink")}
          </button>
        </div>
      </div>
    </div>
  );
}
