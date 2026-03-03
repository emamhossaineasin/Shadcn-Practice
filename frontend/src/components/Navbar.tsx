import { Button } from "@/components/ui/button";
import { Bell, Home, ListTodo, Mail, Menu, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import cu_logo from "../assets/cu_logo.png";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const isActive = location.pathname === "/";

  return (
    <nav className="flex items-center justify-between gap-2 px-2 sm:px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Left section - Logo & Menu */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
        <a href="/" className="flex items-center">
          <img src={cu_logo} alt="CU Logo" className="h-5 sm:h-6" />
        </a>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className={`
            gap-2
            border border-transparent
            transition-colors
            hover:border-border
            hover:bg-muted
            cursor-pointer
            ${isActive ? "bg-sky-200 border-border" : ""}
          `}
        >
          <Home className="h-4 w-4" />
          <span className="hidden lg:inline">Home</span>
        </Button>
        <Button
          variant="ghost"
          className="
            gap-2
            border border-transparent
            transition-colors
            hover:border-border
            hover:bg-muted
            cursor-pointer
          "
          data-active="true"
        >
          <ListTodo />
          <span className="hidden lg:inline">Action Items</span>
        </Button>
        <Button
          variant="ghost"
          className="
            gap-2
            border border-transparent
            transition-colors
            hover:border-border
            hover:bg-muted
            cursor-pointer
          "
          data-active="true"
        >
          <Bell />
          <span className="hidden lg:inline">Alerts</span>
        </Button>
        <Button
          variant="ghost"
          className="
            gap-2
            border border-transparent
            transition-colors
            hover:border-border
            hover:bg-muted
            cursor-pointer
          "
          data-active="true"
        >
          <Mail />
          <span className="hidden lg:inline">Notifications</span>
        </Button>

        <button
          className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="User profile"
        >
          <UserCircle size={30} className="text-gray-600" />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
