import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserIcon, MailIcon, LockIcon } from "lucide-react";
import api from "../api/api";
import toast, { Toaster } from "react-hot-toast";

export function UserSettingsTab() {
  const { t } = useTranslation();

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch {}
    };
    fetchUser();
  }, []);

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
      setUser(prev => ({ ...prev, email: newEmail, emailVerified: false }));
      setNewEmail(""); setConfirmEmail(""); setCurrentPasswordForEmail(""); setShowEmailEdit(false);
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
      setOldPassword(""); setNewPassword(""); setConfirmPassword(""); setShowPasswordEdit(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("userSettingsPage.settingsFailed"));
    }
  };

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <Toaster position="top-right" />

      {/* Profile Header */}
      <div className="bg-indigo-50 flex items-center justify-between p-6 rounded-2xl shadow-md mb-6">
        <div className="flex items-center gap-4">
          <UserIcon className="w-10 h-10 text-indigo-600" />
          <div>
            <p className="font-bold text-xl">{user.username}</p>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <button
          onClick={!user.emailVerified ? handleSendVerificationEmail : undefined}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition 
            ${user.emailVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}`}
        >
          {user.emailVerified ? t("userSettingsPage.verified") : t("userSettingsPage.notVerified")}
        </button>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Change Email */}
        <div className="bg-white rounded-2xl shadow hover:shadow-lg transition p-6">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowEmailEdit(!showEmailEdit)}>
            <div className="flex items-center gap-2">
              <MailIcon className="w-6 h-6 text-indigo-600" />
              <h3 className="font-semibold text-lg">{t("userSettingsPage.changeEmail")}</h3>
            </div>
            <span className="text-indigo-500">{showEmailEdit ? "-" : "+"}</span>
          </div>

          {showEmailEdit && (
            <div className="mt-4 grid gap-4 md:grid-cols-2" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col">
                <label className="text-gray-500 text-sm">{t("userSettingsPage.newEmail")}</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-500 text-sm">{t("userSettingsPage.confirmEmail")}</label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-500 text-sm">{t("userSettingsPage.currentPassword")}</label>
                <input
                  type="password"
                  value={currentPasswordForEmail}
                  onChange={e => setCurrentPasswordForEmail(e.target.value)}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <button
                onClick={handleEmailUpdate}
                className="md:col-span-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                {t("userSettingsPage.saveEmail")}
              </button>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow hover:shadow-lg transition p-6">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowPasswordEdit(!showPasswordEdit)}>
            <div className="flex items-center gap-2">
              <LockIcon className="w-6 h-6 text-indigo-600" />
              <h3 className="font-semibold text-lg">{t("userSettingsPage.changePassword")}</h3>
            </div>
            <span className="text-indigo-500">{showPasswordEdit ? "-" : "+"}</span>
          </div>

          {showPasswordEdit && (
            <div className="mt-4 grid gap-4 md:grid-cols-2" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col">
                <label className="text-gray-500 text-sm">{t("userSettingsPage.currentPassword")}</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-500 text-sm">{t("userSettingsPage.newPassword")}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-500 text-sm">{t("userSettingsPage.confirmPassword")}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <button
                onClick={handlePasswordUpdate}
                className="md:col-span-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                {t("userSettingsPage.savePassword")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
