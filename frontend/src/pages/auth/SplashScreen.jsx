import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/shared/Logo";

export const SplashScreen = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [animationClass, setAnimationClass] = useState("opacity-0 scale-95");

  useEffect(() => {
    // Trigger entry animation
    setTimeout(() => {
      setAnimationClass("opacity-100 scale-100 transition-all duration-1000 ease-out");
    }, 100);

    // Wait for auth check to finish
    if (loading) return;

    // Dynamic redirect after animation
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        if (user.role === "student") {
          navigate("/student/dashboard");
        } else if (user.role === "alumni") {
          navigate("/alumni/dashboard");
        } else if (user.role === "tpo") {
          navigate("/tpo/dashboard");
        } else {
          navigate("/welcome");
        }
      } else {
        navigate("/welcome");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, loading, navigate]);

  return (
    <div className="h-screen w-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background grid elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      {/* Centered logo & animated text */}
      <div className={`flex flex-col items-center gap-6 z-10 ${animationClass}`}>
        <Logo size="lg" showText={false} className="animate-float" />
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold font-outfit text-brand-black tracking-tight mb-2">
            Career<span className="text-brand-red">Nexus</span>
          </h1>
          <p className="text-sm font-semibold text-gray-500 font-sans tracking-wide max-w-xs uppercase">
            Connecting Students, Alumni & Opportunities
          </p>
        </div>
      </div>

      {/* Modern bottom loader */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="h-1 w-24 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-brand-red rounded-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
};

export default SplashScreen;
