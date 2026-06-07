import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUniversityStore } from "../../modules/universities/model/universityStore";
import {
  MdOutlineDashboard,
  MdOutlinePeople,
} from "react-icons/md";
import { TbBuilding, TbLayoutList, TbSpeakerphone } from "react-icons/tb";
import Sidebar from "../../shared/ui/Sidebar";
import type { SidebarItem } from "../../shared/ui/Sidebar";
import TopBar from "../../shared/ui/TopBar";

export default function UniversityAdminLayout() {
  const { t } = useTranslation();
  const { myUniversity, fetchMyUniversity } = useUniversityStore();

  const sidebarItems: SidebarItem[] = [
    { label: t("uniAdmin.sidebar.dashboard"),  path: "/uni/dashboard",  icon: MdOutlineDashboard },
    { label: t("uniAdmin.sidebar.profile"),    path: "/uni/profile",    icon: TbBuilding },
    { label: t("uniAdmin.sidebar.programs"),   path: "/uni/programs",   icon: TbLayoutList },
    { label: t("uniAdmin.sidebar.updates"),    path: "/uni/updates",    icon: TbSpeakerphone },
    { label: t("uniAdmin.sidebar.applicants"), path: "/uni/applicants", icon: MdOutlinePeople },
  ];

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
