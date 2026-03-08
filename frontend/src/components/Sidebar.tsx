import { ClipboardList, Users } from "lucide-react";
import { Menu, MenuItem, Sidebar as ProSidebar } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  return (
    <ProSidebar
      collapsed={collapsed}
      width="180px"
      collapsedWidth="65px"
      className="h-full"
      rootStyles={{
        borderRight: "1px solid #e5e7eb",
        backgroundColor: "#f9fafb",
      }}
    >
      <Menu>
        <MenuItem
          icon={<ClipboardList size={20} />}
          component={<Link to="/department" />}
          className={isActive("/department") ? "font-medium text-red-800" : ""}
        >
          Department
        </MenuItem>
        <MenuItem
          icon={<Users size={20} />}
          component={<Link to="/student" />}
          className={isActive("/student") ? "font-medium text-red-800" : ""}
        >
          Student
        </MenuItem>
        <MenuItem
          icon={<ClipboardList size={20} />}
          component={<Link to="/dept" />}
          className={isActive("/dept") ? "font-medium text-red-800" : ""}
        >
          Dept
        </MenuItem>
        <MenuItem
          icon={<Users size={20} />}
          component={<Link to="/std" />}
          className={isActive("/std") ? "font-medium text-red-800" : ""}
        >
          Std
        </MenuItem>
      </Menu>
    </ProSidebar>
  );
}
