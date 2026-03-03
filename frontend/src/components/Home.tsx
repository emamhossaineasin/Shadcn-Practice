import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Home = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="flex flex-col h-screen">
      <Navbar onMenuClick={() => setSidebarCollapsed((prev) => !prev)} />
      <div className="flex flex-1 overflow-auto">
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex w-full  justify-center overflow-auto ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
