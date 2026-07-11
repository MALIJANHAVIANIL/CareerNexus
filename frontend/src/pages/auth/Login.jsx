import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Hash, Sparkles, TrendingUp, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import Logo from "../../components/shared/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Active Role tab: student, alumni, tpo
  const [role, setRole] = useState("student");
  
  // Student fields
  const [studentIdentifier, setStudentIdentifier] = useState(""); // PRN OR Email
  
  // Alumni & TPO fields
  const [email, setEmail] = useState("");
  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (role === "student" && !studentIdentifier) {
      setError("Please enter your PRN or College Email.");
      return;
    }
    if (role !== "student" && !email) {
      setError("Please enter your Email address.");
      return;
    }
    if (!password) {
      setError("Please enter your Password.");
      return;
    }

    setLoading(true);

    try {
      const credentials = {
        role,
        password,
        ...(role === "student"
          ? { identifier: studentIdentifier }
          : { email: email })
      };

      const loggedUser = await login(credentials);
      showToast(`Welcome back, ${loggedUser.name}!`, "success");

      // Redirect to their respective dashboards
      if (role === "student") {
        navigate("/student/dashboard");
      } else if (role === "alumni") {
        navigate("/alumni/dashboard");
      } else if (role === "hr") {
        navigate("/hr/dashboard");
      } else if (role === "tpo") {
        navigate("/tpo/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials.");
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAutofill = (demoRole) => {
    setRole(demoRole);
    setError("");
    if (demoRole === "student") {
      setStudentIdentifier("student@test.com");
      setPassword("password");
    } else if (demoRole === "alumni") {
      setEmail("alumni@test.com");
      setPassword("password");
    } else if (demoRole === "hr") {
      setEmail("hr@test.com");
      setPassword("password");
    } else if (demoRole === "tpo") {
      setEmail("tpo@college.edu");
      setPassword("Admin@123");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Top Section: Career Growth Illustration */}
        <div className="flex justify-center mb-6">
          <div className="w-full bg-gradient-to-br from-brand-red/10 to-brand-black/5 rounded-2xl p-6 border border-brand-red/5 shadow-inner relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 rounded-full filter blur-xl" />
            <div className="flex flex-col gap-1.5 max-w-[65%]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-red flex items-center gap-1">
                <Sparkles size={10} /> Career Growth
              </span>
              <h3 className="text-sm font-bold text-gray-900 font-outfit">Student to Professional</h3>
              <p className="text-[11px] text-gray-500 leading-normal font-sans">
                Accelerate placement preparations and grow through mentoring connections.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-2 relative">
              <div className="relative">
                <GraduationCap className="h-10 w-10 text-brand-red animate-bounce" />
                <TrendingUp className="h-6 w-6 text-brand-black absolute -right-2 -bottom-2" />
              </div>
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-800 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: CareerNexus Logo */}
        <div className="flex justify-center mb-4">
          <Logo size="sm" />
        </div>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-7 px-6 shadow-xl border border-gray-100 rounded-2xl sm:px-10">
          
          {/* Role Selection Tabs */}
          <div className="flex bg-gray-50 rounded-xl p-1 mb-6 border border-gray-200/50">
            {["student", "alumni", "hr", "tpo"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setRole(tab);
                  setError("");
                  setPassword("");
                }}
                className={`flex-1 py-2 text-xs font-bold font-outfit rounded-lg uppercase transition-all ${
                  role === tab
                    ? "bg-brand-red text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <h2 className="text-lg font-bold font-outfit text-gray-950 mb-4 text-center">
            Sign In as <span className="text-brand-red capitalize">{role}</span>
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            {role === "student" ? (
              <Input
                label="College Email OR PRN"
                name="studentIdentifier"
                placeholder="alex@university.edu or PRN123456"
                value={studentIdentifier}
                onChange={(e) => setStudentIdentifier(e.target.value)}
                icon={<Mail size={16} />}
                required
              />
            ) : (
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder={role === "alumni" ? "sarah@google.com" : "tpo@careernexus.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                required
              />
            )}

            <div>
              <div className="flex justify-between mb-0.5">
                <label className="block text-sm font-semibold text-gray-700 font-outfit">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-red hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
              />
            </div>

            <Button type="submit" fullWidth loading={loading} className="py-2.5 mt-2">
              Sign In
            </Button>
          </form>

          {/* Testing Credentials Quick autofills */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400 mb-2.5 text-center">
              Testing credentials (click to autofill)
            </p>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleDemoAutofill("student")}
                className="px-1 py-1.5 text-[10px] font-bold border border-red-100 bg-red-50/20 text-brand-red rounded-lg hover:bg-red-50 transition"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleDemoAutofill("alumni")}
                className="px-1 py-1.5 text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-150 transition"
              >
                Alumni
              </button>
              <button
                type="button"
                onClick={() => handleDemoAutofill("hr")}
                className="px-1 py-1.5 text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-150 transition"
              >
                HR
              </button>
              <button
                type="button"
                onClick={() => handleDemoAutofill("tpo")}
                className="px-1 py-1.5 text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-155 transition"
              >
                TPO
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Password for all is: <span className="font-bold text-gray-600">password</span>
            </p>
          </div>

          {role !== "tpo" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 font-sans">
                Don't have an account?{" "}
                <Link
                  to={
                    role === "student" ? "/register/student" :
                    role === "alumni" ? "/register/alumni" :
                    "/register/hr"
                  }
                  className="font-bold text-brand-red hover:underline capitalize"
                >
                  Register as {role}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
