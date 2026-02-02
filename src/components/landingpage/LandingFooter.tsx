import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800 relative z-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6 text-white">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">D</div>
               <span className="text-xl font-bold">DoveNet</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              {t("landingPage.footerDescription")}
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">{t("landingPage.footer.product")}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/#features" className="hover:text-blue-400 transition">{t("landingPage.footer.features")}</Link></li>
              <li><Link to="/#pricing" className="hover:text-blue-400 transition">{t("landingPage.footer.pricing")}</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition">{t("landingPage.footer.login")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t("landingPage.footer.company")}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-blue-400 transition">{t("landingPage.footer.about")}</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition">{t("landingPage.footer.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t("landingPage.footer.legal")}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/privacy" className="hover:text-blue-400 transition">{t("landingPage.footer.privacy")}</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400 transition">{t("landingPage.footer.terms")}</Link></li>
              <li><Link to="/cookies" className="hover:text-blue-400 transition">{t("landingPage.footer.cookies")}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} {t("appName")}. {t("landingPage.allRightsReserved")}
          </p>
          <div className="flex gap-6">
             {/* Social icons placeholders */}
          </div>
        </div>
      </div>
    </footer>
  );
}
