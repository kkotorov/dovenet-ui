import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import Button from "../../components/utilities/Button";
import { useUser } from "../../components/utilities/UserContext";

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  useEffect(() => {
    // Refresh user profile to get updated subscription status
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-green-100 rounded-full text-green-600">
            <CheckCircle className="w-12 h-12" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("billing.successTitle")}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {t("billing.successMessage")}
        </p>

        <Button 
          onClick={() => navigate("/dashboard")}
          className="w-full justify-center py-3"
        >
          {t("billing.backToDashboard")}
        </Button>
      </div>
    </div>
  );
}
