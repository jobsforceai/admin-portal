"use server";

import { superAdminApiRequestServer } from "@/lib/superAdminApi.server";
import { Job } from "@/types";
import { revalidatePath } from "next/cache";

export async function createJob(
  jobData: Omit<Job, "_id" | "createdAt" | "updatedAt">,
  password?: string | null
) {
  try {
    const res = await superAdminApiRequestServer("/jobs", password, {
      method: "POST",
      body: JSON.stringify(jobData),
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, message: error.message || "Failed to create job" };
    }

    const data = await res.json();
    revalidatePath("/superadmin/jobs"); // Assuming you'll have a jobs list page
    return { success: true, message: "Job created successfully", data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}
