import { ReactNode } from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-72 min-h-screen">
        <div className="p-10 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
