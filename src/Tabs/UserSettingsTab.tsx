import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  UserIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import i18n from "../i18n";
import { useUser } from "../components/utilities/UserContext";
import { fetchCurrentUser, sendVerificationEmail, updateEmail, updatePassword, updateProfile } from "../api/auth";
import Button from "../components/utilities/Button";
import { usePageHeader } from "../components/utilities/PageHeaderContext";

export function UserSettingsTab() {
  const { t } = useTranslation();
  const {setUser: setCtxUser } = useUser();

  const [user, setUser] = useState({
    username: "",
    email: "",
    emailVerified: false,
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    language: "en",
  });

  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const currentLanguage = i18n.language;

  const { setHeader, clearHeader } = usePageHeader();

  useEffect(() => {
    setHeader({
      title: null,
      right: null,
      actions: null,
    });
    return () => clearHeader();
  }, [setHeader, clearHeader]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
          const data = await fetchCurrentUser();

          setUser({
            username: data.username || "",
            email: data.email || "",
            emailVerified: data.emailVerified || false,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            language: data.language || "en",
          });

        if (data.language && data.language !== i18n.language) {
          i18n.changeLanguage(data.language);
        }
      } catch (err) {
        toast.error(t("userSettingsPage.settingsFailed"));
      }
    };
    fetchUser();
  }, []);

  const handleSendVerificationEmail = async () => {
    try {
      const data = await sendVerificationEmail();
      toast.success(
        data?.message || t("userSettingsPage.verificationEmailSent")
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || t("userSettingsPage.settingsFailed")
      );
    }
  };

  const handleEmailUpdate = async () => {
    if (newEmail !== confirmEmail)
      return toast.error(t("userSettingsPage.emailsDoNotMatch"));
    if (!currentPasswordForEmail)
      return toast.error(t("userSettingsPage.enterCurrentPassword"));

    try {
      await updateEmail(newEmail, currentPasswordForEmail)

      toast.success(t("userSettingsPage.emailUpdated"));
      setUser((prev) => ({ ...prev, email: newEmail, emailVerified: false }));
      setNewEmail("");
      setConfirmEmail("");
      setCurrentPasswordForEmail("");
      setShowEmailEdit(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || t("userSettingsPage.settingsFailed")
      );
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword)
      return toast.error(t("userSettingsPage.passwordsDoNotMatch"));
    if (!oldPassword) return toast.error(t("userSettingsPage.enterCurrentPassword"));

    try {
      await updatePassword(oldPassword, newPassword);

      toast.success(t("userSettingsPage.passwordUpdated"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordEdit(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || t("userSettingsPage.settingsFailed")
      );
    }
  };


  // temp state for select
  const [newLanguage, setNewLanguage] = useState(user.language || currentLanguage);

  // sync newLanguage whenever user.language is updated from backend
  useEffect(() => {
    if (user.language) {
      setNewLanguage(user.language);
    }
  }, [user.language]);

  const handleProfileUpdate = async () => {
    try {
      const data = await updateProfile ({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        language: newLanguage || currentLanguage,

      });
      setUser({
        username: data.username || "",
        email: data.email || "",
        emailVerified: data.emailVerified || false,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
        language: data.language || "en",
      });
      setCtxUser(data); // sync context
      toast.success(t("userSettingsPage.profileUpdated"));
      setShowProfileEdit(false);

      if (data.language && data.language !== i18n.language) {
        i18n.changeLanguage(data.language);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || t("userSettingsPage.settingsFailed")
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white flex flex-col md:flex-row items-center justify-between p-8 rounded-3xl shadow-lg gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="p-4 bg-indigo-50 rounded-full">
              <UserIcon className="w-10 h-10 text-indigo-600" />
            </div>
          <div className="flex flex-col gap-2">
            {/* Full Name */}
              <h1 className="font-extrabold text-3xl text-gray-900">
              {user.firstName || ""} {user.lastName || ""}
              </h1>

            {/* Email */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 text-sm font-medium">
                <div className="flex items-center gap-1.5">
              <MailIcon className="w-4 h-4 text-gray-500" />
              <span>{user.email}</span>
            </div>

            {/* Phone */}
            {user.phoneNumber && (
                  <div className="flex items-center gap-1.5">
                <PhoneIcon className="w-4 h-4 text-gray-500" />
                <span>{user.phoneNumber}</span>
              </div>
            )}

            {/* Address */}
            {user.address && (
                  <div className="flex items-center gap-1.5">
                <MapPinIcon className="w-4 h-4 text-gray-500" />
                <span>{user.address}</span>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Email Verification Button */}
        <button
          onClick={!user.emailVerified ? handleSendVerificationEmail : undefined}
            className={`px-5 py-2 rounded-full text-sm font-bold transition shadow-sm
            ${user.emailVerified ? "bg-green-100 text-green-700 cursor-default" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"}`}
        >
          {user.emailVerified ? t("userSettingsPage.verified") : t("userSettingsPage.notVerified")}
        </button>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">

        {/* Edit Profile Info */}
          <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors" 
              onClick={() => setShowProfileEdit(!showProfileEdit)}
            >
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">{t("userSettingsPage.profileInfo")}</h3>
            </div>
              {showProfileEdit ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
          </div>

          {showProfileEdit && (
              <div className="px-6 pb-8 grid gap-5 md:grid-cols-2 animate-in slide-in-from-top-2 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.firstName")}</label>
                <input
                  value={user.firstName || ""}
                  onChange={e => setUser(prev => ({ ...prev, firstName: e.target.value }))}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
              <div className="flex flex-col">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.lastName")}</label>
                <input
                  value={user.lastName || ""}
                  onChange={e => setUser(prev => ({ ...prev, lastName: e.target.value }))}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
              <div className="flex flex-col">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.phoneNumber")}</label>
                <input
                  value={user.phoneNumber || ""}
                  onChange={e => setUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
              <div className="flex flex-col">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.address")}</label>
                <input
                  value={user.address || ""}
                  onChange={e => setUser(prev => ({ ...prev, address: e.target.value }))}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
              <div className="flex flex-col md:col-span-2">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.language")}</label>
                <select
                  value={newLanguage}
                  onChange={e => setNewLanguage(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                >
                  <option value="en">{t("userSettingsPage.languageEnglish")}</option>
                  <option value="bg">{t("userSettingsPage.languageBulgarian")}</option>
                </select>
              </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <Button
                onClick={handleProfileUpdate}
              >
                {t("userSettingsPage.saveProfile")}
                  </Button>
                </div>
            </div>
          )}
        </div>

        {/* Change Email */}
          <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors" 
              onClick={() => setShowEmailEdit(!showEmailEdit)}
            >
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <MailIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">{t("userSettingsPage.changeEmail")}</h3>
            </div>
              {showEmailEdit ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
          </div>

          {showEmailEdit && (
              <div className="px-6 pb-8 grid gap-5 md:grid-cols-2 animate-in slide-in-from-top-2 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.newEmail")}</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
              <div className="flex flex-col">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.confirmEmail")}</label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
              <div className="flex flex-col md:col-span-2">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.currentPassword")}</label>
                <input
                  type="password"
                  value={currentPasswordForEmail}
                  onChange={e => setCurrentPasswordForEmail(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <Button
                onClick={handleEmailUpdate}
              >
                {t("userSettingsPage.saveEmail")}
                  </Button>
                </div>
            </div>
          )}
        </div>

        {/* Change Password */}
          <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors" 
              onClick={() => setShowPasswordEdit(!showPasswordEdit)}
            >
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <LockIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">{t("userSettingsPage.changePassword")}</h3>
            </div>
              {showPasswordEdit ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
          </div>

          {showPasswordEdit && (
              <div className="px-6 pb-8 grid gap-5 md:grid-cols-2 animate-in slide-in-from-top-2 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.currentPassword")}</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
              <div className="flex flex-col">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.newPassword")}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
              <div className="flex flex-col">
                  <label className="text-gray-700 text-sm font-semibold mb-1.5">{t("userSettingsPage.confirmPassword")}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <Button
                onClick={handlePasswordUpdate}
              >
                {t("userSettingsPage.savePassword")}
                  </Button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
