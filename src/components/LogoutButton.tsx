"use client";

import { handleSuperAdminLogout } from "@/lib/superAdminApi";

export default function LogoutButton() {
  return (
    <button
      onClick={handleSuperAdminLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
    >
      Logout
    </button>
  );
}
