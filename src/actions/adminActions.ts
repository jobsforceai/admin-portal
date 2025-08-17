"use server";

import { adminApiRequestServer } from "@/lib/adminApi.server";
import { Job } from "@/types";
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
      // Try to parse JSON, but don't fail if body is empty (e.g., 204 No Content)
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
