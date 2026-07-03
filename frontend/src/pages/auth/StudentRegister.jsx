import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, ArrowLeft, Mail, Lock, User, Hash, Award } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import Logo from "../../components/shared/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export const StudentRegister = () => {
  const { registerStudent } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [prn, setPrn] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("Computer Engineering");
  const [passingYear, setPassingYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Strength Meter State
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState("Weak");
  const [strengthColor, setStrengthColor] = useState("bg-gray-200");

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthText("Too Short");
      setStrengthColor("bg-gray-200");
      return;
    }
    let score = 0;
    if (password.length >= 8) score += 1; // Required minimum 8 chars for Phase 1
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    setStrength(score);
    if (password.length < 8) {
      setStrengthText("Weak (Min 8 Characters)");
      setStrengthColor("bg-red-500");
    } else if (score === 2) {
      setStrengthText("Fair");
      setStrengthColor("bg-amber-500");
    } else if (score === 3) {
      setStrengthText("Good");
      setStrengthColor("bg-blue-500");
    } else if (score >= 4) {
      setStrengthText("Strong");
      setStrengthColor("bg-emerald-500");
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !prn || !email || !branch || !passingYear || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerStudent({
        name,
        prn,
        email,
        branch,
        passingYear,
        password
      });

      showToast("Account created successfully. Please login.", "success");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed.");
      showToast(err.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const branches = [
    "Computer Engineering",
    "Information Technology",
    "ENTC",
    "Mechanical",
    "Civil",
    "Electrical"
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="mb-4">
          <Link to="/welcome" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-black transition-colors">
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
        <div className="flex justify-center mb-4">
          <Logo size="sm" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 rounded-2xl sm:px-10">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="text-brand-red h-6 w-6" />
            <h2 className="text-xl font-bold font-outfit text-gray-950">
              Student Registration
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={16} />}
              required
            />

            <Input
              label="PRN (Permanent Registration Number)"
              name="prn"
              placeholder="PRN123456"
              value={prn}
              onChange={(e) => setPrn(e.target.value)}
              icon={<Hash size={16} />}
              required
            />

            <Input
              label="College Email Address"
              name="email"
              type="email"
              placeholder="alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-outfit">
                  Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Passing Year"
                name="passingYear"
                placeholder="2027"
                value={passingYear}
                onChange={(e) => setPassingYear(e.target.value)}
                icon={<Award size={16} />}
                required
              />
            </div>

            <div>
              <Input
                label="Password (Min 8 Characters)"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
              />
              
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
                  <span className="text-[9px] font-extrabold uppercase font-outfit text-gray-400">
                    Strength: <span className="text-gray-700">{strengthText}</span>
                  </span>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={16} />}
              error={confirmPassword && password !== confirmPassword ? "Passwords do not match." : ""}
              required
            />

            <Button type="submit" fullWidth loading={loading} className="py-2.5 mt-2">
              Register Account
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

export default StudentRegister;
