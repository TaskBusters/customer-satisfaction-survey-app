import React from "react";
import "flowbite"; // Import Flowbite JS

export default function BackgroundContainer({ children }) {
  return (
    // 1. The main container is now the solid background color (e.g., blue-700)
    <div className="min-h-screen bg-blue-700">
      <div className="min-h-screen w-full bg-black/50 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
