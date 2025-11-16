import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserIcon, MailIcon, LockIcon, ChevronLeft, CreditCardIcon, Trash2 } from "lucide-react";
import api from "../api/api";
import toast, { Toaster } from "react-hot-toast";

export default function UserSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"profile" | "subscriptions">("profile");

  const [user, setUser] = useState<{ username: string; email: string; emailVerified: boolean }>({
    username: "",
    email: "",
    emailVerified: false,
  });

  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPlan, setShowCurrentPlan] = useState(false);
  const [showChoosePlan, setShowChoosePlan] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showCancelSubscription, setShowCancelSubscription] = useState(false);

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
      toast.success(res.data?.message || t("userSettingsPage.verificationEmailSent"));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("userSettingsPage.settingsFailed"));
    }
  };

  const handleEmailUpdate = async () => {
    if (newEmail !== confirmEmail) return toast.error(t("userSettingsPage.emailsDoNotMatch"));
    if (!currentPasswordForEmail) return toast.error(t("userSettingsPage.enterCurrentPassword"));

    try {
      await api.patch("/users/me/change-email", { newEmail, password: currentPasswordForEmail });
      toast.success(t("userSettingsPage.emailUpdated"));
      setUser((prev) => ({ ...prev, email: newEmail, emailVerified: false }));
      setNewEmail("");
      setConfirmEmail("");
      setCurrentPasswordForEmail("");
      setShowEmailEdit(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("userSettingsPage.settingsFailed"));
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) return toast.error(t("userSettingsPage.passwordsDoNotMatch"));
    if (!oldPassword) return toast.error(t("userSettingsPage.enterCurrentPassword"));

    try {
      await api.patch("/users/me/change-password", { oldPassword, newPassword });
      toast.success(t("userSettingsPage.passwordUpdated"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordEdit(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("userSettingsPage.settingsFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-6 pt-6 flex flex-col items-center relative">
      <Toaster position="top-right" />

      <div className="w-full max-w-3xl flex flex-col items-center gap-4 mt-4">
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="self-end flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition transform mt-2"
        >
          <ChevronLeft className="w-4 h-4" /> {t("userSettingsPage.backToDashboard")}
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md w-full p-6 flex items-center justify-between mb-6 animate-fadeInUp">
          <div className="flex items-center gap-4">
            <UserIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="font-semibold text-lg">{user.username}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>

          <button
            onClick={!user.emailVerified ? handleSendVerificationEmail : undefined}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition 
              ${user.emailVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}`}
          >
            {user.emailVerified ? t("userSettingsPage.verified") : t("userSettingsPage.notVerified")}
          </button>
        </div>

        {/* Tabs */}
        <div className="w-full flex gap-4 mt-4">
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 shadow"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            {t("userSettingsPage.profile")}
          </button>

          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "subscriptions"
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 shadow"
            }`}
            onClick={() => setActiveTab("subscriptions")}
          >
            {t("userSettingsPage.subscriptions")}
          </button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="w-full grid gap-4 animate-fadeInUp mt-4">
            {/* Change Email Card */}
            <div className="bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition">
              <div className="flex items-center gap-2 mb-2" onClick={() => setShowEmailEdit(!showEmailEdit)}>
                <MailIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold">{t("userSettingsPage.changeEmail")}</h3>
              </div>

              {showEmailEdit && (
                <div className="flex flex-col md:flex-row gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="email"
                    placeholder={t("userSettingsPage.newEmail")}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <input
                    type="email"
                    placeholder={t("userSettingsPage.confirmEmail")}
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <input
                    type="password"
                    placeholder={t("userSettingsPage.currentPassword")}
                    value={currentPasswordForEmail}
                    onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button
                    onClick={handleEmailUpdate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    {t("userSettingsPage.saveEmail")}
                  </button>
                </div>
              )}
            </div>

            {/* Change Password Card */}
            <div className="bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition">
              <div className="flex items-center gap-2 mb-2" onClick={() => setShowPasswordEdit(!showPasswordEdit)}>
                <LockIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold">{t("userSettingsPage.changePassword")}</h3>
              </div>

              {showPasswordEdit && (
                <div className="flex flex-col md:flex-row gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="password"
                    placeholder={t("userSettingsPage.currentPassword")}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <input
                    type="password"
                    placeholder={t("userSettingsPage.newPassword")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <input
                    type="password"
                    placeholder={t("userSettingsPage.confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button
                    onClick={handlePasswordUpdate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    {t("userSettingsPage.savePassword")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === "subscriptions" && (
          <div className="w-full grid gap-4 animate-fadeInUp mt-4">
            {/* Current Plan */}
            <div className="bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition">
              <div className="flex items-center gap-2 mb-2" onClick={() => setShowCurrentPlan(!showCurrentPlan)}>
                <UserIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold">{t("userSettingsPage.currentPlan")}</h3>
              </div>
              {showCurrentPlan && (
                <div className="mt-2 text-sm text-gray-700" onClick={(e) => e.stopPropagation()}>
                  <p>{t("userSettingsPage.planName")}: <strong>Premium</strong></p>
                  <p>{t("userSettingsPage.renewsOn")}: <strong>2025-12-01</strong></p>
                </div>
              )}
            </div>

            {/* Choose Plan */}
            <div className="bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition">
              <div className="flex items-center gap-2 mb-2" onClick={() => setShowChoosePlan(!showChoosePlan)}>
                <CreditCardIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold">{t("userSettingsPage.choosePlan")}</h3>
              </div>
              {showChoosePlan && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate("/subscriptions")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    {t("userSettingsPage.goToPlans")}
                  </button>
                </div>
              )}
            </div>

            {/* Billing History */}
            <div className="bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition">
              <div className="flex items-center gap-2 mb-2" onClick={() => setShowBillingHistory(!showBillingHistory)}>
                <CreditCardIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold">{t("userSettingsPage.billingHistory")}</h3>
              </div>
              {showBillingHistory && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate("/subscriptions/history")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    {t("userSettingsPage.viewHistory")}
                  </button>
                </div>
              )}
            </div>

            {/* Cancel Subscription */}
            <div className="bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition">
            <div
              className="flex items-center gap-2 mb-2"
              onClick={() => setShowCancelSubscription(!showCancelSubscription)}
            >
              <Trash2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-800">{t("userSettingsPage.cancelSubscription")}</h3>
            </div>
            {showCancelSubscription && (
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => navigate("/subscriptions/cancel")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {t("userSettingsPage.proceedCancel")}
                </button>
              </div>
            )}
          </div>
          </div>
        )}
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
