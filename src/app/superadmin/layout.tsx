"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const password = sessionStorage.getItem("superAdminPassword");
    if (!password && pathname !== "/superadmin/login") {
      router.replace("/superadmin/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [pathname, router]);

  if (!isLoggedIn && pathname !== "/superadmin/login") {
    return null; // or a loading spinner
  }

  if (pathname === "/superadmin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold">Super Admin</div>
        <nav className="flex-1 p-2">
          <ul>
            <li>
              <Link href="/superadmin/councellers" className={`block p-2 rounded hover:bg-gray-700 ${pathname.includes('/councellers') ? 'bg-gray-900' : ''}`}>
                Councellers
              </Link>
            </li>
            <li>
              <Link href="/superadmin/agents" className={`block p-2 rounded hover:bg-gray-700 ${pathname.includes('/agents') ? 'bg-gray-900' : ''}`}>
                Agents
              </Link>
            </li>
            <li>
              <Link href="/superadmin/jobs/create" className={`block p-2 rounded hover:bg-gray-700 ${pathname.includes('/jobs') ? 'bg-gray-900' : ''}`}>
                Create Job
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}