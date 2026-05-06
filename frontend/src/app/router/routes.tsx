import type React from "react";
import RootLayout from "../layouts/RootLayout";
import LoginPage from "../../modules/auth/ui/LoginPage";
import RegisterPage from "../../modules/auth/ui/RegisterPage";
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
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
            { path: "universities", element: <UniversitiesPage /> },
            { path: "majors", element: <MajorsPage /> },
            { path: "exams", element: <ExamsPage /> },
            { path: "chatbot", element: <AIAssistantPage /> },
            { path: "about", element: <AboutPage /> }
        ],
    },
    { path: "*", element: <NotFoundPage /> },
];
