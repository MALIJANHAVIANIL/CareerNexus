import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import Logo from "../../components/shared/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export const ForgotPassword = () => {
  const { showToast } = useNotifications();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast("Verification link sent to your email address", "success");
    }, 1000);
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
          <div className="mb-4">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-black transition-colors">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>

          <h2 className="text-xl font-bold font-outfit text-gray-950 mb-2">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 font-sans mb-6">
            {!submitted
              ? "Enter your email address and we'll send you a link to reset your password."
              : "We have emailed your password reset link."}
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                required
              />

              <Button type="submit" fullWidth loading={loading} iconAfter={<Send size={15} />}>
                Send Link
              </Button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold text-center leading-normal">
              Check your inbox at <span className="font-bold">{email}</span>. Clicking the link will allow you to assign a new password for your account.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
