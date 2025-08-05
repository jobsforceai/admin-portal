"use client";

const getApiUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.");
  }
  return backendUrl;
};

export async function handleSuperAdminLogin(password: string): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-superadmin-password": password,
      },
    });

    if (response.ok) {
      sessionStorage.setItem("superAdminPassword", password);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("An error occurred during login:", error);
    return false;
  }
}

export function handleSuperAdminLogout(): void {
  sessionStorage.removeItem("superAdminPassword");
  window.location.href = "/superadmin/login";
}

export async function superAdminApiRequest(path: string, opts: RequestInit = {}): Promise<Response> {
  const password = sessionStorage.getItem("superAdminPassword");

  if (!password) {
    window.location.href = "/superadmin/login";
    // Return a promise that will never resolve
    return new Promise(() => {});
  }

  const headers = new Headers(opts.headers as HeadersInit);
  headers.set("x-superadmin-password", password);

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
    handleSuperAdminLogout();
  }

  return response;
}
