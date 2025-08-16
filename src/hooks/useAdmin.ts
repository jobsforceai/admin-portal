"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { usePathname } from "next/navigation";

interface Admin {
  id: string;
  roles: ("product_manager" | "hiring_manager")[];
  iat: number;
}

export function useAdmin() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    const rolesString = sessionStorage.getItem("adminRoles");

    if (token && rolesString) {
      try {
        const decodedToken = jwtDecode<{ id: string; iat: number }>(token);
        const roles = JSON.parse(rolesString);
        setAdmin({ ...decodedToken, roles });
      } catch (error) {
        console.error("Failed to decode token or parse roles:", error);
        setAdmin(null);
      }
    }
  }, [pathname]);

  return admin;
}
