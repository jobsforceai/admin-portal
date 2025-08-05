"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SuperAdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/superadmin/login");
  }, [router]);
  return null;
}
