import type React from "react";
import RootLayout from "../layouts/RootLayout";
import SignInPage from "../../modules/auth/ui/SignInPage";
import SignUpPage from "../../modules/auth/ui/SignUpPage";
import ResetPasswordPage from "../../modules/auth/ui/ResetPasswordPage";
import HomePage from "../../pages/HomePage";
import UniversitiesPage from "../../modules/universities/ui/UniversitiesPage";
import MajorsPage from "../../modules/majors/ui/MajorsPage";
import ExamsPage from "../../modules/exams/ui/ExamsPage";
import AIAssistantPage from "../../modules/chatbot/ui/AIAssistantPage";
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
            { path: "majors", element: <MajorsPage /> },
            { path: "exams", element: <ExamsPage /> },
            { path: "chatbot", element: <AIAssistantPage /> },
            { path: "about", element: <AboutPage /> },
        ],
    },
    {
        path: "/auth",
        children: [
            {path: "login", element: <SignInPage /> },
            {path: "register", element: <SignUpPage /> },
            {path: "password", element:  <ResetPasswordPage/>},
        ],
    },
    { path: "*", element: <NotFoundPage /> },
];
