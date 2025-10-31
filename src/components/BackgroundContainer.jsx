import React from "react";
import backgroundImage from "../assets/valenzuela-background.png";
import "flowbite"; // Import Flowbite JS

export default function BackgroundContainer({ children }) {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {children}
    </div>
  );
}
