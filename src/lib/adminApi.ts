"use client";

const getApiUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.");
  }
  return backendUrl;
};

export async function handleAdminLogin(email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        sessionStorage.setItem("adminToken", data.token);
        return true;
      }
      return false;
    } else {
      return false;
    }
  } catch (error) {
    console.error("An error occurred during login:", error);
    return false;
  }
}

export function handleAdminLogout(): void {
  sessionStorage.removeItem("adminToken");
  window.location.href = "/admin/login";
}

export async function adminApiRequest(path: string, opts: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    window.location.href = "/admin/login";
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