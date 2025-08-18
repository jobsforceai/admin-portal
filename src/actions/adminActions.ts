"use server";

import { adminApiRequestServer, adminAssignmentApiRequestServer } from "@/lib/adminApi.server";
import { Assignment, GradedAnswer, Job } from "@/types";
import { revalidatePath } from "next/cache";

export async function createJob(
  jobData: Omit<Job, "_id" | "createdAt" | "updatedAt">,
  token?: string | null
) {
  try {
    const res = await adminApiRequestServer("/jobs", token, {
      method: "POST",
      body: JSON.stringify(jobData),
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, message: error.message || "Failed to create job" };
    }

    const data = await res.json();
    revalidatePath("/orbit/jobs");
    return { success: true, message: "Job created successfully", data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function getAllJobs(token?: string | null) {
  try {
    const res = await adminApiRequestServer("/jobs", token);

    if (!res.ok) {
      const error = await res.json();
      return { success: false, message: error.message || "Failed to fetch jobs" };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function getJobWithApplicants(jobId: string, token?: string | null) {
  try {
    const res = await adminApiRequestServer(`/jobs/${jobId}/applicants`, token);

    if (!res.ok) {
      const error = await res.json();
      return { success: false, message: error.message || "Failed to fetch job applicants" };
    }

    const data = await res.json();
    console.log("Applicants Data from API:", data);
    return { success: true, data: data.data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function deleteJob(jobId: string, token?: string | null) {
  try {
    const res = await adminApiRequestServer(`/jobs/${jobId}`, token, {
      method: "DELETE",
    });

    let body;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok) {
      return { success: false, message: body?.message || "Failed to delete job" };
    }

    revalidatePath("/orbit/jobs");
    return { success: true, message: body?.message || "Job deleted successfully" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function createAssignment(jobId: string, assignmentData: Assignment, token?: string | null) {
  console.log("Creating assignment for jobId:", jobId);
  console.log("Assignment data:", JSON.stringify(assignmentData, null, 2));
  
  try {
    const res = await adminAssignmentApiRequestServer(`/admin/jobs/${jobId}/assignment`, token, {
      method: "POST",
      body: JSON.stringify(assignmentData),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("API Error:", error);
      return { success: false, message: error.message || "Failed to create assignment" };
    }

    const data = await res.json();
    revalidatePath(`/orbit/jobs/${jobId}/assignment`);
    return { success: true, message: "Assignment created successfully", data };
  } catch (error: unknown) {
    console.error("Caught an exception:", error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function getAssignment(jobId: string, token?: string | null) {
  try {
    const res = await adminAssignmentApiRequestServer(`/admin/jobs/${jobId}/assignment`, token);

    if (!res.ok) {
      if (res.status === 404) {
        return { success: true, data: null };
      }
      const error = await res.json();
      return { success: false, message: error.message || "Failed to fetch assignment" };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function updateAssignment(jobId: string, assignmentData: Assignment, token?: string | null) {
  try {
    const res = await adminAssignmentApiRequestServer(`/admin/jobs/${jobId}/assignment`, token, {
      method: "PUT",
      body: JSON.stringify(assignmentData),
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, message: error.message || "Failed to update assignment" };
    }

    const data = await res.json();
    revalidatePath(`/orbit/jobs/${jobId}/assignment`);
    return { success: true, message: "Assignment updated successfully", data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function assignTestToApplicant(applicationId: string, token?: string | null) {
  try {
    const res = await adminApiRequestServer(`/applications/${applicationId}/assign-test`, token, {
      method: "PATCH",
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, message: error.message || "Failed to assign test" };
    }

    const data = await res.json();
    revalidatePath(`/orbit/jobs/`); // Revalidate the main jobs page to be safe
    return { success: true, message: "Test assigned successfully", data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function getSubmission(applicationId: string, token?: string | null) {
  try {
    const res = await adminAssignmentApiRequestServer(`/admin/applications/${applicationId}/submission`, token);

    if (!res.ok) {
      if (res.status === 404) {
        return { success: true, data: null, message: "No submission found for this applicant." };
      }
      const error = await res.json();
      return { success: false, message: error.message || "Failed to fetch submission" };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function gradeSubmission(applicationId: string, gradingData: { gradedAnswers: GradedAnswer[], graderNotes?: string }, token?: string | null) {
  try {
    const res = await adminAssignmentApiRequestServer(`/admin/applications/${applicationId}/grade`, token, {
      method: "POST",
      body: JSON.stringify(gradingData),
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, message: error.message || "Failed to grade submission" };
    }

    const data = await res.json();
    revalidatePath(`/orbit/jobs/`); // Revalidate to update submission status potentially
    return { success: true, message: "Submission graded successfully", data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}