import { useTranslation } from "react-i18next";
import LandingNavbar from "../../components/landingpage/LandingNavBar";
import LandingFooter from "../../components/landingpage/LandingFooter";
import { Users, Target, Heart } from "lucide-react";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="font-sans text-gray-900 bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-600 text-white py-32 lg:py-48 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fadeInUp">
            {t("aboutPage.title")}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto animate-fadeInUp delay-100">
            {t("aboutPage.subtitle")}
          </p>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
           <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Mission */}
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{t("aboutPage.missionTitle")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("aboutPage.missionText")}
              </p>
            </div>

            {/* Story */}
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{t("aboutPage.storyTitle")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("aboutPage.storyText")}
              </p>
            </div>

            {/* Values */}
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6 text-red-600">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{t("aboutPage.valuesTitle")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("aboutPage.valuesText")}
              </p>
            </div>

          </div>
        </div>
      </section>

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
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .delay-100 { animation-delay: 0.1s; }
        `}
      </style>
    </div>
  );
}