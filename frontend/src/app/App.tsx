import { useEffect } from "react";
import { useAuthStore } from "../modules/auth/model/authStore";
import AppRouter from "./router/AppRouter";

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return <AppRouter />;
}