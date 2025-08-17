"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrbitPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/orbit/login");
  }, [router]);
  return null;
}