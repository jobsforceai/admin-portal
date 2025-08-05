import "./globals.css";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl">Superadmin Portal</h1>
            <nav className="ml-10">
              <Link href="/superadmin/councellers" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Councellers
              </Link>
              <Link href="/superadmin/agents" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Agents
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
