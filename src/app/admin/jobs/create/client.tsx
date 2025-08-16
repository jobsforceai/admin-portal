"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { createJob } from "@/actions/adminActions";
import { useAdmin } from "@/hooks/useAdmin";

type JobType = "Full-time" | "Part-time" | "Internship";
type LocationType = "Remote" | "Hybrid" | "On-site";

export default function CreateJobClientPage() {
  const admin = useAdmin();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState<LocationType>("On-site");
  const [minPay, setMinPay] = useState<number | undefined>(undefined);
  const [maxPay, setMaxPay] = useState<number | undefined>(undefined);
  const [jobType, setJobType] = useState<JobType>("Full-time");
  const [whoCanApply, setWhoCanApply] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const skillsArray = skills.split(",").map((skill) => skill.trim());
      const jobData = {
        title,
        domain,
        description,
        detailedDescription,
        skills: skillsArray,
        location,
        minPay,
        maxPay,
        jobType,
        whoCanApply,
      };

      const token = sessionStorage.getItem("adminToken");
      const result = await createJob(jobData, token);

      if (result.success) {
        toast.success(result.message);
        // Clear form
        setTitle("");
        setDomain("");
        setDescription("");
        setDetailedDescription("");
        setSkills("");
        setLocation("On-site");
        setMinPay(undefined);
        setMaxPay(undefined);
        setJobType("Full-time");
        setWhoCanApply("");
      } else {
        toast.error(result.message);
      }
    });
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  if (!admin.roles.includes("hiring_manager")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-2xl text-red-500">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <Toaster richColors />
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Create Job</h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
            </div>
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Domain</label>
              <input type="text" id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"></textarea>
          </div>
          <div>
            <label htmlFor="detailedDescription" className="block text-sm font-medium text-gray-700">Detailed Description</label>
            <textarea id="detailedDescription" value={detailedDescription} onChange={(e) => setDetailedDescription(e.target.value)} required rows={6} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"></textarea>
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
            <input type="text" id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <select id="location" value={location} onChange={(e) => setLocation(e.target.value as LocationType)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black">
                <option>On-site</option>
                <option>Remote</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">Job Type</label>
              <select id="jobType" value={jobType} onChange={(e) => setJobType(e.target.value as JobType)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minPay" className="block text-sm font-medium text-gray-700">Minimum Pay (Optional)</label>
              <input type="number" id="minPay" value={minPay === undefined ? '' : minPay} onChange={(e) => setMinPay(e.target.value === '' ? undefined : Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
            </div>
            <div>
              <label htmlFor="maxPay" className="block text-sm font-medium text-gray-700">Maximum Pay (Optional)</label>
              <input type="number" id="maxPay" value={maxPay === undefined ? '' : maxPay} onChange={(e) => setMaxPay(e.target.value === '' ? undefined : Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
            </div>
          </div>
          <div>
            <label htmlFor="whoCanApply" className="block text-sm font-medium text-gray-700">Who Can Apply</label>
            <input type="text" id="whoCanApply" value={whoCanApply} onChange={(e) => setWhoCanApply(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
          </div>
          <div>
            <button type="submit" disabled={isPending} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
              {isPending ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
