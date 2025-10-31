import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, TextInput, Label, Checkbox } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import Logo from "./Logo";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation (optional)
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    // Further logic here (API call, etc.)
    console.log("Logging in with:", email, password);
  };

  // Login form JSX
  return (
    <div
      className="bg-[#F4F4F4] rounded-lg shadow-2x1 
                      w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] xl:w-[36rem]
                      p-8 sm:p-8 md:p-10 text-sm md:text-base
                      border-3 border-gray-200"
    >
      <Logo />
      <h2 className="text-xl text-center font-bold text-gray-800">
        Welcome, User!
      </h2>

      <form
        className="w-full 
                  max-w-md 
                  sm:max-w-lg 
                  md:max-w-xl 
                  lg:max-w-2xl 
                  mx-auto
                "
      >
        {/* Email */}
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900"
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

        {/* Password */}
        <div className="mb-5 relative">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                       focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10]
                       placeholder-gray-400"
          />
          {/* Eye icon toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 bottom-3 pr-3 flex items-center text-gray-500"
          >
            {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
          </button>
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 border border-gray-300 rounded-sm 
                      bg-gray-50 focus:ring-3 focus:ring-blue-300"
            />
            <label
              htmlFor="remember"
              className="ms-2 text-sm font-medium text-gray-900"
            >
              Remember me
            </label>
          </div>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 
             focus:ring-4 focus:outline-black focus:ring-blue-300 
             font-medium rounded-lg text-sm px-5 py-2.5 text-center
             mx-auto block w-32 sm:w-40 md:w-48"
        >
          Login
        </button>

        {/* Register / Guest */}
        <p className="text-sm text-center mt-4">
          No account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
        <p className="text-sm text-center mt-2">
          <a href="#" className="text-blue-700 hover:underline">
            Continue as Guest
          </a>
        </p>
      </form>
    </div>
  );
}
