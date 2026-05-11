import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useUniversityStore } from "../../modules/universities/model/universityStore";
import { MdOutlineDashboard, MdOutlineSettings, MdOutlinePeople } from "react-icons/md";
import { TbBuilding, TbLayoutList, TbSpeakerphone } from "react-icons/tb";
import Sidebar from "../../shared/ui/Sidebar";
import type { SidebarItem } from "../../shared/ui/Sidebar";
import TopBar from "../../shared/ui/TopBar";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard",          path: "/uni/dashboard",  icon: MdOutlineDashboard },
  { label: "University Profile", path: "/uni/profile",    icon: TbBuilding },
  { label: "Programs",           path: "/uni/programs",   icon: TbLayoutList },
  { label: "Post Updates",       path: "/uni/updates",    icon: TbSpeakerphone },
  { label: "Applicants",         path: "/uni/applicants", icon: MdOutlinePeople },
  { label: "Settings",           path: "/uni/settings",   icon: MdOutlineSettings },
];

export default function UniversityAdminLayout() {
  const { myUniversity, fetchMyUniversity } = useUniversityStore();

  useEffect(() => {
    fetchMyUniversity();
  }, []);

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      <Sidebar items={sidebarItems} userSubtitle={myUniversity?.name} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar userSubtitle={myUniversity?.name} />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
