import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MdOutlineDashboard,
  MdOutlineSchool,
  MdOutlineMenuBook,
} from "react-icons/md";
import { TbRobot, TbSpeakerphone } from "react-icons/tb";
import { LuBrain, LuGitCompare, LuCalculator } from "react-icons/lu";
import Sidebar from "../../shared/ui/Sidebar";
import type { SidebarItem } from "../../shared/ui/Sidebar";
import TopBar from "../../shared/ui/TopBar";

export default function ApplicantLayout() {
  const { t } = useTranslation();

  const sidebarItems: SidebarItem[] = [
    { label: t("sidebar.overview"), path: "/applicant/dashboard", icon: MdOutlineDashboard },
    { label: t("sidebar.announcements"), path: "/applicant/announcements", icon: TbSpeakerphone },
    { label: t("sidebar.exploreUniversities"), path: "/applicant/universities", icon: MdOutlineSchool },
    { label: t("sidebar.compareUniversities"), path: "/applicant/comparison", icon: LuGitCompare },
    { label: t("sidebar.programsMajors"), path: "/applicant/majors", icon: MdOutlineMenuBook },
    { label: t("sidebar.examPreparation"), path: "/applicant/exams", icon: LuBrain },
    { label: t("sidebar.chanceCalculator"), path: "/applicant/calculator", icon: LuCalculator },
    { label: t("sidebar.aiAssistant"), path: "/applicant/chatbot", icon: TbRobot, type: "ai-chat" as const },
  ];

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
