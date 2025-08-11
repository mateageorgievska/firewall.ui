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
    <div className="flex flex-col h-screen w-64 text-white">
      <div className="justify-between flex-grow lg:block z-50 transition-all duration-300 ease-in-out">
        <nav>
          <ul className="p-4 space-y-1">
            <SidebarItem
              isSidebarOpen={isSidebarOpen}
              icon={<FiShield className="w-5 h-5" />}
              message={
                <FormattedMessage id="firewalls" defaultMessage="Firewalls" />
              }
              isCollapsible
              isOpen={isFirewallOpen}
              toggleOpen={() => setIsFirewallOpen(!isFirewallOpen)}
            >
              <SidebarItem
                href="/firewalls/request-access"
                icon={<span className="w-4 h-4 ml-1">→</span>}
                isSidebarOpen={isSidebarOpen}
                message={
                  <FormattedMessage
                    id="firewallAccess"
                    defaultMessage="Request Access"
                  />
                }
                isActive={pathname === "/firewalls/request-access"}
              />
              <SidebarItem
                href="/firewalls/requests"
                icon={<span className="w-4 h-4 ml-1">→</span>}
                isSidebarOpen={isSidebarOpen}
                message={
                  <FormattedMessage id="requests" defaultMessage="Requests" />
                }
                isActive={pathname === "/firewalls/requests"}
              />
            </SidebarItem>
          </ul>
        </nav>
        <div className="p-4">
          <SidebarItem
            icon={<FiLogOut className="w-4 h-4 ml-1" />}
            isSidebarOpen={isSidebarOpen}
            message={<FormattedMessage id="logout" defaultMessage="Logout" />}
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                signOut({ callbackUrl: "/" });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
