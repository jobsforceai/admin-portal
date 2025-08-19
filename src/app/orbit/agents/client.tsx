"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { Agent, PaginatedResponse } from "@/types";
import { adminApiRequest } from "@/lib/adminApi";
import { useAdmin } from "@/hooks/useAdmin";

export default function AgentsClientPage() {
  const admin = useAdmin();
  const [data, setData] = useState<PaginatedResponse<Agent> | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");

  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    if (admin && admin.roles.includes("product_manager")) {
      const fetchData = async () => {
        try {
          const res = await adminApiRequest(`/agents?page=${page}&limit=10&search=${search}`);
          if (!res.ok) {
            throw new Error("Failed to fetch agents");
          }
          const agentsData = await res.json();
          setData(agentsData);
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("An unknown error occurred");
          }
        }
      };
      fetchData();
    }
  }, [page, search, admin]);

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.replace(`/orbit/agents?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/orbit/agents?${params.toString()}`);
  };

  const handleApplicationStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      try {
        const res = await adminApiRequest(`/agent/${id}/application-status`, {
          method: "PATCH",
          body: JSON.stringify({ applicationStatus: status }),
        });
        if (!res.ok) {
          throw new Error("Failed to update status");
        }
        toast.success("Application status updated successfully");
        // Refetch data
        const updatedRes = await adminApiRequest(`/agents?page=${page}&limit=10&search=${search}`);
        const updatedData = await updatedRes.json();
        setData(updatedData);
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
        const res = await adminApiRequest(`/agent/${id}/verification-status`, {
          method: "PATCH",
          body: JSON.stringify({ isVerified }),
        });
        if (!res.ok) {
          throw new Error("Failed to update status");
        }
        toast.success("Verification status updated successfully");
        // Refetch data
        const updatedRes = await adminApiRequest(`/agents?page=${page}&limit=10&search=${search}`);
        const updatedData = await updatedRes.json();
        setData(updatedData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred");
        }
      }
    });
  };

  const handleEmailChange = (id: string) => {
    startTransition(async () => {
      try {
        const res = await adminApiRequest(`/agent/${id}/email`, {
          method: "PATCH",
          body: JSON.stringify({ email: newEmail }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to update email");
        }
        toast.success("Email updated successfully");
        setEditingAgentId(null);
        // Refetch data
        const updatedRes = await adminApiRequest(`/agents?page=${page}&limit=10&search=${search}`);
        const updatedData = await updatedRes.json();
        setData(updatedData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred");
        }
      }
    });
  };

  const handleAssigncounsellor = () => {
    startTransition(async () => {
      try {
        const res = await adminApiRequest("/agents/assign-counsellors", {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to assign counsellor");
        }
        toast.success(data.message);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred");
        }
      }
    });
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  if (!admin.roles.includes("product_manager")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-2xl text-red-500">Access Denied</p>
      </div>
    );
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <Toaster richColors />
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Agents</h1>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="border p-2 rounded text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAssigncounsellor}
          disabled={isPending}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
        >
          Assign counsellor
        </button>
      </div>
      {/* Table for medium and large screens */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden md:block overflow-x-auto rounded-lg border border-gray-200"
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
            {data.data.map((agent) => (
              <motion.tr
                key={agent._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`${isPending ? "opacity-50" : ""} hover:bg-gray-50`}
              >
                <td className="py-4 px-4 border-b border-gray-200 text-sm text-gray-900">{agent.name}</td>
                <td className="py-4 px-4 border-b border-gray-200 text-sm text-gray-700">
                  {editingAgentId === agent._id ? (
                    <input
                      type="email"
                      defaultValue={agent.email}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="border p-2 rounded text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    agent.email
                  )}
                </td>
                <td className="py-4 px-4 border-b border-gray-200">
                  <select
                    value={agent.applicationStatus}
                    onChange={(e) => handleApplicationStatusChange(agent._id, e.target.value)}
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
                      agent.isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {agent.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </td>
                <td className="py-4 px-4 border-b border-gray-200">
                  <button
                    onClick={() => handleVerificationStatusChange(agent._id, !agent.isVerified)}
                    disabled={isPending}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    {agent.isVerified ? "Unverify" : "Verify"}
                  </button>
                  {editingAgentId === agent._id ? (
                    <button
                      onClick={() => handleEmailChange(agent._id)}
                      disabled={isPending}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 ml-2"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingAgentId(agent._id);
                        setNewEmail(agent.email);
                      }}
                      disabled={isPending}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400 ml-2"
                    >
                      Edit Email
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Cards for small screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {data.data.map((agent) => (
          <motion.div
            key={agent._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white p-4 rounded-lg shadow ${isPending ? "opacity-50" : ""}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-gray-800">{agent.name}</h2>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  agent.isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {agent.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
            {editingAgentId === agent._id ? (
              <input
                type="email"
                defaultValue={agent.email}
                onChange={(e) => setNewEmail(e.target.value)}
                className="border p-2 rounded text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mb-2"
              />
            ) : (
              <p className="text-sm text-gray-600 mb-2">{agent.email}</p>
            )}
            <div className="mb-4">
              <select
                value={agent.applicationStatus}
                onChange={(e) => handleApplicationStatusChange(agent._id, e.target.value)}
                disabled={isPending}
                className="border p-2 rounded bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleVerificationStatusChange(agent._id, !agent.isVerified)}
                disabled={isPending}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {agent.isVerified ? "Unverify" : "Verify"}
              </button>
              {editingAgentId === agent._id ? (
                <button
                  onClick={() => handleEmailChange(agent._id)}
                  disabled={isPending}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingAgentId(agent._id);
                    setNewEmail(agent.email);
                  }}
                  disabled={isPending}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400"
                >
                  Edit Email
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
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
