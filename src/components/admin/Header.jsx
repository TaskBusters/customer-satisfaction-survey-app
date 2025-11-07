import React from "react";

const FAKE_ADMIN = {
  name: "Admin",
};

export default function Header({ search, onSearchChange }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
      <h2 className="text-2xl font-semibold">
        Welcome back, <span className="font-bold">@Admin!</span>
      </h2>
    </div>
  );
}
