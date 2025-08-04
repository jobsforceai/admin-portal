
"use server";

import { ApiRequest } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { Agent, Counceller, PaginatedResponse } from "@/types";

// ====================================== Counceller Actions ======================================

export async function getAllCouncellers(page = 1, limit = 10, search = ""): Promise<PaginatedResponse<Counceller>> {
  try {
    const res = await ApiRequest(`/councellers?page=${page}&limit=${limit}&search=${search}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch councellers");
    }
    return await res.json();
  } catch (error: unknown) {
    console.error("Error fetching councellers:", error);
    if (error instanceof Error) {
      // You might want to return a more specific error structure
      return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }, error: error.message };
    }
    return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }, error: "An unknown error occurred" };
  }
}

export async function changeApplicationStatus(councellerId: string, applicationStatus: string) {
  const res = await ApiRequest(`/counceller/${councellerId}/application-status`, {
    method: "PATCH",
    body: JSON.stringify({ applicationStatus }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update status");
  }
  revalidatePath("/councellers");
  return await res.json();
}

export async function changeVerificationStatus(councellerId: string, isVerified: boolean) {
  const res = await ApiRequest(`/counceller/${councellerId}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ isVerified }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update status");
  }
  revalidatePath("/councellers");
  return await res.json();
}

// ====================================== Agent Actions ======================================

export async function getAllAgents(page = 1, limit = 10, search = ""): Promise<PaginatedResponse<Agent>> {
  try {
    const res = await ApiRequest(`/agents?page=${page}&limit=${limit}&search=${search}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch agents");
    }
    return await res.json();
  } catch (error: unknown) {
    console.error("Error fetching agents:", error);
    if (error instanceof Error) {
      return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }, error: error.message };
    }
    return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }, error: "An unknown error occurred" };
  }
}

export async function changeAgentApplicationStatus(agentId: string, applicationStatus: string) {
  const res = await ApiRequest(`/agent/${agentId}/application-status`, {
    method: "PATCH",
    body: JSON.stringify({ applicationStatus }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update status");
  }
  revalidatePath("/agents");
  return await res.json();
}

export async function changeAgentVerificationStatus(agentId: string, isVerified: boolean) {
  const res = await ApiRequest(`/agent/${agentId}/verification-status`, {
    method: "PATCH",
    body: JSON.stringify({ isVerified }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update status");
  }
  revalidatePath("/agents");
  return await res.json();
}
