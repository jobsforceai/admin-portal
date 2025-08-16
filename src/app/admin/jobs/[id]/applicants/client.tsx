"use client";

import { useEffect, useState } from "react";
import { getJobWithApplicants } from "@/actions/adminActions";
import { Job, JobApplication } from "@/types";
import { Toaster, toast } from "sonner";
import FormattedJobDescription from "@/components/FormattedJobDescription";
import { motion, Variants } from "framer-motion";
import {
  Award,
  Briefcase,
  Clock,
  DollarSign,
  FileText,
  Loader,
  Mail,
  MapPin,
  Phone,
  Target,
  Users,
} from "lucide-react";

export default function JobApplicantsClientPage({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      setIsLoading(true);
      const token = sessionStorage.getItem("adminToken");
      const result = await getJobWithApplicants(jobId, token);

      if (result.success) {
        setJob(result.data.job);
        setApplicants(result.data.applicants);
      } else {
        toast.error(result.message);
      }
      setIsLoading(false);
    };

    fetchJobData();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader className="animate-spin text-blue-500 h-12 w-12" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center mt-10 text-red-500 text-xl">
        Job not found.
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Toaster richColors position="top-center" />

      {/* Header */}
      <div className="pt-24 pb-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {job.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{job.domain}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{job.jobType}</span>
            </div>
            {(job.minPay || job.maxPay) && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>
                  {job.minPay && job.maxPay
                    ? `₹${job.minPay} - ₹${job.maxPay}`
                    : job.minPay
                    ? `From ₹${job.minPay}`
                    : `Up to ₹${job.maxPay}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              <motion.section
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    About This Role
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {job.description}
                </p>
              </motion.section>

              <motion.section
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detailed Description
                  </h2>
                </div>
                <FormattedJobDescription description={job.detailedDescription} />
              </motion.section>

              <motion.section
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Who Can Apply
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {job.whoCanApply}
                </p>
              </motion.section>
            </div>

            {/* Sidebar */}
            <motion.aside
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 space-y-6 lg:sticky top-8"
            >
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Quick Info
                </h3>
                <div className="space-y-3 text-gray-700">
                  {[
                    ["Job Type", job.jobType],
                    [
                      "Salary Range",
                      job.minPay && job.maxPay
                        ? `₹${job.minPay} - ₹${job.maxPay}`
                        : job.minPay
                        ? `From ₹${job.minPay}`
                        : job.maxPay
                        ? `Up to ₹${job.maxPay}`
                        : "Not specified",
                    ],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>

          {/* Applicants Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              {applicants.length} Applicants
            </h2>
            {applicants.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {applicants.map((applicant) => (
                  <motion.div
                    key={applicant._id}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
                    variants={itemVariants}
                  >
                    <h3 className="text-xl font-bold text-gray-900">
                      {`${applicant.firstName} ${applicant.lastName}`}
                    </h3>
                    <div className="mt-4 space-y-3 text-gray-600">
                      <p className="flex items-center">
                        <Mail className="h-5 w-5 mr-3 text-blue-500" />
                        {applicant.email}
                      </p>
                      <p className="flex items-center">
                        <Phone className="h-5 w-5 mr-3 text-blue-500" />
                        {applicant.phone}
                      </p>
                      <p className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-blue-500" />
                        {applicant.location}
                      </p>
                      <a
                        href={applicant.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-700 font-semibold transition-colors duration-300 pt-2"
                      >
                        <FileText className="h-5 w-5 mr-3" />
                        View Resume
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200">
                <p className="text-lg">No applicants for this job yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}