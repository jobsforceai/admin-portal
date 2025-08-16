"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface Admin {
  id: string;
  roles: ("product_manager" | "hiring_manager")[];
  iat: number;
}

export function useAdmin() {
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<Admin>(token);
        setAdmin(decodedToken);
      } catch (error) {
        console.error("Failed to decode token:", error);
        setAdmin(null);
      }
    }
  }, []);

  return admin;
}
