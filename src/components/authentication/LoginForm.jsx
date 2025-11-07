import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import Logo from "./Logo";
import { useAuth } from "../../context/AuthContext";
import { Toast } from "flowbite-react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("bg-green-500/90 text-white"); // Success by default

  const { login } = useAuth();
  const navigate = useNavigate();

  const showToastWithDelay = (message, color, callback) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      if (callback) callback();
    }, 2000);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!email || !password) {
  //     showToastWithDelay(
  //       "Please enter both email and password",
  //       "bg-red-600/90 text-white"
  //     );
  //     return;
  //   }
  //   try {
  //     const res = await fetch("/api/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password, remember }),
  //     });
  //     if (res.ok) {
  //       // Parse full user info (with admin flag)
  //       const user = await res.json(); // backend returns { email, isAdmin: true, ... }
  //       login(user); // store entire user

  //       showToastWithDelay(
  //         "Login successful!",
  //         "bg-green-500/90 text-white",
  //         () => {
  //           // Redirect based on admin/non-admin
  //           if (user.isAdmin || user.role === "admin") {
  //             navigate("/admin");
  //           } else {
  //             navigate("/surveyform");
  //           }
  //         }
  //       );
  //     } else {
  //       showToastWithDelay("Login failed!", "bg-red-600/90 text-white");
  //     }
  //   } catch (err) {
  //     showToastWithDelay("Network error", "bg-red-600/90 text-white");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToastWithDelay(
        "Please enter both email and password",
        "bg-red-600/90 text-white"
      );
      return;
    }

    // ---- FRONTEND DEV ONLY ----
    // Magic admin user
    let user = { email };

    if (email === "admin@example.com") {
      if (password === "Admin123!") {
        user.isAdmin = true;
        user.role = "admin";
      } else {
        showToastWithDelay(
          "Incorrect password for admin!",
          "bg-red-600/90 text-white"
        );
        return;
      }
    }

    login(user);

    showToastWithDelay(
      "Login successful!",
      "bg-green-500/90 text-white",
      () => {
        if (user.isAdmin || user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/surveyform");
        }
      }
    );
  };

  return (
    <div className="bg-[#F4F4F4] rounded-lg shadow-2xl w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] xl:w-[36rem] p-8 sm:p-8 md:p-10 text-sm md:text-base border-3 border-gray-200">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
          <Toast className={`${toastColor} shadow-xl`}>
            <span className="font-semibold">{toastMessage}</span>
          </Toast>
        </div>
      )}

      <Logo />
      <h2 className="text-xl text-center font-bold text-gray-800">
        Welcome, User!
      </h2>
      <form
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto"
        onSubmit={handleSubmit}
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 placeholder-gray-400"
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
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300"
            />
            <label
              htmlFor="remember"
              className="ms-2 text-sm font-medium text-gray-900"
            >
              Remember me
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {/* Login Button */}
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-black focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto block w-32 sm:w-40 md:w-48"
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
          <Link to="/" className="text-blue-700 hover:underline">
            Continue as Guest
          </Link>
        </p>
      </form>
    </div>
  );
}
