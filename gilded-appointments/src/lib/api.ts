const rawBase = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const API_URL = rawBase.replace(/\/+$/, "");

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function request(path: string, options: RequestOptions = {}) {
  if (!API_URL || API_URL.trim() === "") {
    const errorMsg = "❌ Backend URL not configured. Check your .env file.";
    console.error("[API Error]", errorMsg);
    console.error("[API Debug] VITE_API_URL:", import.meta.env.VITE_API_URL);
    throw new Error(errorMsg);
  }
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.headers) {
    const merged = new Headers(options.headers as HeadersInit);
    merged.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // attach token header automatically if provided or stored in localStorage
  const storedToken = localStorage.getItem("token");
  if (options.token || storedToken) {
    headers["Authorization"] = `Bearer ${options.token || storedToken}`;
  }

  const pathNormalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_URL}${pathNormalized}`;
  console.log("[API]", options.method || "GET", url);

  let res;
  try {
    res = await fetch(url, { ...options, headers, timeout: 15000 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[API Error] Network error:", msg);
    console.error("[API Debug] Failed URL:", url);
    console.error("[API Debug] Is backend running on", API_URL, "?");
    
    if (msg.includes("Failed to fetch")) {
      throw new Error(`Cannot connect to backend at ${API_URL}. Make sure the backend server is running.`);
    }
    throw new Error(`Network error: ${msg}`);
  }

  let data;
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await res.json();
    }
  } catch {
    // non-json response
    console.log("[API] Response is not JSON");
  }

  console.log("[API] Status:", res.status, "Response:", data);

  if (!res.ok) {
    const message = data?.message || res.statusText || "Request failed";
    console.error("[API Error]", message);
    throw new Error(message);
  }

  return data;
}

export { API_URL };
