"use client";

const getApiUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.");
  }
  return backendUrl;
};

export async function handleAdminLogin(email: string, password: string): Promise<string[] | null> {
  try {
    const response = await fetch(`${getApiUrl()}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data.token && data.data.roles) {
        sessionStorage.setItem("adminToken", data.data.token);
        sessionStorage.setItem("adminRoles", JSON.stringify(data.data.roles));
        return data.data.roles;
      }
      return null;
    } else {
      return null;
    }
  } catch (error) {
    console.error("An error occurred during login:", error);
    return null;
  }
}

export function handleAdminLogout(): void {
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminRoles");
  window.location.href = "/orbit/login";
}

export async function adminApiRequest(path: string, opts: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    window.location.href = "/orbit/login";
    // Return a promise that will never resolve
    return new Promise(() => {});
  }

  const headers = new Headers(opts.headers as HeadersInit);
  headers.set("Authorization", `Bearer ${token}`);

  const body = opts.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const hasContentType = [...headers.keys()].some((h) => h.toLowerCase() === "content-type");

  if (body != null && !hasContentType && !isFormData && !(body instanceof Blob) && !(body instanceof ArrayBuffer) && !(body instanceof URLSearchParams)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...opts,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    handleAdminLogout();
  }

  return response;
}

export async function adminApiDelete(path: string, opts: RequestInit = {}): Promise<Response> {
  return adminApiRequest(path, { ...opts, method: "DELETE" });
}

import { Assignment, GradingData } from "@/types";

export async function adminApiPost(path: string, body: Assignment | GradingData, opts: RequestInit = {}): Promise<Response> {
  return adminApiRequest(path, {
    ...opts,
    method: "POST",
    body: JSON.stringify(body),
  });
}
