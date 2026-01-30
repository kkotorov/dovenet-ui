import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/api";
import { useUser } from "../components/utilities/UserContext";
import ConfirmDeleteModal from "../components/utilities/ConfirmDeleteModal";

interface Plan {
  id: string;
  title: string;
  price: string;
  yearlyPrice: string;
  highlight: boolean;
  trial?: string;
  features: string[];
}

export function SubscriptionsTab() {
  const { t } = useTranslation();
  const { user, refreshUser, isSubscriptionActive } = useUser();
  const [billing, setBilling] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const currentPlanId = (user?.subscription || "FREE").toUpperCase();
  const nextBillingDate = user?.subscriptionValidUntil
    ? new Date(user.subscriptionValidUntil).toLocaleDateString()
    : "";

  const plans: Plan[] = [
    {
      id: "FREE",
      title: t("subscriptionPage.freeTrial"),
      price: "",
      yearlyPrice: "",
      highlight: false,
      trial: t("subscriptionPage.freePlanLimit10Days"),
      features: [
        t("subscriptionPage.planFeatures.unlimitedPigeons"),
        t("subscriptionPage.planFeatures.singleLoft"),
        t("subscriptionPage.planFeatures.addCompetitionInfo"),
        t("subscriptionPage.planFeatures.pedigreeDownloads1"),
      ],
    },
    {
      id: "PREMIUM",
      title: t("subscriptionPage.premiumPlan"),
      price: "€3.99",
      yearlyPrice: "€35.99 (-25%)",
      highlight: true,
      features: [
        t("subscriptionPage.planFeatures.unlimitedPigeons"),
        t("subscriptionPage.planFeatures.multipleLofts"),
        t("subscriptionPage.planFeatures.addCompetitionInfo"),
        t("subscriptionPage.planFeatures.pedigreeDownloads50"),
      ],
    },
    {
      id: "PRO",
      title: t("subscriptionPage.proPlan"),
      price: "€7.99",
      yearlyPrice: "€71.99 (-25%)",
      highlight: false,
      features: [
        t("subscriptionPage.planFeatures.unlimitedPigeons"),
        t("subscriptionPage.planFeatures.multipleLofts"),
        t("subscriptionPage.planFeatures.addCompetitionInfo"),
        t("subscriptionPage.planFeatures.pedigreeDownloadsUnlimited"),
        t("subscriptionPage.planFeatures.analysis"),
      ],
    },
  ];

  // Billing toggle component
  const BillingToggle = () => (
    <div className="mb-6 flex items-center justify-center">
      <div
        className="relative w-52 h-10 bg-gray-300 rounded-full flex items-center cursor-pointer select-none"
        onClick={() => setBilling(billing === "MONTHLY" ? "YEARLY" : "MONTHLY")}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-1/2 h-9 bg-indigo-500 rounded-full shadow-md transition-all duration-300 easœe-in-out
            ${billing === "YEARLY" ? "translate-x-full" : "translate-x-0"}`}
        />
        <div className="relative z-10 w-full flex justify-between px-4 text-sm font-semibold text-gray-700">
          <span className={`${billing === "MONTHLY" ? "text-white" : ""}`}>
            {t("subscriptionPage.monthly")}
          </span>
          <span className={`${billing === "YEARLY" ? "text-white" : ""}`}>
            {t("subscriptionPage.yearly")}
          </span>
        </div>
      </div>
    </div>
  );

  // Handle checkout session
  const handleChoosePlan = async (planId: string) => {
    try {
      const res = await api.post(`/billing/checkout`, null, {
        params: { type: planId, period: billing },
      });
      const data = res.data;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to create checkout session:", err);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await api.post("/billing/cancel-subscription");
      await refreshUser();
      toast.success(t("subscriptionPage.cancelSuccess"));
      setCancelModalOpen(false);
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      toast.error(t("subscriptionPage.cancelFailed"));
    } finally {
      setCancelLoading(false);
    }
  };

  const PlanCard = ({ plan }: { plan: Plan }) => {
    const displayPrice = billing === "MONTHLY" ? plan.price : plan.yearlyPrice;
    const isCurrent = plan.id === currentPlanId;
    const isDowngrade = currentPlanId === "PRO" && plan.id === "PREMIUM" && isSubscriptionActive;
    const isDisabled = (isCurrent && (plan.id === "FREE" || isSubscriptionActive)) || isDowngrade;

    return (
      <div
        className={`rounded-2xl border p-6 shadow-md bg-white flex flex-col ${
          plan.highlight ? "scale-105 border-indigo-500 shadow-lg" : ""
        }`}
      >
        <h2 className="text-xl font-semibold mb-2">{plan.title}</h2>
        {displayPrice && (
          <p className="text-3xl font-bold text-indigo-500 mb-2">
            {displayPrice}
            {billing === "MONTHLY" ? (
              <span className="text-sm text-gray-600">/{t("subscriptionPage.month")}</span>
            ) : null}
          </p>
        )}
        {plan.trial && <p className="text-sm text-red-600 font-semibold mb-2">{plan.trial}</p>}
        <div className="flex flex-col gap-2 my-4">
          {plan.features.map((f, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => handleChoosePlan(plan.id)}
          className={`mt-auto py-2 rounded-lg text-white font-medium transition ${
            isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-400"
          }`}
          disabled={isDisabled}
        >
          {isCurrent && isDisabled ? t("subscriptionPage.currentPlan") : t("subscriptionPage.choosePlan")}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full grid gap-8">
      <Toaster position="top-right" />
      {/* Current Plan Section */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">{t("subscriptionPage.currentPlan")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">{t("subscriptionPage.activePlan")}</p>
            <p className={`text-lg font-semibold ${!isSubscriptionActive && currentPlanId !== "FREE" ? "text-red-600" : ""}`}>
              {plans.find((p) => p.id === currentPlanId)?.title || currentPlanId}
              {!isSubscriptionActive && currentPlanId !== "FREE" && ` (${t("subscriptionPage.inactive")})`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t("subscriptionPage.nextBilling")}</p>
            <p className="text-lg font-semibold">{nextBillingDate}</p>
          </div>
        </div>
      </div>

      {/* Upgrade Plan Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-center">{t("subscriptionPage.upgradePlan")}</h2>
        <BillingToggle />
        <div className="grid md:grid-cols-2 gap-6">
          {plans
            .filter(plan => plan.id !== "FREE")
            .map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
        </div>
      </div>

      {/* Manage Subscription Section */}
      {isSubscriptionActive &&
        (currentPlanId === "PREMIUM" || currentPlanId === "PRO") && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            {user?.autoRenew !== false ? (
              <>
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  {t("subscriptionPage.cancelSubscription")}
                </h2>
                <p className="text-gray-600 mb-4">
                  {t("subscriptionPage.cancelWarning")}
                </p>
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />{" "}
                  {t("subscriptionPage.proceedCancel")}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {t("subscriptionPage.subscriptionStatus")}
                </h2>
                <p className="text-gray-600">
                  {t("subscriptionPage.subscriptionWillExpireOn", { date: nextBillingDate })}
                </p>
              </>
            )}
          </div>
        )}

      <ConfirmDeleteModal
        open={cancelModalOpen}
        title={t("subscriptionPage.cancelSubscription")}
        message={t("subscriptionPage.cancelWarning")}
        cancelLabel={t("common.cancel")}
        deleteLabel={t("subscriptionPage.proceedCancel")}
        loading={cancelLoading}
        onCancel={() => setCancelModalOpen(false)}
        onConfirm={handleCancelSubscription}
      />
    </div>
  );
}
