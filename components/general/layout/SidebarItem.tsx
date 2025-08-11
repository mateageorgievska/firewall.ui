import React from "react";
import { useRouter } from "next/router";
import { FiChevronDown } from "react-icons/fi";

interface SidebarItemProps {
  href?: string;
  icon: React.ReactNode;
  message: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  isActive?: boolean;
  isSidebarOpen?: boolean;
  isCollapsible?: boolean;
  isOpen?: boolean;
  shouldStayOpen?: boolean;
  toggleOpen?: () => void;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  icon,
  message,
  children,
  className = "",
  isActive = false,
  isSidebarOpen,
  isCollapsible = false,
  isOpen = false,
  shouldStayOpen = false,
  toggleOpen,
  onClick,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    if (href && !isCollapsible) router.push(href);
    if (isCollapsible && toggleOpen) toggleOpen();
  };

  return (
    <div className="mb-1">
      <button
        onClick={handleClick}
        className={`flex items-center p-3 w-full rounded-lg transition-all duration-200  ${
          isActive && !isCollapsible
            ? "bg-sky-700/75 text-white font-medium shadow-md"
            : "text-blue-100 hover:bg-sky-600/50 hover:text-white"
        } ${className}`}
      >
        <span className="flex items-center">
          <span className={`${isActive ? "text-white" : "text-blue-200"}`}>
            {icon}
          </span>
          {isSidebarOpen && (
            <span className="ml-3 text-left">{message}</span>
          )}
        </span>
        {isCollapsible && isSidebarOpen && (
          <span
            className={`ml-auto transform transition-transform duration-200 ${
              isOpen || shouldStayOpen ? "rotate-180" : ""
            }`}
          >
            <FiChevronDown className="text-blue-200" />
          </span>
        )}
      </button>

      {isCollapsible && isSidebarOpen && (
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen || shouldStayOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="pl-6 py-1 space-y-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarItem;