import { Outlet } from "react-router-dom";
import { MdOutlineDashboard, MdOutlineSettings, MdOutlineSchool } from "react-icons/md";
import { TbLayoutList, TbSpeakerphone } from "react-icons/tb";
import Sidebar from "../../shared/ui/Sidebar";
import type { SidebarItem } from "../../shared/ui/Sidebar";
import TopBar from "../../shared/ui/TopBar";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard",            path: "/ntc/dashboard",     icon: MdOutlineDashboard },
  { label: "Post Announcements",   path: "/ntc/announcements", icon: TbSpeakerphone },
  { label: "Manage Programs",      path: "/ntc/programs",      icon: TbLayoutList },
  { label: "Manage Universities",  path: "/ntc/universities",  icon: MdOutlineSchool },
  { label: "Settings",             path: "/ntc/settings",      icon: MdOutlineSettings },
];

export default function NtcAdminLayout() {
  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      <Sidebar items={sidebarItems} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar userSubtitle="National Testing Center" />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
