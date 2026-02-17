import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerUser } from "../../api/auth";
import { useUser } from "../../components/utilities/UserContext";
import ReactGA from "react-ga4";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import type {CredentialResponse} from "@react-oauth/google";
import axios from "axios";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError(t("registerPage.passwordsMismatch"));
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError(t("registerPage.mustAcceptTerms"));
      setLoading(false);
      return;
    }

    try {
      await registerUser(username, email, password);
      ReactGA.event({
        category: "Growth",
        action: "Sign Up Success"
      });
      setShowDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t("registerPage.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const { credential } = credentialResponse;
      // Send the Google token to the backend
      const response = await axios.post("http://localhost:8080/api/auth/google", { token: credential });
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      ReactGA.event({
        category: "Growth",
        action: "Sign Up Success (Google)"
      });

      await refreshUser();
      // Navigate directly to dashboard as Google Auth logs the user in
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Google Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Title */}
        <h1 className="text-3xl font-bold text-indigo-600 text-center mb-4">
          {t("registerPage.title")}
        </h1>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder={t("registerPage.username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="email"
            placeholder={t("registerPage.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder={t("registerPage.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder={t("registerPage.confirmPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <div className="flex items-start gap-2 px-1">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-gray-500 cursor-pointer">
              {t("registerPage.agreeTo")}{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                {t("registerPage.terms")}
              </a>{" "}
              {t("registerPage.and")}{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                {t("registerPage.privacy")}
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
          >
            {loading ? t("registerPage.registering") : t("registerPage.register")}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google Registration Failed")} />
          </GoogleOAuthProvider>
        </div>

        {/* Back to login */}
        <button
          onClick={() => navigate("/login")}
          className="mt-4 w-full text-indigo-600 hover:underline font-medium"
        >
          {t("registerPage.alreadyHaveAccount")}
        </button>
      </div>

      {/* Success Dialog */}
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <h2 className="text-xl font-bold mb-2">{t("registerPage.dialogTitle")}</h2>
            <p className="text-gray-600 mb-4">{t("registerPage.dialogContent")}</p>
            <button
              onClick={handleDialogClose}
              className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
            >
              {t("registerPage.dialogOk")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
