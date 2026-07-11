import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building, ArrowLeft, Mail, Lock, User, Briefcase, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import apiClient from "../../api/client";
import Logo from "../../components/shared/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export const HRRegister = () => {
  const { registerHR } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [isCustomCompany, setIsCustomCompany] = useState(false);
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [error, setError] = useState("");

  // Strength Meter State
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState("Weak");
  const [strengthColor, setStrengthColor] = useState("bg-gray-200");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiClient.get("/api/companies");
        setCompanies(response.data || []);
        if (response.data && response.data.length > 0) {
          setCompanyId(response.data[0].id.toString());
        } else {
          setCompanyId("other");
          setIsCustomCompany(true);
        }
      } catch (err) {
        console.error("Failed to load companies: ", err);
        setCompanyId("other");
        setIsCustomCompany(true);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthText("Too Short");
      setStrengthColor("bg-gray-200");
      return;
    }
    let score = 0;
    if (password.length >= 8) score += 1;
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
    if (!name || !email || !designation || (!companyId && !customCompanyName) || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (isCustomCompany && !customCompanyName.trim()) {
      setError("Please specify your company name.");
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
      await registerHR({
        name,
        email,
        designation,
        companyId,
        companyName: customCompanyName,
        isCustomCompany,
        password
      });

      showToast("Recruiter account registered successfully! Please sign in.", "success");
      navigate("/login");
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
        {/* Back Link */}
        <div className="mb-4">
          <Link to="/welcome" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-red font-outfit uppercase">
            <ArrowLeft size={14} /> Back to onboarding
          </Link>
        </div>

        {/* Header Illustration */}
        <div className="flex justify-center mb-6">
          <div className="w-full bg-gradient-to-br from-brand-red/10 to-brand-black/5 rounded-2xl p-5 border border-brand-red/5 shadow-inner relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 rounded-full filter blur-xl" />
            <div className="flex flex-col gap-1 max-w-[65%]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-red flex items-center gap-1">
                <Sparkles size={10} /> Corporate Talent
              </span>
              <h3 className="text-sm font-bold text-gray-900 font-outfit">Recruiter & Talent Portal</h3>
              <p className="text-[10px] text-gray-500 leading-normal font-sans">
                Post jobs, review student profiles and coordinate campus recruitment drives.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
              <Building className="h-8 w-8 text-brand-red animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Logo size="sm" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 rounded-2xl sm:px-10">
          <h2 className="text-xl font-bold font-outfit text-gray-950 mb-6 text-center">
            Register as a <span className="text-brand-red">Corporate Recruiter</span>
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              placeholder="Sarah Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={16} />}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="recruiter@stripe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />

            <Input
              label="Designation"
              name="designation"
              placeholder="Lead Talent Partner"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              icon={<Briefcase size={16} />}
              required
            />

            <div>
              <label className="block text-xs font-bold text-gray-700 font-outfit uppercase tracking-wider mb-1.5">
                Select Company
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Building size={16} />
                </div>
                <select
                  value={companyId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCompanyId(val);
                    if (val === "other" || val === "") {
                      setIsCustomCompany(true);
                    } else {
                      setIsCustomCompany(false);
                    }
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 text-xs text-brand-black bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red font-sans"
                  required
                  disabled={companiesLoading}
                >
                  {companiesLoading ? (
                    <option>Loading companies...</option>
                  ) : (
                    <>
                      {companies.length === 0 && <option value="">Select or Type a Company</option>}
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.industry})
                        </option>
                      ))}
                      <option value="other">Other (Add New Company)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {isCustomCompany && (
              <Input
                label="New Company Name"
                name="customCompanyName"
                placeholder="e.g. Stripe Inc."
                value={customCompanyName}
                onChange={(e) => setCustomCompanyName(e.target.value)}
                icon={<Building size={16} />}
                required
              />
            )}

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              required
            />

            {/* Password Strength Meter */}
            {password && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-gray-400">Password Strength:</span>
                  <span className={
                    strengthText === "Weak" || strengthText.includes("Weak") ? "text-red-500" :
                    strengthText === "Fair" ? "text-amber-500" :
                    strengthText === "Good" ? "text-blue-500" : "text-emerald-500"
                  }>{strengthText}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        strength >= step ? strengthColor : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={16} />}
              required
            />

            <Button type="submit" fullWidth loading={loading} className="py-2.5 mt-2">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 font-sans">
              Already have a recruiter account?{" "}
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

export default HRRegister;
