import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/model/authStore";
import { useEffect } from "react";
import { useUniversityStore } from "../../modules/universities/model/universityStore";
import { IoIosLogOut } from "react-icons/io";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdOutlineDashboard, MdOutlineSettings, MdOutlinePeople } from "react-icons/md";
import { TbBuilding, TbLayoutList, TbSpeakerphone } from "react-icons/tb";
import Sidebar from "../../shared/ui/Sidebar";
import type { SidebarItem } from "../../shared/ui/Sidebar";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard",          path: "/uni/dashboard",  icon: MdOutlineDashboard },
  { label: "University Profile", path: "/uni/profile",    icon: TbBuilding },
  { label: "Programs",           path: "/uni/programs",   icon: TbLayoutList },
  { label: "Post Updates",       path: "/uni/updates",    icon: TbSpeakerphone },
  { label: "Applicants",         path: "/uni/applicants", icon: MdOutlinePeople },
  { label: "Settings",           path: "/uni/settings",   icon: MdOutlineSettings },
];

export default function UniversityAdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { myUniversity, fetchMyUniversity } = useUniversityStore();

  useEffect(() => {
    fetchMyUniversity(); // ← fetch uni name for sidebar
  }, []);

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      <Sidebar items={sidebarItems} userSubtitle={myUniversity?.name} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white flex items-center justify-end px-8 gap-4 shadow-sm flex-shrink-0">
          <button className="relative text-gray-500 hover:text-[#3356AA] transition">
            <IoNotificationsOutline size={22} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button className="text-sm font-medium text-gray-500 hover:text-[#3356AA] transition px-2 py-1 border border-gray-200 rounded-md">
            EN
          </button>

          <div className="w-px h-6 bg-gray-200" />

          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-500 transition"
            title="Log out"
          >
            <IoIosLogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}