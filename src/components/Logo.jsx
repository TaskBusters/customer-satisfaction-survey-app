import React from "react";
import logo from "../assets/valenzuela-logo.png";
import "flowbite"; // Import Flowbite JS

export default function Logo() {
  return (
    <div className="flex flex-col items-center mb-4">
      <img
        src={logo}
        alt="Valenzuela City Logo"
        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 mb-2"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
