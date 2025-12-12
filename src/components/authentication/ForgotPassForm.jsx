"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Toast } from "flowbite-react";
import Logo from "./Logo";
import "flowbite";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { API_BASE_URL } from "../../utils/api.js"; // import API_BASE_URL
import { isEmailValid } from "../../survey/surveyUtils";

export default function ForgotPassForm() {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email"); // "email", "code", "password"
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("bg-green-500/90 text-white");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [popupCode, setPopupCode] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    if (password.length < 8) return "too short";
    if (!/[a-z]/.test(password)) return "no lowercase";
    if (!/[A-Z]/.test(password)) return "no uppercase";
    if (!/[0-9]/.test(password)) return "no number";
    if (!/[^A-Za-z0-9]/.test(password)) return "no symbol";
    return "strong";
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case "too short":
      case "no lowercase":
      case "no uppercase":
      case "no number":
      case "no symbol":
        return "text-red-600";
      case "strong":
        return "text-green-600";
      default:
        return "";
    }
  };

  const getStrengthLabel = (strength) => {
    switch (strength) {
      case "too short":
        return "Password must be at least 8 characters";
      case "no lowercase":
        return "Add a lowercase letter";
      case "no uppercase":
        return "Add an uppercase letter";
      case "no number":
        return "Add a number";
      case "no symbol":
        return "Add a symbol";
      case "strong":
        return "Strong password";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (step === "email") {
      setError("");
    }
  }, [email, step]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setPopupCode(data.code);
        setShowCodePopup(true);
        setStep("code");
      } else {
        setError(data?.error || "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!resetCode) {
      setError("Please enter your reset code.");
      return;
    }
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: resetCode }),
      });
      if (res.ok) {
        setStep("password");
        setToastMessage("Code verified! Now set your new password.");
        setToastColor("bg-green-500/90 text-white");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } else {
        const data = await res.json();
        setError(data?.error || "Invalid or expired code.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const passStrength = checkPasswordStrength(newPassword);
    if (passStrength !== "strong") {
      setError("Password is not strong: " + getStrengthLabel(passStrength));
      return;
    }
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: resetCode, newPassword }),
      });
      if (res.ok) {
        setToastMessage("Password reset successful!");
        setToastColor("bg-green-500/90 text-white");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate("/login");
        }, 2000);
      } else {
        const data = await res.json();
        setError(data?.error || "Failed to reset password.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleSendEmailConfirm = async () => {
    setIsSendingEmail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/send-reset-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: popupCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setToastMessage("Reset code sent to your email!");
        setToastColor("bg-green-500/90 text-white");
      } else {
        setToastMessage(
          "Email sending unavailable, but you can still use the code above"
        );
        setToastColor("bg-yellow-500/90 text-white");
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setToastMessage("Email unavailable, use the code shown");
      setToastColor("bg-yellow-500/90 text-white");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const passwordStrength = checkPasswordStrength(newPassword);

  return (
    <div
      className="bg-[#F4F4F4] rounded-lg shadow-2x1 
        w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] xl:w-[36rem]
        p-8 sm:p-8 md:p-10 text-sm md:text-base
        border-3 border-gray-200"
    >
      {showToast && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
          <Toast className={`${toastColor} shadow-xl`}>
            <span className="font-semibold">{toastMessage}</span>
          </Toast>
        </div>
      )}

      {showCodePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
              Your Reset Code
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              We found your account. Use this code to reset your password:
            </p>
            <div className="bg-gray-100 rounded-lg p-6 mb-6 text-center">
              <p className="text-4xl font-bold tracking-widest text-blue-600">
                {popupCode}
              </p>
            </div>
            <p className="text-xs text-gray-500 text-center mb-6">
              Code expires in 15 minutes
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSendEmailConfirm}
                disabled={isSendingEmail}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
              >
                {isSendingEmail ? "Sending..." : "Send Code to Email"}
              </button>
              <button
                onClick={() => setShowCodePopup(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg transition"
              >
                Proceed with Code
              </button>
            </div>
          </div>
        </div>
      )}

      <Logo />

      {step === "email" && (
        <>
          <h2 className="text-xl text-center font-bold text-gray-800 mb-6 mt-2">
            Forgot Password
          </h2>
          <form
            className="w-full 
              max-w-md 
              sm:max-w-lg 
              md:max-w-xl 
              lg:max-w-2xl 
              mx-auto"
            onSubmit={handleRequestReset}
          >
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-black"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="name@example.com"
                required
                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                  placeholder-gray-400 ${
                    emailTouched && email && !isEmailValid(email)
                      ? "border-red-500"
                      : ""
                  }`}
              />
              {emailTouched && email && !isEmailValid(email) && (
                <span className="text-xs text-red-500 mt-1 block">
                  Please enter a valid email address (no numbers-only, no
                  whitespace, valid domain required).
                </span>
              )}
            </div>
            {error && (
              <div className="mb-5 text-red-600 text-center font-medium">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 
                focus:ring-4 focus:outline-black focus:ring-blue-300 
                font-medium rounded-lg text-sm px-5 py-2.5 text-center
                mx-auto block sm:w-40 md:w-48 w-full"
            >
              Send Reset Code
            </Button>
            <div className="flex items-center justify-between">
              <div className="flex justify-center mt-8">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Back to Login
                </Link>
              </div>
              <div className="flex justify-center mt-8">
                <Link
                  to="/register"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Register Here
                </Link>
              </div>
            </div>
          </form>
        </>
      )}

      {step === "code" && (
        <>
          <h2 className="text-xl text-center font-bold text-gray-800 mb-2 mt-2">
            Enter Reset Code
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
          <form
            className="w-full 
              max-w-md 
              sm:max-w-lg 
              md:max-w-xl 
              lg:max-w-2xl 
              mx-auto"
            onSubmit={handleVerifyCode}
          >
            <div className="mb-5">
              <label
                htmlFor="code"
                className="block mb-2 text-sm font-medium text-black"
              >
                Reset Code
              </label>
              <input
                type="text"
                id="code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                placeholder="000000"
                maxLength="6"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                  placeholder-gray-400 text-center text-2xl tracking-widest"
              />
            </div>
            {error && (
              <div className="mb-5 text-red-600 text-center font-medium">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 
                focus:ring-4 focus:outline-black focus:ring-blue-300 
                font-medium rounded-lg text-sm px-5 py-2.5 text-center
                mx-auto block sm:w-40 md:w-48 w-full"
            >
              Verify Code
            </Button>
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-sm text-blue-600 hover:underline"
              >
                Back to Email
              </button>
            </div>
          </form>
        </>
      )}

      {step === "password" && (
        <>
          <h2 className="text-xl text-center font-bold text-gray-800 mb-2 mt-2">
            Set New Password
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            Enter a strong password to reset your account
          </p>
          <form
            className="w-full 
              max-w-md 
              sm:max-w-lg 
              md:max-w-xl 
              lg:max-w-2xl 
              mx-auto"
            onSubmit={handleResetPassword}
          >
            <div className="mb-1 relative">
              <label
                htmlFor="newPassword"
                className="block mb-2 text-sm font-medium text-black"
              >
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10
                  placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-3 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
              </button>
            </div>
            <div className="mb-4">
              <span
                className={`block text-xs mt-1 ${getStrengthColor(
                  passwordStrength
                )}`}
              >
                {newPassword ? getStrengthLabel(passwordStrength) : ""}
              </span>
            </div>
            <div className="mb-5 relative">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-medium text-black"
              >
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10
                  placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 bottom-3 pr-3 flex items-center text-gray-500"
              >
                {showConfirmPassword ? (
                  <HiEye size={20} />
                ) : (
                  <HiEyeOff size={20} />
                )}
              </button>
            </div>
            {confirmPassword && (
              <div className="mb-5">
                <span
                  className={`text-xs ${
                    newPassword === confirmPassword
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {newPassword === confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </span>
              </div>
            )}
            {error && (
              <div className="mb-5 text-red-600 text-center font-medium text-xs">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 
                focus:ring-4 focus:outline-black focus:ring-blue-300 
                font-medium rounded-lg text-sm px-5 py-2.5 text-center
                mx-auto block sm:w-40 md:w-48 w-full"
            >
              Reset Password
            </Button>
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setEmail("");
                  setResetCode("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Cancel and Start Over
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
