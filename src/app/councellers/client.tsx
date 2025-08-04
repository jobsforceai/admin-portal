
"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { Counceller, PaginatedResponse } from "@/types";
import { changeApplicationStatus, changeVerificationStatus } from "@/actions/superAdminActions";

interface CouncellersClientPageProps {
  data: PaginatedResponse<Counceller>;
}

export default function CouncellersClientPage({ data }: CouncellersClientPageProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.replace(`/councellers?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/councellers?${params.toString()}`);
  };

  const handleApplicationStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      try {
        await changeApplicationStatus(id, status);
        toast.success("Application status updated successfully");
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred");
        }
      }
    });
  };

  const handleVerificationStatusChange = (id: string, isVerified: boolean) => {
    startTransition(async () => {
      try {
        await changeVerificationStatus(id, isVerified);
        toast.success("Verification status updated successfully");
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred");
        }
      }
    });
  };

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <Toaster richColors />
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Councellers</h1>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="border p-2 rounded text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="overflow-x-auto rounded-lg border border-gray-200"
      >
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Application Status</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Verification Status</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.data.map((counceller) => (
              <motion.tr
                key={counceller._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`${isPending ? "opacity-50" : ""} hover:bg-gray-50`}
              >
                <td className="py-4 px-4 border-b border-gray-200 text-sm text-gray-900">{counceller.name}</td>
                <td className="py-4 px-4 border-b border-gray-200 text-sm text-gray-700">{counceller.email}</td>
                <td className="py-4 px-4 border-b border-gray-200">
                  <select
                    value={counceller.applicationStatus}
                    onChange={(e) => handleApplicationStatusChange(counceller._id, e.target.value)}
                    disabled={isPending}
                    className="border p-2 rounded bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="py-4 px-4 border-b border-gray-200">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      counceller.isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {counceller.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </td>
                <td className="py-4 px-4 border-b border-gray-200">
                  <button
                    onClick={() => handleVerificationStatusChange(counceller._id, !counceller.isVerified)}
                    disabled={isPending}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    {counceller.isVerified ? "Unverify" : "Verify"}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(data.pagination.page - 1)}
          disabled={data.pagination.page <= 1}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {data.pagination.page} of {data.pagination.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(data.pagination.page + 1)}
          disabled={data.pagination.page >= data.pagination.totalPages}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
