import React from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Award, ArrowRight, Sparkles, Building, Shield } from "lucide-react";
import Logo from "../../components/shared/Logo";
import Button from "../../components/common/Button";

export const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="max-w-md w-full mx-auto space-y-8 z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center">
          <Logo size="md" />
        </div>

        {/* Premium Onboarding Illustration Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up">
          {/* Illustration Area */}
          <div className="bg-gradient-to-br from-brand-red/10 to-brand-black/5 p-8 flex items-center justify-center relative">
            <div className="absolute top-4 right-4 animate-pulse">
              <Sparkles className="text-brand-red" size={20} />
            </div>
            
            {/* Visual Vector mapping elements */}
            <svg
              viewBox="0 0 200 120"
              style={{ width: "192px", height: "112px" }}
              className="text-gray-850"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Placement stairs */}
              <rect x="20" y="90" width="30" height="10" rx="2" fill="#e2e8f0" />
              <rect x="55" y="75" width="30" height="25" rx="2" fill="#cbd5e1" />
              <rect x="90" y="60" width="30" height="40" rx="2" fill="#94a3b8" />
              <rect x="125" y="45" width="30" height="55" rx="2" fill="#990000" />
              {/* Grad cap floating above stairs */}
              <g transform="translate(130, 15) scale(0.8)">
                <path d="M20 5 L35 12 L20 19 L5 12 Z" fill="#111827" />
                <path d="M10 15 V20 C10 23, 30 23, 30 20 V15" fill="#111827" />
              </g>
              {/* Connector dots representing networking link */}
              <line x1="35" y1="90" x2="140" y2="45" stroke="#990000" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="35" cy="90" r="4" fill="#111827" />
              <circle cx="140" cy="45" r="4" fill="#990000" />
              {/* Grads heads representation */}
              <circle cx="70" cy="75" r="3" fill="#111827" />
              <circle cx="105" cy="60" r="3" fill="#111827" />
            </svg>
          </div>

          {/* Copy and Actions */}
          <div className="p-6 md:p-8 space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-950 font-outfit">
                Your College Career Ecosystem
              </h2>
              <p className="text-xs md:text-sm text-gray-500 font-sans leading-relaxed max-w-xs mx-auto">
                Connect with alumni, discover opportunities, and grow professionally.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                onClick={() => navigate("/register/student")}
                iconBefore={<GraduationCap size={18} />}
                className="py-3 justify-between bg-brand-red text-white"
              >
                <span>Student Registration</span>
                <ArrowRight size={16} />
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate("/register/alumni")}
                iconBefore={<Award size={18} />}
                className="py-3 justify-between bg-brand-black text-white"
              >
                <span>Alumni Registration</span>
                <ArrowRight size={16} />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/register/hr")}
                iconBefore={<Building size={18} />}
                className="py-3 justify-between border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-brand-black"
              >
                <span>Recruiter (HR) Registration</span>
                <ArrowRight size={16} />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/login?role=tpo")}
                iconBefore={<Shield size={18} />}
                className="py-3 justify-between border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-brand-black"
              >
                <span>TPO Admin Portal</span>
                <ArrowRight size={16} />
              </Button>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-center text-sm">
                <span className="text-gray-500">Already registered? </span>
                <button
                  onClick={() => navigate("/login")}
                  className="ml-1.5 font-extrabold text-brand-red hover:underline focus:outline-none"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WelcomeScreen;
