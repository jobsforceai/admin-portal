const getApiUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.");
  }
  return backendUrl;
};

export async function adminApiRequestServer(path: string, token?: string | null, opts: RequestInit = {}): Promise<Response> {
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized: Missing token" }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
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

  return response;
}

export async function adminAssignmentApiRequestServer(path: string, token?: string | null, opts: RequestInit = {}): Promise<Response> {
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized: Missing token" }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
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

  const baseUrl = getApiUrl().replace('/admin', '/assignment');

  const response = await fetch(`${baseUrl}${path}`, {
    ...opts,
    headers,
  });

  return response;
}