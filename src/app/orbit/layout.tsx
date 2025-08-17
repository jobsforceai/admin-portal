"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { useAdmin } from "@/hooks/useAdmin";

export default function OrbitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const admin = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token && pathname !== "/orbit/login") {
      router.replace("/orbit/login");
    }
  }, [pathname, router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (pathname === "/orbit/login") {
    return <>{children}</>;
  }

  // Wait for the admin object to be populated before rendering the layout
  if (!admin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  const hasProductManagerRole = admin.roles?.includes("product_manager");
  const hasHiringManagerRole = admin.roles?.includes("hiring_manager");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white w-64 flex flex-col fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="flex items-center p-4">
          <Image src="/images/logo-3d.png" alt="Jobsforce Logo" width={40} height={40} />
          <span className="ml-2 text-2xl font-bold">Jobsforce</span>
        </div>
        <nav className="flex-1 p-2">
          <ul>
            {hasProductManagerRole && (
              <>
                <li>
                  <Link href="/orbit/counsellor" className={`block p-2 rounded hover:bg-gray-700 ${pathname.includes('/counsellor') ? 'bg-gray-900' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                    Counsellors
                  </Link>
                </li>
                <li>
                  <Link href="/orbit/agents" className={`block p-2 rounded hover:bg-gray-700 ${pathname.includes('/agents') ? 'bg-gray-900' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                    Agents
                  </Link>
                </li>
              </>
            )}
            {hasHiringManagerRole && (
              <>
                <li>
                  <Link href="/orbit/jobs/create" className={`block p-2 rounded hover:bg-gray-700 ${pathname.includes('/jobs/create') ? 'bg-gray-900' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                    Create Job
                  </Link>
                </li>
                <li>
                  <Link href="/orbit/jobs" className={`block p-2 rounded hover:bg-gray-700 ${pathname === '/orbit/jobs' ? 'bg-gray-900' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                    All Jobs
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        <div className="p-4">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Top bar for mobile */}
        <header className="md:hidden bg-gray-800 text-white p-4 flex items-center shadow-lg">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              ></path>
            </svg>
          </button>
          <div className="text-xl font-bold ml-4">Orbit</div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
