import React from "react";
import logo from "../assets/valenzuela-logo.png";
import "flowbite"; // Import Flowbite JS

export default function Logo() {
  return (
    <div className="flex flex-col items-center mb-4">
      <img src={logo} alt="Valenzuela City Logo" className="w-20 h-20 mb-2" />
      <h2 className="text-xl font-bold text-gray-800">Welcome, User!</h2>
    </div>
  );
}
