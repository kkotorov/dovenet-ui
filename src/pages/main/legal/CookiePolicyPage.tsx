import { useTranslation } from "react-i18next";
import LandingNavbar from "../../../components/landingpage/LandingNavBar";
import LandingFooter from "../../../components/landingpage/LandingFooter";

export default function CookiePolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="font-sans text-gray-900 bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-600 min-h-screen relative overflow-hidden">
      <LandingNavbar />
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
         <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-4xl font-extrabold mb-8 text-gray-900">{t("cookiePolicy.title")}</h1>
          
          <div className="prose prose-lg text-gray-600 max-w-none">
            <p className="mb-6">{t("cookiePolicy.intro")}</p>
            s
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">{t("cookiePolicy.whatAreCookiesTitle")}</h2>
            <p className="mb-4">{t("cookiePolicy.whatAreCookiesText")}</p>

            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">{t("cookiePolicy.usageTitle")}</h2>
            <p className="mb-4">{t("cookiePolicy.usageText")}</p>
          </div>
        </div>
      </div>

      <LandingFooter />

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
        `}
      </style>
    </div>
  );
}