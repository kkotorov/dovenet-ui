import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LandingNavbar from "../../components/landingpage/LandingNavBar";
import { useTranslation, Trans } from "react-i18next";
import {
  ShieldCheck,
  Trophy,
  Heart,
  Activity,
  BarChart2,
  Globe,
  ArrowRight,
  Check
} from "lucide-react";
import LandingFooter from "../../components/landingpage/LandingFooter";

export default function LandingPage() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { t, i18n } = useTranslation();
  const isLoggedIn = !!localStorage.getItem("token");

  const [billing, setBilling] = useState<"MONTHLY" | "YEARLY">("YEARLY");

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <div className="font-sans text-gray-900 bg-white">
      <Helmet>
        <html lang={i18n.language} />
        <title>{t("seo.landing.title", "DoveNet | Pigeon Management System & Pedigree Creator")}</title>
        <meta name="description" content={t("seo.landing.description", "The ultimate pigeon management system. Track racing pigeons, manage lofts, and create, print, and download professional pedigrees instantly.")} />
        <meta name="keywords" content="pigeon management, racing pigeons, pedigrees, create pedigrees, print pedigrees, download pedigrees, loft tracking" />
        <meta name="keywords" content={t("seo.landing.keywords", "pigeon management, racing pigeons, pedigrees, create pedigrees, print pedigrees, download pedigrees, loft tracking")} />
      </Helmet>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-600 text-white overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute top-0 left-0 w-full z-50">
          <LandingNavbar />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight animate-fadeInUp">
              <Trans
                i18nKey="landingPage.heroTitle"
                components={{ highlight: <span className="text-blue-300" /> }}
                values={{ appName: t("appName") }}
              />
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 animate-fadeInUp delay-100 leading-relaxed">
              {t("landingPage.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeInUp delay-200">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/register"
                    className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1"
                  >
                    {t("landingPage.getStarted")}
                  </Link>
                  <Link
                    to="/login"
                    className="bg-transparent border-2 border-blue-300 text-blue-100 hover:bg-blue-800 hover:text-white font-bold px-8 py-4 rounded-full transition-all"
                  >
                    {t("topBar.login")}
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-white text-blue-900 font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  {t("landingPage.goToDashboard")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
           <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50" id="features">
        <div className="container mx-auto px-6 text-center">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">
              {t("landingPage.featuresLabel")}
            </h2>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              {t("landingPage.featuresTitle")}
            </h3>
            <p className="text-xl text-gray-600">
              {t("landingPage.featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Activity className="w-8 h-8 text-blue-500" />}
              title={t("landingPage.feature1.title")}
              description={t("landingPage.feature1.description")}
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8 text-yellow-500" />}
              title={t("landingPage.feature2.title")}
              description={t("landingPage.feature2.description")}
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8 text-red-500" />}
              title={t("landingPage.feature3.title")}
              description={t("landingPage.feature3.description")}
            />
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-green-500" />}
              title={t("landingPage.feature4.title")}
              description={t("landingPage.feature4.description")}
            />
            <FeatureCard
              icon={<BarChart2 className="w-8 h-8 text-purple-500" />}
              title={t("landingPage.feature5.title")}
              description={t("landingPage.feature5.description")}
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-indigo-500" />}
              title={t("landingPage.feature6.title")}
              description={t("landingPage.feature6.description")}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white" id="pricing">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">
              {t("landingPage.footer.pricing")}
            </h2>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              {t("landingPage.pricingTitle")}
            </h3>
            <p className="text-xl text-gray-600">
              {t("landingPage.pricingSubtitle")}
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 flex justify-center">
              <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
                <button
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    billing === "MONTHLY"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => setBilling("MONTHLY")}
                >
                  {t("subscriptionPage.monthly")}
                </button>
                <button
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    billing === "YEARLY"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => setBilling("YEARLY")}
                >
                  {t("subscriptionPage.yearly")}
                </button>
              </div>
            </div>
             {billing === "YEARLY" && (
                <p className="text-sm text-green-600 font-semibold mt-3">
                  {t("subscriptionPage.save25")}
                </p>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             {/* Free Plan */}
             <PricingCard
                title={t("subscriptionPage.freeTrial")}
                price="€0"
                period={t("subscriptionPage.freePlanLimit10Days")}
                features={[
                    t("subscriptionPage.planFeatures.unlimitedPigeons"),
                    t("subscriptionPage.planFeatures.singleLoft"),
                    t("subscriptionPage.planFeatures.addCompetitionInfo"),
                    t("subscriptionPage.planFeatures.pedigreeDownloads1"),
                ]}
                buttonText={t("landingPage.getStarted")}
                onClick={() => navigate("/register")}
             />

             {/* Premium Plan */}
             <PricingCard
                title={t("subscriptionPage.premiumPlan")}
                price={billing === "MONTHLY" ? "€3.99" : "€35.99"}
                period={billing === "MONTHLY" ? `/${t("subscriptionPage.month")}` : `/${t("subscriptionPage.year")}`}
                features={[
                    t("subscriptionPage.planFeatures.unlimitedPigeons"),
                    t("subscriptionPage.planFeatures.multipleLofts"),
                    t("subscriptionPage.planFeatures.addCompetitionInfo"),
                    t("subscriptionPage.planFeatures.pedigreeDownloads50"),
                ]}
                highlight
                mostPopularText={t("subscriptionPage.mostPopular")}
                buttonText={t("landingPage.getStarted")}
                onClick={() => navigate("/register")}
             />

             {/* Pro Plan */}
             <PricingCard
                title={t("subscriptionPage.proPlan")}
                price={billing === "MONTHLY" ? "€7.99" : "€71.99"}
                period={billing === "MONTHLY" ? `/${t("subscriptionPage.month")}` : `/${t("subscriptionPage.year")}`}
                features={[
                    t("subscriptionPage.planFeatures.unlimitedPigeons"),
                    t("subscriptionPage.planFeatures.multipleLofts"),
                    t("subscriptionPage.planFeatures.addCompetitionInfo"),
                    t("subscriptionPage.planFeatures.pedigreeDownloadsUnlimited"),
                    t("subscriptionPage.planFeatures.analysis"),
                ]}
                buttonText={t("landingPage.getStarted")}
                onClick={() => navigate("/register")}
             />
          </div>
        </div>
      </section>

      {/* Trust/Stats Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <StatItem number="10k+" label={t("landingPage.stats.pigeons")} />
                <StatItem number="500+" label={t("landingPage.stats.users")} />
                <StatItem number="1k+" label={t("landingPage.stats.competitions")} />
                <StatItem number="99.9%" label={t("landingPage.stats.uptime")} />
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">{t("landingPage.ctaTitle")}</h2>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            {t("landingPage.ctaSubtitle")}
          </p>
          {!isLoggedIn ? (
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-10 py-4 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            >
              {t("landingPage.createAccount")} <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-10 py-4 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            >
              {t("landingPage.goToDashboard")} <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />

      {/* Tailwind Animations */}
      <style>
        {`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        `}
      </style>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="mb-6 p-4 bg-gray-50 rounded-xl w-fit group-hover:bg-blue-50 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
    return (
        <div>
            <div className="text-4xl font-extrabold text-blue-600 mb-2">{number}</div>
            <div className="text-gray-500 font-medium">{label}</div>
        </div>
    )
}

function PricingCard({ title, price, period, features, highlight, buttonText, onClick, mostPopularText }: any) {
  return (
    <div className={`relative flex flex-col p-8 bg-white rounded-3xl transition-all duration-300 h-full ${
        highlight 
        ? "border-2 border-blue-500 shadow-2xl scale-105 z-10 ring-4 ring-blue-50" 
        : "border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1"
    }`}>
      {highlight && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            {mostPopularText}
          </div>
      )}
      <div className="mb-8 text-center">
          <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
          <div className="mt-4 flex items-baseline justify-center gap-1">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{price}</span>
            <span className="text-gray-500 font-medium">{period}</span>
          </div>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
          {features.map((feature: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="p-1 bg-green-100 rounded-full shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-600 font-medium text-sm">{feature}</span>
            </li>
          ))}
      </ul>
      <button
        onClick={onClick}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
            highlight
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        }`}
      >
        {buttonText}
      </button>
    </div>
  )
}
