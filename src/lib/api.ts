import { cookies } from "next/headers";

export async function AuthApiRequest(
  path: string,
  opts: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(opts.headers as HeadersInit);
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  // Conditionally set JSON headers
  const body = opts.body;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const hasContentType = [...headers.keys()].some(
    (h) => h.toLowerCase() === "content-type"
  );

  if (
    body != null &&
    !hasContentType &&
    !isFormData &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams)
  ) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token.value}`);
  }

  // Ensure the backend URL is defined
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.");
  }

  return fetch(`${backendUrl}${path}`, {
    ...opts,
    credentials: "include",
    headers,
  });
}
