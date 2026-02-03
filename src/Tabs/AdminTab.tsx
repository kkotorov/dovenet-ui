import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  Users, Search, Trash2, Key, Ban, Bird, Home, Trophy, Heart,
  ArrowLeft, Loader2, XCircle, Eye, CreditCard,
  Settings
} from "lucide-react";
import api from "../api/api";
import { AxiosError } from "axios";
import { PigeonsTab } from "./PigeonsTab";
import { LoftsTab } from "./LoftsTab";
import { BreedingTab } from "./BreedingTab";
import { CompetitionsTab } from "./CompetitionsTab";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  subscription: string;
  subscriptionValidUntil?: string;
}

export function AdminTab() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activationUser, setActivationUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.status === 403) {
        toast.error(t("admin.accessDenied", "Access denied. Please log out and log back in to refresh permissions."));
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm(t("admin.confirmDeleteUser", "Are you sure you want to delete this user?"))) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      setUsers(users.filter((u) => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      await api.post(`/admin/users/${id}/reset-password`);
      toast.success("Password reset email sent");
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  const handleExpireSubscription = async (id: number) => {
    try {
      await api.post(`/admin/users/${id}/expire-subscription`);
      toast.success("Subscription expired");
      fetchUsers(); // Refresh to show updated status
    } catch (error) {
      toast.error("Failed to expire subscription");
    }
  };

  const handleCancelSubscription = async (id: number) => {
    if (!window.confirm(t("admin.confirmCancelSubscription", "Are you sure you want to cancel this user's subscription?"))) return;
    try {
      await api.post(`/admin/users/${id}/cancel-subscription`);
      toast.success("Subscription cancelled");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to cancel subscription");
    }
  };

  const handleActivateSubscription = async (type: string, months: number) => {
    if (!activationUser) return;
    try {
      await api.post(`/admin/users/${activationUser.id}/activate-subscription`, null, {
        params: { type, durationMonths: months }
      });
      toast.success("Subscription activated successfully");
      setActivationUser(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to activate subscription");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedUser) {
    return (
      <UserDetailsView
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          {t("admin.userManagement", "User Management")}
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("admin.searchUsers", "Search users...")}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Sub Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expires On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isActive = user.subscriptionValidUntil ? new Date(user.subscriptionValidUntil) > new Date() : false;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{user.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          user.subscription === 'FREE' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.subscription}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription !== 'FREE' && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.subscriptionValidUntil && (
                          <span className="text-xs text-gray-500">
                            {new Date(user.subscriptionValidUntil).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActivationUser(user)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Activate Subscription"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelSubscription(user.id)}
                          className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          title="Cancel Subscription"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExpireSubscription(user.id)}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Expire Subscription"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No users found matching your search.
            </div>
          )}
        </div>
      )}

      {activationUser && (
        <ActivationModal
          user={activationUser}
          onClose={() => setActivationUser(null)}
          onActivate={handleActivateSubscription}
        />
      )}
    </div>
  );
}

function UserDetailsView({ user, onBack }: { user: AdminUser; onBack: () => void }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"pigeons" | "lofts" | "breeding" | "competitions" | "settings">("pigeons");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        <TabButton
          active={activeTab === "pigeons"}
          onClick={() => setActiveTab("pigeons")}
          icon={<Bird className="w-4 h-4" />}
          label={t("dashboardPage.pigeons", "Pigeons")}
        />
        <TabButton
          active={activeTab === "lofts"}
          onClick={() => setActiveTab("lofts")}
          icon={<Home className="w-4 h-4" />}
          label={t("dashboardPage.lofts", "Lofts")}
        />
        <TabButton
          active={activeTab === "breeding"}
          onClick={() => setActiveTab("breeding")}
          icon={<Heart className="w-4 h-4" />}
          label={t("dashboardPage.breeding", "Breeding")}
        />
        <TabButton
          active={activeTab === "competitions"}
          onClick={() => setActiveTab("competitions")}
          icon={<Trophy className="w-4 h-4" />}
          label={t("dashboardPage.competitions", "Competitions")}
        />
        <TabButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={<Settings className="w-4 h-4" />}
          label={t("dashboardPage.profile", "Settings")}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
        {activeTab === "pigeons" && (
          <PigeonsTab 
            adminUserId={user.id} 
            className="bg-transparent p-0 min-h-0 shadow-none border-none"
          />
        )}
        {activeTab === "lofts" && (
          <LoftsTab
            adminUserId={user.id}
            className="bg-transparent p-0 min-h-0 shadow-none border-none"
          />
        )}
        {activeTab === "breeding" && (
          <BreedingTab
            adminUserId={user.id}
            className="bg-transparent p-0 min-h-0 shadow-none border-none"
          />
        )}
        {activeTab === "competitions" && (
          <CompetitionsTab
            adminUserId={user.id}
            className="bg-transparent p-0 min-h-0 shadow-none border-none"
          />
        )}
        {activeTab === "settings" && (
          <AdminDisplayUserSettings user={user} />
        )}
      </div>
    </div>
  );
}

function AdminDisplayUserSettings({ user }: { user: AdminUser }) {
  const [fullUser, setFullUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/users/${user.id}`);
        setFullUser(res.data);
      } catch (error) {
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };
    if (user.id) {
      fetchUserDetails();
    }
  }, [user.id]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  if (!fullUser) {
    return <div className="text-center text-gray-500 py-12">Could not load user details.</div>;
  }

  const InfoItem = ({ label, value }: { label: string, value: any }) => (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-md font-semibold text-gray-800">{value || '-'}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 bg-gray-50 rounded-lg border">
          <InfoItem label="First Name" value={fullUser.firstName} />
          <InfoItem label="Last Name" value={fullUser.lastName} />
          <InfoItem label="Phone Number" value={fullUser.phoneNumber} />
          <InfoItem label="Address" value={fullUser.address} />
          <InfoItem label="Language" value={fullUser.language?.toUpperCase()} />
          <InfoItem label="Email Verified" value={fullUser.emailVerified ? 'Yes' : 'No'} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Subscription & Billing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 bg-gray-50 rounded-lg border">
          <InfoItem label="Stripe Customer ID" value={fullUser.stripeCustomerId} />
          <InfoItem label="Stripe Subscription ID" value={fullUser.stripeSubscriptionId} />
          <InfoItem label="Auto-Renew" value={fullUser.autoRenew ? 'Enabled' : 'Disabled'} />
        </div>
      </div>
       <div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Login Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 bg-gray-50 rounded-lg border">
          <InfoItem label="Last Login Date" value={fullUser.lastLoginDate ? new Date(fullUser.lastLoginDate).toLocaleString() : '-'} />
          <InfoItem label="Last Login IP" value={fullUser.lastLoginIp} />
          <InfoItem label="Last Login User Agent" value={fullUser.lastLoginUserAgent} />
        </div>
      </div>
    </div>
  );
}

function ActivationModal({ user, onClose, onActivate }: { user: AdminUser; onClose: () => void; onActivate: (type: string, months: number) => void }) {
  const [type, setType] = useState("PREMIUM");
  const [months, setMonths] = useState(12);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Activate Subscription</h3>
          <p className="text-sm text-gray-500">
            Manually activate a subscription for <span className="font-semibold text-gray-700">{user.username}</span>.
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="PREMIUM">PREMIUM</option>
                <option value="PRO">PRO</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
              <input
                type="number"
                min="1"
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onActivate(type, months)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
          >
            Activate
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap
        ${active ? "bg-white text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
