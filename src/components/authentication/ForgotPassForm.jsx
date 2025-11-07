import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "flowbite-react";
import Logo from "./Logo";
import backgroundImage from "../../assets/valenzuela-background.png";
import "flowbite";

export default function ForgotPassForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      setSent(false);
      setError("");
    }
  }, [email]);

  // Backend-ready password reset request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      setSent(false);
      return;
    }
    setError("");
    try {
      // Post email to API endpoint - adjust URL if needed
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data?.error || "Something went wrong. Try again.");
        setSent(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setSent(false);
    }
  };

  return (
    <div
      className="bg-[#F4F4F4] rounded-lg shadow-2x1 
        w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] xl:w-[36rem]
        p-8 sm:p-8 md:p-10 text-sm md:text-base
        border-3 border-gray-200"
    >
      <Logo />
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
        onSubmit={handleSubmit}
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
            placeholder="name@example.com"
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
              placeholder-gray-400"
          />
        </div>
        {/* Error feedback */}
        {error && (
          <div className="mb-5 text-red-600 text-center font-medium">
            {error}
          </div>
        )}
        {/* Success feedback */}
        {sent && (
          <div className="mb-5 text-green-700 text-center font-medium">
            If an account exists for <b>{email}</b>, a password reset link was
            sent.
          </div>
        )}
        <Button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 
            focus:ring-4 focus:outline-black focus:ring-blue-300 
            font-medium rounded-lg text-sm px-5 py-2.5 text-center
            mx-auto block sm:w-40 md:w-48 w-full"
        >
          Send Reset Link
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex justify-center mt-8">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
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
    </div>
  );
}
