import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, TextInput, Label, Checkbox } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import Logo from "./Logo";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [district, setDistrict] = useState("");
  const [fullName, setFullName] = useState("");
  const [barangay, setBarangay] = useState("");

  const districts = [
    {
      value: "district1",
      label: "District 1",
      barangays: [
        { value: "arkongBato", label: "Arkong Bato" },
        { value: "balangkas", label: "Balangkas" },
        { value: "bignay", label: "Bignay" },
        { value: "canumayEast", label: "Canumay East" },
        { value: "canumayWest", label: "Canumay West" },
        { value: "coloong", label: "Coloong" },
        { value: "dalandanan", label: "Dalandanan" },
        { value: "isla", label: "Isla" },
        { value: "lawangBato", label: "Lawang Bato" },
        { value: "lingunan", label: "Lingunan" },
        { value: "mabolo", label: "Mabolo" },
        { value: "malanday", label: "Malanday" },
        { value: "malinta", label: "Malinta" },
        { value: "palasan", label: "Palasan" },
        { value: "pariancilloVilla", label: "Pariancillo Villa" },
        { value: "pasolo", label: "Pasolo" },
        { value: "poblacion", label: "Poblacion" },
        { value: "polo", label: "Polo" },
        { value: "punturin", label: "Punturin" },
        { value: "rincon", label: "Rincon" },
        { value: "tagalag", label: "Tagalag" },
        { value: "veinteReales", label: "Veinte Reales" },
        { value: "wawangPulo", label: "Wawang Pulo" },
      ],
    },
    {
      value: "district2",
      label: "District 2",
      barangays: [
        { value: "bagbaguin", label: "Bagbaguin" },
        { value: "genTDeLeon", label: "Gen. T. de Leon" },
        { value: "karuhatan", label: "Karuhatan" },
        { value: "mapulangLupa", label: "Mapulang Lupa" },
        { value: "marulas", label: "Marulas" },
        { value: "maysan", label: "Maysan" },
        { value: "parada", label: "Parada" },
        { value: "pasoDeBlas", label: "Paso de Blas" },
        { value: "ugong", label: "Ugong" },
      ],
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault(); // THIS prevents the page refresh!
    // Basic validation
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    // Further logic here (API call, etc.)
    console.log("Logging in with:", email, password);
  };

  return (
    <div
      className="
    bg-[#F4F4F4] rounded-lg shadow-2x1
    w-full max-w-xl   /* Limits max width for big screens, but fills mobile */
    mx-auto           /* Always centered horizontally */
    p-8 sm:p-10       /* Responsive padding for breathing room */
    text-base
    border-3 border-gray-200
    min-h-[400px] 
    "
    >
      <Logo />
      <h2 className="text-xl text-center font-bold text-gray-800">
        Register a New Account
      </h2>

      <form
        className="w-full 
                    max-w-md 
                    sm:max-w-lg 
                    md:max-w-xl 
                    lg:max-w-2xl 
                    mx-auto
                  "
        onSubmit={handleSubmit}
      >
        {/* Full Name */}
        <div className="mb-5">
          <label
            htmlFor="fullName"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                        focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                        placeholder-gray-400"
          />
        </div>

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
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

        {/* Confirm Password */}
        <div className="mb-5 relative">
          <label
            htmlFor="confirmPassword"
            className="block mb-2 text-sm font-medium text-gray-900"
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 placeholder-gray-400"
          />
          {/* Eye icon toggle; add logic later */}
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-0 bottom-3 pr-3 flex items-center text-gray-500"
          >
            {showConfirmPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
          </button>
        </div>

        {/* District dropdown */}
        <div className="mb-5">
          <label
            htmlFor="district"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            District
          </label>
          <select
            id="district"
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setBarangay(""); // Reset barangay when district changes
            }}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="">Select your district</option>
            {districts.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Barangay dropdown */}
        <div className="mb-5">
          <label
            htmlFor="barangay"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Barangay
          </label>
          <select
            id="barangay"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            required
            disabled={!district}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="">
              {district ? "Select your Barangay" : "Select a District first"}
            </option>
            {district &&
              districts
                .find((d) => d.value === district)
                ?.barangays.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
          </select>
        </div>
        <Link to="/" className="text-blue-500 hover:underline">
          Back to Login
        </Link>

        {/* Register button */}
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 
             focus:ring-4 focus:outline-black focus:ring-blue-300 
             font-medium rounded-lg text-sm px-5 py-2.5 text-center
             mx-auto block w-32 sm:w-40 md:w-48"
        >
          Register
        </button>
      </form>
    </div>
  );
}
