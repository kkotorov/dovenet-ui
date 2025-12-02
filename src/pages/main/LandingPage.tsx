import { Link, useNavigate } from "react-router-dom";
import Pigeon from "../../assets/pigeon.svg";
import LandingNavbar from "../../components/landingpage/LandingNavBar";
import { useTranslation, Trans } from "react-i18next";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isLoggedIn = !!localStorage.getItem("token"); // check if user is logged in

  return (
    <div className="font-sans text-gray-900">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white overflow-hidden">
        <div className="container mx-auto px-6 py-32 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fadeInUp">
            <Trans
              i18nKey="landingPage.heroTitle"
              components={{ highlight: <span className="text-yellow-300" /> }}
              values={{ appName: t("appName") }}
            />
          </h1>
          <p className="text-lg md:text-2xl mb-10 animate-fadeInUp delay-200">
            {t("landingPage.heroSubtitle")}
          </p>
          <div className="flex justify-center gap-6 animate-fadeInUp delay-400">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition"
                >
                  {t("topBar.login")}
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent border border-white text-white font-semibold px-8 py-4 rounded-xl transform hover:scale-105 hover:bg-white hover:text-blue-600 transition"
                >
                  {t("topBar.signup")}
                </Link>
              </>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition"
              >
                {t("landingPage.goToDashboard")}
              </button>
            )}
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 opacity-30 animate-float">
          <img
            src={Pigeon}
            alt={t("landingPage.flyingPigeon")}
            className="w-64 mx-auto opacity-30 animate-float"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16 animate-fadeInUp">
            {t("landingPage.featuresTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 animate-fadeInUp delay-100">
              <h3 className="text-2xl font-semibold mb-4">
                {t("landingPage.feature1.title")}
              </h3>
              <p>{t("landingPage.feature1.description")}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 animate-fadeInUp delay-200">
              <h3 className="text-2xl font-semibold mb-4">
                {t("landingPage.feature2.title")}
              </h3>
              <p>{t("landingPage.feature2.description")}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 animate-fadeInUp delay-300">
              <h3 className="text-2xl font-semibold mb-4">
                {t("landingPage.feature3.title")}
              </h3>
              <p>{t("landingPage.feature3.description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeInUp">
          {t("landingPage.ctaTitle")}
        </h2>
        <p className="mb-10 text-lg md:text-xl animate-fadeInUp delay-200">
          {t("landingPage.ctaSubtitle")}
        </p>
        {!isLoggedIn ? (
          <Link
            to="/register"
            className="bg-white text-purple-600 font-semibold px-10 py-4 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition animate-fadeInUp delay-400"
          >
            {t("landingPage.createAccount")}
          </Link>
        ) : (
          <button
            onClick={() => navigate("/dashboard")}
            className="px-10 py-4 bg-white text-indigo-600 font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition animate-fadeInUp delay-400"
          >
            {t("landingPage.goToDashboard")}
          </button>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 text-center">
        <p>
          &copy; {new Date().getFullYear()} {t("appName")}.{" "}
          {t("landingPage.footerText")}
        </p>
      </footer>

      {/* Tailwind Animations */}
      <style>
        {`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 1s forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
}
