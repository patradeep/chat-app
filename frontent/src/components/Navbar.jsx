import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  const { logout1, authUser } = useAuthStore();

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          <span className="text-primary">Chat</span>App
        </Link>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 h-10 rounded-full bg-primary relative">
              <User className="text-white absolute top-1/2 left-1/2 transform -translate-1/2  w-5 h-5" />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            {authUser && (
              <>
                <li>
                  <Link to="/profile" className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </Link>
                </li>
                <li>
                  <button onClick={logout1}>
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </li>
              </>
            )}
            <li>
              <Link to="/settings">
                <Settings size={16} className="mr-2" />
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
