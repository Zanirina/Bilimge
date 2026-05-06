import { Outlet } from "react-router-dom";
import Header from "../../shared/ui/Header";
import Footer from "../../shared/ui/Footer";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
}