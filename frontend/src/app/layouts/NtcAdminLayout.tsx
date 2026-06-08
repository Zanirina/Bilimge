import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdOutlineDashboard, MdOutlineSchool } from "react-icons/md";
import { TbLayoutList, TbSpeakerphone } from "react-icons/tb";
import Sidebar from "../../shared/ui/Sidebar";
import type { SidebarItem } from "../../shared/ui/Sidebar";
import TopBar from "../../shared/ui/TopBar";

export default function NtcAdminLayout() {
  const { t } = useTranslation();

  const sidebarItems: SidebarItem[] = [
    { label: t("ntcAdmin.sidebar.dashboard"),     path: "/ntc/dashboard",     icon: MdOutlineDashboard },
    { label: t("ntcAdmin.sidebar.announcements"), path: "/ntc/announcements", icon: TbSpeakerphone },
    { label: t("ntcAdmin.sidebar.programs"),      path: "/ntc/programs",      icon: TbLayoutList },
    { label: t("ntcAdmin.sidebar.universities"),  path: "/ntc/universities",  icon: MdOutlineSchool },
  ];

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      <Sidebar items={sidebarItems} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar userSubtitle={t("ntcAdmin.subtitle")} />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
