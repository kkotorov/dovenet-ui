import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserIcon, MailIcon, LockIcon, ChevronLeft } from "lucide-react";
import api from "../api/api";
import toast, { Toaster } from "react-hot-toast";

export default function UserSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<{ username: string; email: string; emailVerified: boolean }>({
    username: "",
    email: "",
    emailVerified: false,
  });

  const [tab, setTab] = useState<"profile" | "preferences">("profile");

  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch {
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleSendVerificationEmail = async () => {
    try {
      const res = await api.get("/users/trigger-verify");
      toast.success(res.data?.message || t("verificationEmailSent"));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("settingsFailed"));
    }
  };

  const handleEmailUpdate = async () => {
    if (newEmail !== confirmEmail) return toast.error(t("emailsDoNotMatch"));
    if (!currentPasswordForEmail) return toast.error(t("enterCurrentPassword"));

    try {
      await api.patch("/users/me/change-email", { newEmail, password: currentPasswordForEmail });
      toast.success(t("emailUpdated"));
      setUser((prev) => ({ ...prev, email: newEmail, emailVerified: false }));
      setNewEmail("");
      setConfirmEmail("");
      setCurrentPasswordForEmail("");
      setShowEmailEdit(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("settingsFailed"));
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) return toast.error(t("passwordsDoNotMatch"));
    if (!oldPassword) return toast.error(t("enterCurrentPassword"));

    try {
      await api.patch("/users/me/change-password", { oldPassword, newPassword });
      toast.success(t("passwordUpdated"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordEdit(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("settingsFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-6 flex flex-col items-center relative">
      <Toaster position="top-right" />

      {/* Container for cards + back button */}
      <div className="relative w-full max-w-3xl flex flex-col items-center">
        {/* Back button aligned with card right edge */}
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute -top-14 right-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition transform"
        >
          <ChevronLeft className="w-4 h-4" /> {t("backToDashboard")}
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md w-full p-6 flex items-center justify-between mb-4 animate-fadeInUp">
          <div className="flex items-center gap-4">
            <UserIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="font-semibold text-lg">{user.username}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Verified badge */}
          <button
            onClick={!user.emailVerified ? handleSendVerificationEmail : undefined}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition 
              ${user.emailVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}`}
          >
            {user.emailVerified ? t("verified") : t("notVerified")}
          </button>
        </div>

        {/* Tabs */}
        <div className="w-full mb-6 flex border-b border-gray-200">
          {["profile", "preferences"].map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb as typeof tab)}
              className={`px-4 py-2 -mb-px font-medium transition ${
                tab === tb ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              {t(tb)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="w-full space-y-6 mt-4">
          {tab === "profile" && (
            <div className="grid gap-4">
              {/* Change Email Card */}
              <div
                className="bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition animate-fadeInUp"
                onClick={() => setShowEmailEdit(!showEmailEdit)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold">{t("changeEmail")}</h3>
                  </div>
                </div>

                {showEmailEdit && (
                  <div className="flex flex-col md:flex-row gap-3 mt-2">
                    <input
                      type="email"
                      placeholder={t("newEmail")}
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <input
                      type="email"
                      placeholder={t("confirmEmail")}
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <input
                      type="password"
                      placeholder={t("currentPassword")}
                      value={currentPasswordForEmail}
                      onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button
                      onClick={handleEmailUpdate}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      {t("saveEmail")}
                    </button>
                  </div>
                )}
              </div>

              {/* Change Password Card */}
              <div
                className="bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition animate-fadeInUp"
                onClick={() => setShowPasswordEdit(!showPasswordEdit)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <LockIcon className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold">{t("changePassword")}</h3>
                  </div>
                </div>

                {showPasswordEdit && (
                  <div className="flex flex-col md:flex-row gap-3 mt-2">
                    <input
                      type="password"
                      placeholder={t("currentPassword")}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <input
                      type="password"
                      placeholder={t("newPassword")}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <input
                      type="password"
                      placeholder={t("confirmPassword")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button
                      onClick={handlePasswordUpdate}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      {t("savePassword")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "preferences" && (
            <div className="bg-white p-6 rounded-2xl shadow-md animate-fadeInUp">
              <label className="block mb-2 font-semibold">{t("language")}</label>
              <select
                value={localStorage.getItem("lang") || "en"}
                onChange={(e) => {
                  localStorage.setItem("lang", e.target.value);
                  window.location.reload();
                }}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="en">English</option>
                <option value="bg">Български</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease forwards;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

