import React from "react";
import Sidebar from "./general/layout/Sidebar";
import Head from "next/head";
import { SubMenuItem } from "@/interfaces/General";

type Props = {
  children: React.ReactNode;
  headerTitle: string;
  subMenus?: SubMenuItem[];
};

const AppLayout: React.FC<Props> = ({ headerTitle, children }) => {
  return (
    <div className="flex h-screen bg-white text-gray-800">
      <Head>
        <title>{headerTitle ?? ""}</title>
      </Head>

      <aside className="w-64 bg-sky-700/90  text-white z-20 pr-2">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white px-6 py-8 flex items-center ml-4">
          <h1 className="text-3xl font-semibold text-gray-800">{headerTitle}</h1>
        </header>
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
