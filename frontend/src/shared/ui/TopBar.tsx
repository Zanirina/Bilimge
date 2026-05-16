import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/model/authStore";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import LanguageSwitcher from "./LanguageSwitcher";

interface TopBarProps {
  userSubtitle?: string;
  profilePath?: string;
  settingsPath?: string;
}

const ROLE_PATHS: Record<string, { profile: string; settings: string }> = {
  APPLICANT: { profile: "/applicant/profile", settings: "/applicant/settings" },
  UNI_ADMIN: { profile: "/uni/account", settings: "/uni/settings" },
  NTC_ADMIN: { profile: "/ntc/account", settings: "/ntc/settings" },
};

export default function TopBar({
  userSubtitle,
  profilePath,
  settingsPath,
}: TopBarProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const defaults = (user?.role ? ROLE_PATHS[user.role] : undefined) ?? ROLE_PATHS.APPLICANT;
  const resolvedProfilePath = profilePath ?? defaults.profile;
  const resolvedSettingsPath = settingsPath ?? defaults.settings;

  const fullName = `${user?.first_name ?? "Name"} ${user?.last_name ?? "Surname"}`.trim();
  const displayName = fullName || user?.email || "";
  const initials = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white flex items-center justify-end px-8 gap-3 border-b border-gray-100 flex-shrink-0">
      {/* Language switcher */}
      <LanguageSwitcher />

      <div className="w-px h-6 bg-gray-200" />

      {/* Notifications */}
      <button className="relative p-2 text-gray-500 hover:text-[#3356AA] hover:bg-gray-50 rounded-lg transition-colors">
        <IoNotificationsOutline size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E95C4B] rounded-full" />
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* User dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#3356AA] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-[#111928]">{displayName}</span>
            <span className="text-xs text-gray-400">{userSubtitle ?? user?.email}</span>
          </div>
          {open ? (
            <MdKeyboardArrowUp size={18} className="text-gray-400" />
          ) : (
            <MdKeyboardArrowDown size={18} className="text-gray-400" />
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            <Link
              to={resolvedProfilePath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] hover:bg-gray-50 transition-colors"
            >
              <FiUser size={15} />
              My Profile
            </Link>
            <Link
              to={resolvedSettingsPath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] hover:bg-gray-50 transition-colors"
            >
              <FiSettings size={15} />
              Settings
            </Link>
            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#E95C4B] hover:bg-red-50 transition-colors"
            >
              <FiLogOut size={15} />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
