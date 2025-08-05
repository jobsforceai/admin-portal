"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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

  return <>{children}</>;
}
