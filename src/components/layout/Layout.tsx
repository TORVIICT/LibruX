import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import "./Layout.scss";

export default function Layout() {
    return (
    <div className="layout-page">
      <Sidebar />
      <Navbar />
      <div className="main-container">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
    );
};