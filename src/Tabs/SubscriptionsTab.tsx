import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check, Trash2, Shield } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/api";
import { useUser } from "../components/utilities/UserContext";
import ConfirmDeleteModal from "../components/utilities/ConfirmDeleteModal";
import Button from "../components/utilities/Button";
import { usePageHeader } from "../components/utilities/PageHeaderContext";
import ReactGA from "react-ga4";

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
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { setHeader, clearHeader } = usePageHeader();

  const currentPlanId = (user?.subscription || "FREE").toUpperCase();
  const nextBillingDate = user?.subscriptionValidUntil
    ? new Date(user.subscriptionValidUntil).toLocaleDateString()
    : "";
  const plans: Plan[] = useMemo(() => [
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
      yearlyPrice: "€35.99",
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
      yearlyPrice: "€71.99",
      highlight: false,
      features: [
        t("subscriptionPage.planFeatures.unlimitedPigeons"),
        t("subscriptionPage.planFeatures.multipleLofts"),
        t("subscriptionPage.planFeatures.addCompetitionInfo"),
        t("subscriptionPage.planFeatures.pedigreeDownloadsUnlimited"),
        t("subscriptionPage.planFeatures.analysis"),
      ],
    },
  ], [t]);

  useEffect(() => {
    const currentPlanTitle = plans.find((p) => p.id === currentPlanId)?.title || currentPlanId;

    setHeader({
      title: null,
      right: (
        <div className="flex items-center justify-center gap-3 w-full">
            <div className={`p-1.5 rounded-lg ${isSubscriptionActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}>
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
               <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{currentPlanTitle}</span>
                   {!isSubscriptionActive && currentPlanId !== "FREE" && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full font-medium">
                    {t("subscriptionPage.inactive")}
                  </span>
                )}
                {isSubscriptionActive && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-medium">
                    {t("subscriptionPage.active")}
                  </span>
                )}
               </div>
               {nextBillingDate && (
                <span className="text-xs text-gray-500 leading-none">
                  {user?.autoRenew === false 
                    ? t("subscriptionPage.expiresOn", { date: nextBillingDate }) 
                    : t("subscriptionPage.renewsOn", { date: nextBillingDate })}
                </span>
              )}
            </div>
        </div>
      ),
      actions: (
        isSubscriptionActive && (currentPlanId === "PREMIUM" || currentPlanId === "PRO") && user?.autoRenew !== false ? (
            <Button 
              variant="danger" 
              onClick={() => setCancelModalOpen(true)}
              className="h-9 px-3 text-xs"
              icon={<Trash2 className="w-3 h-3" />}
            >
              {t("subscriptionPage.cancelSubscription")}
            </Button>
        ) : null
      ),
    });
    return () => clearHeader();
  }, [setHeader, clearHeader, plans, currentPlanId, isSubscriptionActive, nextBillingDate, user?.autoRenew, t]);

  // Handle checkout session
  const handleChoosePlan = async (planId: string) => {
    ReactGA.event({
      category: "Subscription",
      action: "Initiate Checkout",
      label: `${planId} (${billing})`
    });
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
      toast.error(t("subscriptionPage.checkoutFailed") || "Failed to start checkout");
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await api.post("/billing/cancel-subscription");
      await refreshUser();
      ReactGA.event({
        category: "Subscription",
        action: "Cancel Subscription"
      });
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
    const isSelected = selectedPlanId === plan.id;

    return (
      <div
        className={`relative flex flex-col p-8 bg-white rounded-3xl transition-all duration-300 h-full cursor-pointer ${
          isSelected
            ? "border-2 border-indigo-500 shadow-2xl scale-105 z-10 ring-4 ring-indigo-50"
            : "border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1"
        } ${isDisabled ? "opacity-75" : ""}`}
        onClick={() => setSelectedPlanId(plan.id)}
        onMouseEnter={() => setSelectedPlanId(plan.id)}
      >
        {plan.highlight && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            {t("subscriptionPage.mostPopular") || "Most Popular"}
          </div>
        )}

        <div className="mb-8 text-center pt-2">
          <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-wide">{plan.title}</h3>
          <div className="mt-4 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-gray-900 tracking-tight">{displayPrice}</span>
            {plan.price !== "€0" && (
              <span className="text-lg font-medium text-gray-400">
                /{billing === "MONTHLY" ? t("subscriptionPage.month") : t("subscriptionPage.year")}
              </span>
            )}
          </div>
          {billing === "YEARLY" && plan.id !== "FREE" && (
             <p className="text-sm text-green-600 font-semibold mt-2 bg-green-50 inline-block px-2 py-1 rounded-md">
               {t("subscriptionPage.save25") || "Save ~25%"}
             </p>
          )}
          {plan.trial && <p className="text-sm text-orange-600 font-medium mt-2">{plan.trial}</p>}
        </div>

        <ul className="space-y-4 mb-8 flex-1 px-2">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="p-1 bg-green-100 rounded-full shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-600 font-medium">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isSelected ? "primary" : "secondary"}
          onClick={() => handleChoosePlan(plan.id)}
          disabled={isDisabled}
          className={`w-full py-3 text-base ${isSelected ? 'shadow-indigo-200 shadow-lg' : ''}`}
        >
          {isCurrent && isDisabled ? t("subscriptionPage.currentPlan") : t("subscriptionPage.choosePlan")}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto space-y-8 pb-8">
        
        <div className="space-y-8">
          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex relative">
              <button
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  billing === "MONTHLY"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-indigo-600 hover:bg-gray-50"
                }`}
                onClick={() => setBilling("MONTHLY")}
              >
                {t("subscriptionPage.monthly")}
              </button>
              <button
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  billing === "YEARLY"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-indigo-600 hover:bg-gray-50"
                }`}
                onClick={() => setBilling("YEARLY")}
              >
                {t("subscriptionPage.yearly")}
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-10 max-w-4xl mx-auto px-4">
            {plans
              .filter(plan => plan.id !== "FREE")
              .map(plan => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
          </div>
        </div>

      </div>

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
