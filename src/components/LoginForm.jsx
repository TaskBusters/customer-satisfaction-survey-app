import React, { useState } from "react";
import { Button, TextInput, Label, Checkbox } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import Logo from "./Logo";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="bg-[#F4F4F4] rounded-lg shadow-2x1 
                      w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] xl:w-[36rem]
                      p-8 sm:p-8 md:p-10 text-sm md:text-base
                      border-3 border-gray-200"
    >
      <Logo />

      <form className="max-w-sm mx-auto">
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
            placeholder="name@example.com"
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                       focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                       focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10"
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
              className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300"
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
                     font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center"
        >
          Login
        </button>

        {/* Register / Guest */}
        <p className="text-sm text-center mt-4">
          No account?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Register here
          </a>
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
