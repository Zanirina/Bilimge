import type React from "react";
import { RequireAuth } from "./guards";
import RootLayout from "../layouts/RootLayout";
import ApplicantLayout from "../layouts/ApplicantLayout";
import NtcAdminLayout from "../layouts/NtcAdminLayout";
import UniversityAdminLayout from "../layouts/UniversityAdminLayout";
import SignInPage from "../../modules/auth/ui/SignInPage";
import SignUpPage from "../../modules/auth/ui/SignUpPage";
import ResetPasswordPage from "../../modules/auth/ui/ResetPasswordPage";
import ResetPasswordConfirmPage from "../../modules/auth/ui/ResetPasswordConfirmPage";
import HomePage from "../../pages/HomePage";
import ContactsPage from "../../pages/ContactsPage";
import UniversitiesPage from "../../modules/universities/ui/UniversitiesPage";
import UniversityDetailPage from "../../modules/universities/ui/UniversityDetailPage";
import ProgramDetailPage from "../../modules/universities/ui/ProgramDetailPage";
import MajorsPage from "../../modules/majors/ui/MajorsPage";
import ExamsPrepPage from "../../modules/exams/ui/ExamsPrepPage";
import AIAssistantPage from "../../modules/chatbot/ui/AIAssistantPage";
import ApplicantDashboardPage from "../../modules/applicant/ui/ApplicantDasboardPage";
import AnnouncementsPage from "../../modules/announcements/ui/AnnouncementsPage";
import UniDashboardPage from "../../modules/universities/ui/admin/UniDashboardPage";
import UniProfilePage from "../../modules/universities/ui/admin/UniProfilePage";
import UniProgramsPage from "../../modules/universities/ui/admin/UniProgramsPage";
import UniAnnouncementsPage from "../../modules/announcements/ui//UniAnnouncementsPage";
import UniApplicantsPage from "../../modules/universities/ui/admin/UniApplicantsPage";
import UniSettingsPage from "../../modules/universities/ui/admin/UniSettingsPage";
import NtcDashboardPage from "../../modules/ntc/ui/NtcDashboardPage";
import NtcAnnouncementsPage from "../../modules/announcements/ui/NtcAnnouncementsPage";
import NtcUniversitiesPage from "../../modules/universities/ui/NtcUniversitiesPage";
import NtcSettingsPage from "../../modules/ntc/ui/NtcSettingsPage";
import NtcProgramsPage from "../../modules/ntc/ui/NtcProgramsPage";
import ComparisonPage from "../../modules/comparison/ui/ComparisonPage";
import AccountProfilePage from "../../modules/auth/ui/ProfilePage";
import AccountSettingsPage from "../../modules/auth/ui/SettingsPage";
import AboutPage from "../../pages/AboutPage";
import NotFoundPage from "../../pages/NotFoundPage";


export type AppRoute = {
    path?: string;
    index?: boolean;
    element?: React.ReactNode;
    children?: AppRoute[];
};

export const routes: AppRoute[] = [
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "universities", element: <UniversitiesPage /> },
            { path: "universities/:code", element: <UniversityDetailPage /> },
            { path: "programs/:code", element: <ProgramDetailPage /> },
            { path: "majors", element: <MajorsPage /> },
            { path: "exams", element: <ExamsPrepPage /> },
            { path: "chatbot", element: <AIAssistantPage /> },
            { path: "about", element: <AboutPage /> },
            { path: "contacts", element: <ContactsPage /> },
        ],
    },
    {
        path: "/auth",
        children: [
            { path: "login", element: <SignInPage /> },
            { path: "register", element: <SignUpPage /> },
            { path: "password", element: <ResetPasswordPage /> },
            { path: "reset-password", element: <ResetPasswordConfirmPage /> },
        ],
    },
    {
        path: "/applicant",
        element: <RequireAuth roles={["APPLICANT"]} />,
        children: [
            {
                element: <ApplicantLayout />,
                children: [
                    { path: "dashboard", element: <ApplicantDashboardPage /> },
                    { path: "announcements", element: <AnnouncementsPage /> },
                    { path: "universities", element: <UniversitiesPage /> },
                    { path: "universities/:code", element: <UniversityDetailPage /> },
                    { path: "programs/:code", element: <ProgramDetailPage /> },
                    { path: "majors", element: <MajorsPage /> },
                    { path: "exams", element: <ExamsPrepPage /> },
                    { path: "chatbot", element: <AIAssistantPage /> },
                    { path: "profile", element: <AccountProfilePage /> },
                    { path: "settings", element: <AccountSettingsPage /> },
                    { path: "comparison", element: <ComparisonPage /> }
                ],
            },
        ],
    },
    {
        path: "/ntc",
        element: <RequireAuth roles={["NTC_ADMIN"]} />,
        children: [
            {
                element: <NtcAdminLayout />,
                children: [
                    { path: "dashboard", element: <NtcDashboardPage /> },
                    { path: "announcements", element: <NtcAnnouncementsPage /> },
                    { path: "programs", element: <NtcProgramsPage /> },
                    { path: "universities", element: <NtcUniversitiesPage /> },
                    { path: "account", element: <AccountProfilePage /> },
                    { path: "settings", element: <NtcSettingsPage /> },
                ],
            },
        ],
    },
    {
        path: "/uni",
        element: <RequireAuth roles={["UNI_ADMIN"]} />,
        children: [
            {
                element: <UniversityAdminLayout />,
                children: [
                    { path: "dashboard", element: <UniDashboardPage /> },
                    { path: "profile", element: <UniProfilePage /> },
                    { path: "programs", element: <UniProgramsPage /> },
                    { path: "updates", element: <UniAnnouncementsPage /> },
                    { path: "applicants", element: <UniApplicantsPage /> },
                    { path: "account", element: <AccountProfilePage /> },
                    { path: "settings", element: <UniSettingsPage /> },
                ],
            },
        ],
    },
    { path: "*", element: <NotFoundPage /> },
];
