import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Trash2 } from "lucide-react";

interface Plan {
  id: string;
  title: string;
  price: string;
  yearlyPrice: string;
  highlight: boolean;
  trial?: string;
  features: string[];
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
}

export function SubscriptionsTab() {
  const { t } = useTranslation();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [activeTab, setActiveTab] = useState<
    "currentPlan" | "changePlan" | "billingHistory" | "cancelSubscription"
  >("currentPlan");

  const currentPlanId = "standard"; // mock, replace with backend data
  const nextBillingDate = "2025-12-15"; // mock

  const plans: Plan[] = [
    {
      id: "free",
      title: t("subscriptionPage.freeTrial"),
      price: "",
      yearlyPrice: "",
      highlight: false,
      trial: t("subscriptionPage.freePlanLimit14Days"),
      features: [
        t("subscriptionPage.planFeatures.unlimitedPigeons"),
        t("subscriptionPage.planFeatures.singleLoft"),
        t("subscriptionPage.planFeatures.addCompetitionInfo"),
        t("subscriptionPage.planFeatures.pedigreeDownloads1"),
      ],
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
        t("subscriptionPage.planFeatures.pedigreeDownloads50"),
      ],
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
        t("subscriptionPage.planFeatures.analysis"),
      ],
    },
  ];

  const invoices: Invoice[] = [
    { id: "INV001", date: "2025-10-15", amount: "€3.99", status: "Paid" },
    { id: "INV002", date: "2025-09-15", amount: "€3.99", status: "Paid" },
  ];

  const BillingToggle = () => (
    <div className="mb-6 flex items-center justify-center">
      <div
        className="relative w-52 h-10 bg-gray-300 rounded-full flex items-center cursor-pointer select-none"
        onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-1/2 h-9 bg-indigo-500 rounded-full shadow-md transition-all duration-300 ease-in-out
            ${billing === "yearly" ? "translate-x-full" : "translate-x-0"}`}
        />
        <div className="relative z-10 w-full flex justify-between px-4 text-sm font-semibold text-gray-700">
          <span className={`${billing === "monthly" ? "text-white" : ""}`}>
            {t("subscriptionPage.monthly")}
          </span>
          <span className={`${billing === "yearly" ? "text-white" : ""}`}>
            {t("subscriptionPage.yearly")}
          </span>
        </div>
      </div>
    </div>
  );

  const PlanCard = ({ plan }: { plan: Plan }) => {
    const displayPrice = billing === "monthly" ? plan.price : plan.yearlyPrice;
    const isCurrent = plan.id === currentPlanId;

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
            {billing === "monthly" ? (
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
          className={`mt-auto py-2 rounded-lg text-white font-medium transition ${
            isCurrent ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-400"
          }`}
        >
          {isCurrent ? t("subscriptionPage.currentPlan") : t("subscriptionPage.choosePlan")}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full grid gap-6">

      {/* Internal Tabs */}
      <div className="flex flex-wrap gap-4 mb-6">
        {["currentPlan", "changePlan", "billingHistory", "cancelSubscription"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              activeTab === tab
                ? "bg-indigo-500 text-white"
                : "bg-white text-indigo-500 shadow"
            }`}
          >
            {t(`subscriptionPage.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* Current Plan */}
      {activeTab === "currentPlan" && (
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">{t("subscriptionPage.currentPlan")}</h2>
          <p>
            {t("subscriptionPage.activePlan")}: <strong>{plans.find(p => p.id === currentPlanId)?.title}</strong>
          </p>
          <p>
            {t("subscriptionPage.billingCycle")}: <strong>{billing === "monthly" ? t("subscriptionPage.monthly") : t("subscriptionPage.yearly")}</strong>
          </p>
          <p>
            {t("subscriptionPage.nextBilling")}: <strong>{nextBillingDate}</strong>
          </p>
          <div className="flex gap-4 mt-4 flex-wrap">
            <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition">
              {t("subscriptionPage.changePlan")}
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              {t("subscriptionPage.viewInvoices")}
            </button>
          </div>
        </div>
      )}

      {/* Change Plan */}
      {activeTab === "changePlan" && (
        <>
          <BillingToggle />
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
          </div>
        </>
      )}

      {/* Billing History */}
      {activeTab === "billingHistory" && (
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">{t("subscriptionPage.billingHistory")}</h2>
          {invoices.length === 0 ? (
            <p>{t("subscriptionPage.noHistory")}</p>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">ID</th>
                  <th className="py-2">{t("subscriptionPage.date")}</th>
                  <th className="py-2">{t("subscriptionPage.amount")}</th>
                  <th className="py-2">{t("subscriptionPage.status")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b">
                    <td className="py-2">{inv.id}</td>
                    <td className="py-2">{inv.date}</td>
                    <td className="py-2">{inv.amount}</td>
                    <td className="py-2">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Cancel Subscription */}
      {activeTab === "cancelSubscription" && (
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-red-600">{t("subscriptionPage.cancelSubscription")}</h2>
          <p>{t("subscriptionPage.cancelWarning")}</p>
          <button className="mt-4 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> {t("subscriptionPage.proceedCancel")}
          </button>
        </div>
      )}
    </div>
  );
}
