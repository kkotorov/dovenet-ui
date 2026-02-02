import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import api from "../../api/api";
import { toast, Toaster } from "react-hot-toast";
import { Mail, MessageSquare, FileText, Send, ChevronDown, ChevronUp } from "lucide-react";
import LandingNavbar from "../../components/landingpage/LandingNavBar";
import LandingFooter from "../../components/landingpage/LandingFooter";

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const [contactForm, setContactForm] = useState({ email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: t("contactPage.faq.q1"),
      answer: t("contactPage.faq.a1"),
    },
    {
      question: t("contactPage.faq.q2"),
      answer: t("contactPage.faq.a2"),
    },
    {
      question: t("contactPage.faq.q3"),
      answer: t("contactPage.faq.a3"),
    },
    {
      question: t("contactPage.faq.q4"),
      answer: t("contactPage.faq.a4"),
    },
    {
      question: t("contactPage.faq.q5"),
      answer: t("contactPage.faq.a5"),
    },
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      await api.post("/email/contact-support", contactForm);
      toast.success(t("contactPage.messageSent"));
      setContactForm({ email: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error(t("contactPage.messageError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-600 font-sans relative overflow-hidden">
      <Helmet>
        <html lang={i18n.language} />
        <title>{t("seo.contact.title", "Contact DoveNet | Pigeon Management Support")}</title>
        <meta name="description" content={t("seo.contact.description", "Contact DoveNet support for help with pigeon tracking, pedigree generation, or account management.")} />
      </Helmet>

      <LandingNavbar />
      <Toaster position="top-right" />
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
         <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="min-h-screen max-w-2xl mx-auto pt-32 pb-24 px-6 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-4">{t("contactPage.title")}</h1>
          <p className="text-xl text-blue-100">
            {t("contactPage.subtitle")}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("contactPage.email")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("contactPage.subject")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder={t("contactPage.subjectPlaceholder")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("contactPage.message")}</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  required
                  rows={6}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                  placeholder={t("contactPage.messagePlaceholder")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                t("common.sending") || "Sending..."
              ) : (
                <>
                  {t("contactPage.send")} <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-10">
            {t("contactPage.faqTitle", "Frequently Asked Questions")}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-white font-semibold hover:bg-white/5 transition-colors"
                >
                  <span>{faq.question}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-200" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-200" />
                  )}
                </button>
                <div
                  className={`px-6 text-blue-100 overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? "max-h-40 py-4 opacity-100" : "max-h-0 py-0 opacity-0"
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
        `}
      </style>
    </div>
  );
}
