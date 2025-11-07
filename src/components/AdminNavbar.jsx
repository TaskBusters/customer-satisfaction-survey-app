import React from "react";
import { Navbar, Dropdown, Avatar } from "flowbite-react";
import { Link } from "react-router-dom";
import {
  HiOutlineMenu,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineUser,
} from "react-icons/hi";

// Main top navbar
export default function AdminNavbar({ onLogout }) {
  return (
    <Navbar fluid rounded className="bg-gray-800 border-b border-gray-700 px-4">
      {/* Brand/logo */}
      <Navbar.Brand as={Link} to="/admin">
        <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-100">
          Admin Dashboard
        </span>
      </Navbar.Brand>
      {/* Action section */}
      <div className="flex items-center gap-4">
        {/* Flyout menu as Dropdown */}
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <span className="flex items-center gap-2 cursor-pointer text-gray-100">
              <HiOutlineMenu className="h-6 w-6" />
              <Avatar
                alt="Admin"
                size="sm"
                rounded
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                className="ml-1"
              />
            </span>
          }
        >
          <Dropdown.Header>
            <span className="block text-sm font-bold text-gray-800">Admin</span>
            <span className="block truncate text-xs text-gray-600">
              admin@example.com
            </span>
          </Dropdown.Header>
          <Dropdown.Item as={Link} to="/admin/overview">
            <HiOutlineUser className="h-5 w-5 mr-2 inline" /> Overview
          </Dropdown.Item>
          <Dropdown.Item as={Link} to="/admin/surveys">
            <HiOutlineMenu className="h-5 w-5 mr-2 inline" /> Surveys
          </Dropdown.Item>
          <Dropdown.Item as={Link} to="/admin/responses">
            <HiOutlineMenu className="h-5 w-5 mr-2 inline" /> Responses
          </Dropdown.Item>
          <Dropdown.Item as={Link} to="/admin/reports">
            <HiOutlineMenu className="h-5 w-5 mr-2 inline" /> Reports
          </Dropdown.Item>
          <Dropdown.Item as={Link} to="/admin/profile">
            <HiOutlineUser className="h-5 w-5 mr-2 inline" /> Profile & Security
          </Dropdown.Item>
          <Dropdown.Item as={Link} to="/admin/settings">
            <HiOutlineCog className="h-5 w-5 mr-2 inline" /> Settings
          </Dropdown.Item>
          {/* Separator and Back */}
          <Dropdown.Divider />
          <Dropdown.Item
            as={Link}
            to="/"
            className="text-blue-700 font-semibold"
          >
            Back to Main Menu
          </Dropdown.Item>
          <Dropdown.Item onClick={onLogout} className="text-red-600">
            <HiOutlineLogout className="h-5 w-5 mr-2 inline" /> Logout
          </Dropdown.Item>
        </Dropdown>
      </div>
    </Navbar>
  );
}
