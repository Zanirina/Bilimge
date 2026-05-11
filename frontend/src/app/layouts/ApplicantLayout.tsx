import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/model/authStore";
import { IoIosLogOut } from "react-icons/io";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdOutlineDashboard, MdOutlineSchool, MdOutlineMenuBook } from "react-icons/md";
import { TbRobot, TbSpeakerphone } from "react-icons/tb";
import { LuBrain } from "react-icons/lu";
import Sidebar from "../../shared/ui/Sidebar";
import type { SidebarItem } from "../../shared/ui/Sidebar";

const sidebarItems: SidebarItem[] = [
  { label: "My Overview",          path: "/applicant/dashboard",     icon: MdOutlineDashboard },
  { label: "Announcements",        path: "/applicant/announcements", icon: TbSpeakerphone },
  { label: "Explore Universities", path: "/applicant/universities",  icon: MdOutlineSchool },
  { label: "Programs & Majors",    path: "/applicant/majors",        icon: MdOutlineMenuBook },
  { label: "Exam Preparation",     path: "/applicant/exams",         icon: LuBrain },
  { label: "AI Assistant",         path: "/applicant/chatbot",       icon: TbRobot },
];

export default function ApplicantLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fullName = `${user?.first_name ?? "Name"} ${user?.last_name ?? "Surname"}`.trim();

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      <Sidebar items={sidebarItems} />

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