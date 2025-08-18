"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { getJobWithApplicants, assignTestToApplicant } from "@/actions/adminActions";
import { Job, JobApplication } from "@/types";
import { Toaster, toast } from "sonner";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Briefcase,
  Clock,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  Target,
  Users,
  Award,
} from "lucide-react";
import FormattedJobDescription from "@/components/FormattedJobDescription";
import SubmissionGradingModal from "@/components/SubmissionGradingModal";

type JobWithApplicants = Job & {
  applicants: JobApplication[];
};

export default function ApplicantsClientPage({ jobId }: { jobId: string }) {
  const admin = useAdmin();
  const [job, setJob] = useState<JobWithApplicants | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigningTest, startTestAssignmentTransition] = useTransition();
  const [assigningTestId, setAssigningTestId] = useState<string | null>(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    null
  );

  const fetchJobWithApplicants = useCallback(async () => {
    setIsLoading(true);
    const token = sessionStorage.getItem("adminToken");
    const result = await getJobWithApplicants(jobId, token);

    if (result.success && result.data) {
      const flattenedData = {
        ...result.data.job,
        applicants: result.data.applicants,
      };
      setJob(flattenedData);
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  }, [jobId]);

  useEffect(() => {
    if (admin && admin.roles.includes("hiring_manager")) {
      fetchJobWithApplicants();
    } else if (admin) {
      setIsLoading(false);
    }
  }, [admin, fetchJobWithApplicants]);

  const handleAssignTest = (applicationId: string) => {
    setAssigningTestId(applicationId);
    startTestAssignmentTransition(async () => {
      const token = sessionStorage.getItem("adminToken");
      const result = await assignTestToApplicant(applicationId, token);

      if (result.success) {
        toast.success(result.message);
        // Update the UI to reflect the change
        setJob((prevJob) => {
          if (!prevJob) return null;
          return {
            ...prevJob,
            applicants: prevJob.applicants.map((app) =>
              app._id === applicationId
                ? { ...app, isTestAssigned: true, applicationStatus: "shortlisted" }
                : app
            ),
          };
        });
      } else {
        toast.error(result.message);
      }
      setAssigningTestId(null);
    });
  };

  const handleOpenGradingModal = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsGradingModalOpen(true);
  };

  const handleCloseGradingModal = () => {
    setSelectedApplicationId(null);
    setIsGradingModalOpen(false);
  };

  const handleGraded = () => {
    fetchJobWithApplicants();
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

  if (!job) {
    return <p className="text-center text-gray-500">Job not found.</p>;
  }

  return (
    <div className="min-h-screen text-gray-800 bg-gray-50 relative overflow-hidden p-4 sm:p-6 md:p-8">
      <Toaster richColors />
      <div className="container mx-auto px-4 relative z-10">
        {/* Job Header */}
        <div className="pt-12 pb-8 relative">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {job.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <span className="font-medium">{job.domain}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span>{job.jobType}</span>
            </div>
            {(job.minPay || job.maxPay) && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span>
                  {job.minPay && job.maxPay
                    ? `${job.minPay} - ${job.maxPay}`
                    : job.minPay
                    ? `From ${job.minPay}`
                    : `Up to ${job.maxPay}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="py-8 relative">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <section className="bg-white backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    About This Role
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {job.description}
                </p>
              </section>

              <section className="bg-white backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detailed Description
                  </h2>
                </div>
                <FormattedJobDescription
                  description={job.detailedDescription}
                />
              </section>

              <section className="bg-white backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Who Can Apply
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {job.whoCanApply}
                </p>
              </section>
            </div>

            <aside className="lg:col-span-2 space-y-6">
              <div className="bg-white backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Quick Info
                </h3>
                <div className="space-y-3 text-gray-700">
                  {[
                    ["Job Type", job.jobType],
                    [
                      "Salary Range",
                      job.minPay && job.maxPay
                        ? `$${job.minPay} - $${job.maxPay}`
                        : job.minPay
                        ? `From $${job.minPay}`
                        : job.maxPay
                        ? `Up to $${job.maxPay}`
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

              <div className="bg-white backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium border border-indigo-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Applicants Section */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Applicants</h2>
          {job.applicants && job.applicants.length > 0 ? (
            <div className="space-y-4">
              {job.applicants.map((application) => (
                <div
                  key={application._id}
                  className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900">{`${application.firstName} ${application.lastName}`}</h3>
                    <div className="flex items-center text-gray-600 mt-2 text-sm">
                      <Mail size={14} className="mr-2" />
                      <span>{application.email}</span>
                      <span className="mx-2">|</span>
                      <Phone size={14} className="mr-2" />
                      <span>{application.phone}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          application.applicationStatus === "shortlisted"
                            ? "bg-green-100 text-green-800"
                            : application.applicationStatus === "graded"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {application.applicationStatus || "applied"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-shrink-0 items-center space-x-4">
                    {application.resume && (
                      <a
                        href={application.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center text-sm"
                      >
                        <FileText size={16} className="mr-1" />
                        View Resume
                      </a>
                    )}
                    {application.isTestAssigned && (
                      <button
                        onClick={() => handleOpenGradingModal(application._id)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 flex items-center text-sm"
                      >
                        View Submission
                      </button>
                    )}
                    <button
                      onClick={() => handleAssignTest(application._id)}
                      disabled={application.isTestAssigned || isAssigningTest}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center text-sm"
                    >
                      {application.isTestAssigned ? (
                        <>
                          <CheckCircle size={16} className="mr-1" />
                          Test Assigned
                        </>
                      ) : isAssigningTest &&
                        assigningTestId === application._id ? (
                        "Shortlisting..."
                      ) : (
                        "Shortlist for Test"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No applicants found for this job.
            </p>
          )}
        </div>
      </div>
      {isGradingModalOpen && selectedApplicationId && (
        <SubmissionGradingModal
          applicationId={selectedApplicationId}
          isOpen={isGradingModalOpen}
          onClose={handleCloseGradingModal}
          onGraded={handleGraded}
        />
      )}
    </div>
  );
}
