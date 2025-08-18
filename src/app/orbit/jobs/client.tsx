"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { deleteJob, getAllJobs } from "@/actions/adminActions";
import { Job } from "@/types";
import { Toaster, toast } from "sonner";
import { useAdmin } from "@/hooks/useAdmin";
import { Briefcase, Edit, Plus, Trash2, Users } from "lucide-react";

export default function AllJobsClientPage() {
  const admin = useAdmin();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

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

  useEffect(() => {
    if (admin && admin.roles.includes("hiring_manager")) {
      fetchJobs();
    } else if (admin) {
      setIsLoading(false);
    }
  }, [admin]);

  const handleDelete = (jobId: string) => {
    if (isPending) return;
    setDeletingJobId(jobId);
    startTransition(async () => {
      const token = sessionStorage.getItem("adminToken");
      const result = await deleteJob(jobId, token);

      if (result.success) {
        toast.success(result.message);
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      } else {
        toast.error(result.message);
      }
      setDeletingJobId(null);
    });
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Jobs</h1>
        <Link href="/orbit/jobs/create" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center">
          <Plus size={18} className="mr-2" /> Create New Job
        </Link>
      </div>
      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-grow">
                <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                <div className="flex items-center text-gray-600 mt-1 text-sm">
                  <Briefcase size={16} className="mr-2" />
                  <span>{job.domain}</span>
                  <span className="mx-2">|</span>
                  <span>{job.location}</span>
                  <span className="mx-2">|</span>
                  <span>{job.jobType}</span>
                </div>
                <p className="text-gray-700 mt-3 text-sm">{job.description}</p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 flex flex-shrink-0 items-center space-x-4">
                <Link
                  href={`/orbit/jobs/${job._id}/applicants`}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center text-sm"
                >
                  <Users size={16} className="mr-1" />
                  Applicants
                </Link>
                
                {job.assignmentId ? (
                  <Link
                    href={`/orbit/jobs/${job._id}/assignment`}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit Assignment
                  </Link>
                ) : (
                  <Link
                    href={`/orbit/jobs/${job._id}/assignment`}
                    className="text-green-600 hover:text-green-800 font-medium flex items-center text-sm"
                  >
                    <Plus size={16} className="mr-1" />
                    Create Assignment
                  </Link>
                )}

                <button
                  onClick={() => handleDelete(job._id)}
                  disabled={isPending && deletingJobId === job._id}
                  className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center text-sm"
                >
                  {isPending && deletingJobId === job._id ? (
                    "Deleting..."
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </>
                  )}
                </button>
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
