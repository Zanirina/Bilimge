import { Outlet } from "react-router-dom";
import { MdOutlineDashboard, MdOutlineSchool, MdOutlineMenuBook } from "react-icons/md";
import { TbRobot, TbSpeakerphone } from "react-icons/tb";
import { LuBrain } from "react-icons/lu";
import Sidebar from "../../shared/ui/Sidebar";
import type { SidebarItem } from "../../shared/ui/Sidebar";
import TopBar from "../../shared/ui/TopBar";

const sidebarItems: SidebarItem[] = [
  { label: "My Overview",          path: "/applicant/dashboard",     icon: MdOutlineDashboard },
  { label: "Announcements",        path: "/applicant/announcements", icon: TbSpeakerphone },
  { label: "Explore Universities", path: "/applicant/universities",  icon: MdOutlineSchool },
  { label: "Programs & Majors",    path: "/applicant/majors",        icon: MdOutlineMenuBook },
  { label: "Exam Preparation",     path: "/applicant/exams",         icon: LuBrain },
  { label: "AI Assistant",         path: "/applicant/chatbot",       icon: TbRobot },
];

export default function ApplicantLayout() {
  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      <Sidebar items={sidebarItems} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
