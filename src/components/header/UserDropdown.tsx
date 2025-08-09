"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { adminLogout } from "../../services/authService";
import {
  User,
  LogOut,
  ChevronDown,
  Moon,
  Sun
} from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Get user initials
  const userInitials = useMemo(() => {
    if (!username) return "A";
    return username.charAt(0).toUpperCase();
  }, [username]);

  // Get user display name
  const userDisplayName = useMemo(() => {
    return username || "Admin User";
  }, [username]);

  // Check for dark mode on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    // static user from localStorage
    try {
      const u = localStorage.getItem('admin_user');
      setUsername(u);
    } catch {}
    setLoading(false);
  }, []);
 
    

  // Event handlers
  const handleSignOut = useCallback(() => {
    adminLogout();
    window.location.href = "/signin";
  }, []);

  const toggleDropdown = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  }, []);

  // Memoize user avatar component
  const UserAvatar = useMemo(() => (
    <div className="relative mr-3 overflow-hidden rounded-full h-11 w-11 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <span className="text-white font-semibold text-sm">
        {userInitials}
      </span>
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
    </div>
  ), [userInitials]);

  // Memoize dropdown trigger
  const DropdownTrigger = useMemo(() => (
    <button 
      onClick={toggleDropdown} 
      className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {UserAvatar}
      <div className="flex flex-col items-start mr-2">
        <span className="block font-medium text-sm text-gray-900 dark:text-white">
          {loading ? "Loading..." : userDisplayName}
        </span>
        <span className="block text-xs text-gray-500 dark:text-gray-400">
          Administrator
        </span>
      </div>
      <ChevronDown
        className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  ), [UserAvatar, userDisplayName, loading, isOpen, toggleDropdown]);

  // Menu items
  const MenuItems = useMemo(() => [
    {
      id: "profile",
      icon: User,
      label: "Edit Profile",
      href: "/profile",
      color: "text-blue-600 dark:text-blue-400"
    },
  ], []);

  // Menu sections
  const MenuSections = useMemo(() => (
    <>
      {/* User Info Section */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {userInitials}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {loading ? "Loading..." : userDisplayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No email
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">
              Administrator
            </p>
          </div>
        </div>
      </div>

      {/* Main Menu Items */}
      <div className="py-2">
        {MenuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <DropdownItem
              key={item.id}
              onItemClick={closeDropdown}
              tag="a"
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
            >
              <IconComponent className={`w-4 h-4 ${item.color}`} />
              <span>{item.label}</span>
            </DropdownItem>
          );
        })}
      </div>

      {/* Theme Toggle */}
      <div className="py-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4 text-yellow-500" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Sign Out */}
      <div className="py-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-150 rounded-lg mx-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  ), [MenuItems, userDisplayName, loading, userInitials, closeDropdown, darkMode, toggleDarkMode, handleSignOut]);

  return (
    <div className="relative">
      {DropdownTrigger}

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl backdrop-blur-sm"
      >
        {MenuSections}
      </Dropdown>
    </div>
  );
}
