import React from "react";
import { MdSearch } from "react-icons/md";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <span className="absolute left-3 text-gray-400 z-10">
        <MdSearch size={22} />
      </span>
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
      />
    </div>
  );
}
