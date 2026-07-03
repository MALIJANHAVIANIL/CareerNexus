import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, GraduationCap, Briefcase, Award } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import Logo from "../../components/shared/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export const Register = () => {
  const { register } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [role, setRole] = useState("student"); // student, alumni, hr
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Password Strength State
  const [strength, setStrength] = useState(0); // 0 to 4
  const [strengthText, setStrengthText] = useState("Weak");
  const [strengthColor, setStrengthColor] = useState("bg-gray-200");

  useEffect(() => {
    // Basic password strength logic
    if (!password) {
      setStrength(0);
      setStrengthText("Too Short");
      setStrengthColor("bg-gray-200");
      return;
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    setStrength(score);
    if (score <= 1) {
      setStrengthText("Weak");
      setStrengthColor("bg-red-500");
    } else if (score === 2) {
      setStrengthText("Fair");
      setStrengthColor("bg-amber-500");
    } else if (score === 3) {
      setStrengthText("Good");
      setStrengthColor("bg-blue-500");
    } else if (score === 4) {
      setStrengthText("Strong");
      setStrengthColor("bg-emerald-500");
    }
  }, [password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newUser = await register({ name, email, password, role });
      showToast(`Welcome, ${newUser.name}! Your account has been created.`, "success");
      
      if (role === "alumni") {
        navigate("/alumni-dashboard");
      } else if (role === "hr") {
        navigate("/hr-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
      showToast(err.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="flex justify-center mb-4">
          <Logo size="md" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 rounded-2xl sm:px-10">
          <h2 className="text-xl font-bold font-outfit text-gray-950 mb-5 text-center">
            Create your Account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Role Selection Group */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 font-outfit mb-2">
                Select your Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                    role === "student"
                      ? "border-brand-red bg-red-50/20 text-brand-red ring-2 ring-brand-red/20 font-bold"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 font-semibold"
                  }`}
                >
                  <GraduationCap size={18} className="mb-1" />
                  <span className="text-[11px] font-outfit">Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("alumni")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                    role === "alumni"
                      ? "border-brand-red bg-red-50/20 text-brand-red ring-2 ring-brand-red/20 font-bold"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 font-semibold"
                  }`}
                >
                  <Award size={18} className="mb-1" />
                  <span className="text-[11px] font-outfit">Alumni</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("hr")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                    role === "hr"
                      ? "border-brand-red bg-red-50/20 text-brand-red ring-2 ring-brand-red/20 font-bold"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 font-semibold"
                  }`}
                >
                  <Briefcase size={18} className="mb-1" />
                  <span className="text-[11px] font-outfit">HR Partner</span>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={16} />}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />

            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
              />
              
              {/* Strength Meter */}
              {password && (
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex gap-1 flex-1 max-w-[65%]">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          i < strength ? strengthColor : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase font-outfit text-gray-400">
                    Strength: <span className="text-gray-700">{strengthText}</span>
                  </span>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={16} />}
              error={confirmPassword && password !== confirmPassword ? "Passwords do not match." : ""}
              required
            />

            <Button type="submit" fullWidth loading={loading} className="py-2.5 mt-2">
              Sign Up
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 font-sans">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-brand-red hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
