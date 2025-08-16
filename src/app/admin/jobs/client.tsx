"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllJobs } from "@/actions/adminActions";
import { Job } from "@/types";
import { Toaster, toast } from "sonner";
import { useAdmin } from "@/hooks/useAdmin";

export default function AllJobsClientPage() {
  const admin = useAdmin();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (admin && admin.roles.includes("hiring_manager")) {
      const fetchJobs = async () => {
        setIsLoading(true);
        const token = sessionStorage.getItem("adminToken");
        const result = await getAllJobs(token);

        if (result.success) {
          setJobs(result.data.data);
        } else {
          toast.error(result.message);
        }
        setIsLoading(false);
      };

      fetchJobs();
    } else if (admin) {
      setIsLoading(false);
    }
  }, [admin]);

  if (isLoading || !admin) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!admin.roles.includes("hiring_manager")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-2xl text-red-500">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-black">
      <Toaster richColors />
      <h1 className="text-2xl font-bold mb-6 text-gray-800">All Jobs</h1>
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
              <p className="text-gray-600 mt-1">{job.domain}</p>
              <p className="text-gray-700 mt-4">{job.description}</p>
              <div className="mt-4">
                <Link
                  href={`/admin/jobs/${job._id}/applicants`}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View Applicants
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No jobs found.</p>
      )}
    </div>
  );
}
