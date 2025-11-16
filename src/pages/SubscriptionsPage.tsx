import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft } from "lucide-react";

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      id: "free",
      title: t("subscriptionPage.freeTrial"), // <-- changed key to indicate 14-day trial
      price: "", // no monthly price
      yearlyPrice: "", // no yearly price
      highlight: false,
      trial: t("subscriptionPage.freePlanLimit14Days"),
      features: [
        t("subscriptionPage.planFeatures.unlimitedPigeons"),
        t("subscriptionPage.planFeatures.singleLoft"),
        t("subscriptionPage.planFeatures.addCompetitionInfo"),
        t("subscriptionPage.planFeatures.pedigreeDownloads1")
      ]
    },
    {
      id: "standard",
      title: t("subscriptionPage.standardPlan"),
      price: "€3.99",
      yearlyPrice: "€33.50 (-30%)",
      highlight: true,
      features: [
        t("subscriptionPage.planFeatures.unlimitedPigeons"),
        t("subscriptionPage.planFeatures.multipleLofts"),
        t("subscriptionPage.planFeatures.addCompetitionInfo"),
        t("subscriptionPage.planFeatures.pedigreeDownloads50")
      ]
    },
    {
      id: "premium",
      title: t("subscriptionPage.premiumPlan"),
      price: "€9.99",
      yearlyPrice: "€65.90 (-45%)",
      highlight: false,
      features: [
        t("subscriptionPage.planFeatures.unlimitedPigeons"),
        t("subscriptionPage.planFeatures.multipleLofts"),
        t("subscriptionPage.planFeatures.addCompetitionInfo"),
        t("subscriptionPage.planFeatures.pedigreeDownloadsUnlimited"),
        t("subscriptionPage.planFeatures.analysis")
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-6 flex flex-col items-center">

      {/* Back to Dashboard Button */}
      <div className="w-full max-w-5xl flex justify-end mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("subscriptionPage.backToDashboard")}
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-2">{t("subscriptionPage.title")}</h1>
      <p className="text-gray-600 mb-6 text-center max-w-3xl">{t("subscriptionPage.subtitle")}</p>

      {/* Billing Toggle */}
      <div className="mb-8 flex items-center justify-center">
        <div
          className="relative w-52 h-10 bg-gray-300 rounded-full flex items-center cursor-pointer select-none"
          onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-1/2 h-9 bg-indigo-600 rounded-full shadow-md transition-all duration-300 ease-in-out
              ${billing === "yearly" ? "translate-x-full" : "translate-x-0"}`}
          />
          <div className="relative z-10 w-full flex justify-between px-4 text-sm font-semibold text-gray-700">
            <span className={`${billing === "monthly" ? "text-white" : ""}`}>{t("subscriptionPage.monthly")}</span>
            <span className={`${billing === "yearly" ? "text-white" : ""}`}>{t("subscriptionPage.yearly")}</span>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
        {plans.map((plan) => {
          const displayPrice = billing === "monthly" ? plan.price : plan.yearlyPrice;
          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 shadow-md bg-white flex flex-col ${
                plan.highlight ? "scale-105 border-indigo-500 shadow-lg" : ""
              }`}
            >
              <h2 className="text-xl font-semibold mb-2">{plan.title}</h2>

              {displayPrice && (
                <p className="text-3xl font-bold text-indigo-600">
                  {displayPrice}
                  {billing === "monthly" ? <span className="text-sm text-gray-600">/{t("subscriptionPage.month")}</span> : null}
                </p>
              )}

              {plan.trial && (
                <p className="text-sm text-red-600 font-semibold mb-2">{plan.trial}</p>
              )}

              <div className="flex flex-col gap-2 my-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`mt-auto py-2 rounded-lg text-white font-medium transition ${
                  plan.highlight
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {t("subscriptionPage.choosePlan")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
