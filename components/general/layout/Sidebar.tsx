import React, { useState } from "react";
import { FiLogOut, FiShield } from "react-icons/fi";
import { FormattedMessage } from "react-intl";
import SidebarItem from "./SidebarItem";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

const Sidebar = () => {
  const [isFirewallOpen, setIsFirewallOpen] = useState(true);
  const { pathname } = useRouter();
  const isSidebarOpen = true;
  
  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Brand Header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-50 p-2 rounded-lg">
            <FiShield className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-semibold text-lg text-gray-800">
            Firewall<span className="text-blue-600">Manager</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav>
          <ul className="px-3 space-y-1">
            <SidebarItem
              isSidebarOpen={isSidebarOpen}
              icon={<FiShield className="w-5 h-5 text-gray-500" />}
              message={
                <FormattedMessage id="firewalls" defaultMessage="Firewalls" />
              }
              isCollapsible
              isOpen={isFirewallOpen}
              toggleOpen={() => setIsFirewallOpen(!isFirewallOpen)}
              className="text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150 font-medium"
            >
              <div className="ml-8 mt-1 space-y-0.5">
                <SidebarItem
                  href="/firewalls/request-access"
                  icon={<span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                  isSidebarOpen={isSidebarOpen}
                  message={
                    <FormattedMessage
                      id="firewallAccess"
                      defaultMessage="Request Access"
                    />
                  }
                  isActive={pathname === "/firewalls/request-access"}
                  className={`text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150 ${
                    pathname === "/firewalls/request-access" 
                      ? "bg-blue-50 text-blue-700 font-medium" 
                      : ""
                  }`}
                />
                <SidebarItem
                  href="/firewalls/requests"
                  icon={<span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                  isSidebarOpen={isSidebarOpen}
                  message={
                    <FormattedMessage id="requests" defaultMessage="Requests" />
                  }
                  isActive={pathname === "/firewalls/requests"}
                  className={`text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150 ${
                    pathname === "/firewalls/requests" 
                      ? "bg-blue-50 text-blue-700 font-medium" 
                      : ""
                  }`}
                />
              </div>
            </SidebarItem>
          </ul>
        </nav>
      </div>

      {/* Logout Section */}
      <div className="p-3 border-t border-gray-200">
        <SidebarItem
          icon={<FiLogOut className="w-5 h-5 text-gray-500" />}
          isSidebarOpen={isSidebarOpen}
          message={<FormattedMessage id="logout" defaultMessage="Logout" />}
          onClick={() => {
            if (window.confirm("Are you sure you want to logout?")) {
              signOut({ callbackUrl: "/" });
            }
          }}
          className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
        />
      </div>
    </div>
  );
};

export default Sidebar;