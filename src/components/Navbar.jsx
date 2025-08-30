// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Logo from "../assets/trak-logo.svg";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-primary font-medium font-inter"
      : "text-text-secondary hover:text-text-primary font-inter";

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src={Logo} alt="Trak Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold text-text-primary font-inter">
              Trak
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-18">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/analytics" className={navLinkClass}>
              Analytics
            </NavLink>
            <NavLink to="/courses" className={navLinkClass}>
              Courses
            </NavLink>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <LogOut />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
